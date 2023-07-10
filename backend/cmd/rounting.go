package main

import (
	"dataset/internal/db"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type HostRoutes struct {
	fiber *fiber.App
}

const emptyNameSet = "unknown"

func (app *Application) InitFiber(port int) error {
	app.host.fiber = fiber.New()
	app.host.fiber.Use(cors.New(cors.Config{
		AllowOrigins: "*", // rename
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: strings.Join([]string{
			fiber.MethodGet,
			fiber.MethodPost,
			fiber.MethodPut,
		}, ","),
	}))

	app.host.fiber.Get("/status", status)
	app.host.fiber.Get("/getDataset", app.getSet)
	app.host.fiber.Get("/getList", app.getListOfSets)

	app.host.fiber.Get("images/:s/:s", app.getImage)
	app.host.fiber.Get("downloads/:s/:s", app.getFile)

	app.host.fiber.Post("/postPhoto", app.postPhoto)
	app.host.fiber.Post("/postFile", app.postFile)
	app.host.fiber.Post("/postJSON", app.postJSON)
	//app.host.fiber.Put("/putPhoto", app.putPhoto)
	//app.host.fiber.Put("/putFile", app.putFile)
	app.host.fiber.Put("/putJSON", app.putJSON)

	app.log.Fatal(app.host.fiber.Listen(":" + strconv.Itoa(port)))
	return nil
}

func status(c *fiber.Ctx) error {
	uri := os.Getenv("MONGODB_URI")
	return c.SendString(uri)
}

func (app *Application) uploadHandler(c *fiber.Ctx, strType string, strPath string, datasetName string) error {
	nameSet := datasetName
	nameSet = regexp.MustCompile(`[^a-zA-Z0-9.]`).ReplaceAllString(nameSet, "")
	if len(nameSet) < 1 {
		c.Status(http.StatusBadGateway).SendString("dataset name should contain ASCII chars")
		return errors.New("dataset name should contain ASCII chars")
	}

	file, err := c.FormFile(strType)
	if err != nil {
		app.log.Info("Error here!", strType, strPath, datasetName, err.Error(), file)
		return err
	}
	file.Filename = regexp.MustCompile(`[^a-zA-Z0-9.]`).ReplaceAllString(file.Filename, "")
	if len(file.Filename) < 1 {
		c.Status(http.StatusBadGateway).SendString("filename should contain ASCII chars")
		return errors.New("filename should contain ASCII chars")
	}

	os.MkdirAll(filepath.Join(strPath, nameSet), os.ModeDir)
	file.Filename = filepath.Join(nameSet, file.Filename)

	err = c.SaveFile(file, filepath.Join(strPath, file.Filename))
	if err != nil {
		return err
	}
	app.log.Info("Created file in: ", filepath.Join(strPath, file.Filename))
	return nil
}

func (app *Application) deleteHandler(path string, datasetName string) error {
	fpath := filepath.Join(path, datasetName)
	err := os.RemoveAll(fpath)
	return err
}

func (app *Application) moveHandler(path string, datasetName1 string, datasetName2 string) error {
	filepath1 := filepath.Join(path, datasetName1)
	filepath2 := filepath.Join(path, datasetName2)
	return os.Rename(filepath1, filepath2)
}

func (app *Application) putJSON(c *fiber.Ctx) error {
	app.log.Info("PUT called with ", c.Query("oldName"))
	app.db.DeleteSet(c.Query("oldName"))
	fileChanged := c.Query("fileChanged")
	oldDataset := c.Query("oldName")
	newDataset := c.Query("newName")
	if fileChanged == "yes" {
		app.deleteHandler("downloads", oldDataset)
	} else {
		app.moveHandler("downloads", oldDataset, newDataset)
	}
	app.deleteHandler("images", oldDataset)
	app.postJSON(c)
	return nil
}

// postPhoto receives file from POST request,
// makes new folder "images/{dataset_name}" and
// put received file to it
func (app *Application) postPhoto(c *fiber.Ctx) error {
	name := c.Query("name", emptyNameSet)
	err := app.uploadHandler(c, "photo", "images", name)
	if err != nil {
		app.log.Info(err)
	}
	return err
}

// postFile receives file from POST request,
// makes new folder "downloads/{dataset_name}" and
// put received file to it
func (app *Application) postFile(c *fiber.Ctx) error {
	name := c.Query("name", emptyNameSet)
	err := app.uploadHandler(c, "upload", "downloads", name)
	if err != nil {
		app.log.Info(err)
	}
	return err
}

func (app *Application) postJSON(c *fiber.Ctx) error {
	var set db.Set
	err := c.BodyParser(&set)
	if err != nil {
		app.log.Info(err)
		return err
	}
	set.Name.Name = regexp.MustCompile(`[^a-zA-Z0-9.]`).ReplaceAllString(set.Name.Name, "")
	if len(set.Name.Name) < 1 {
		c.Status(http.StatusBadGateway).SendString("name should contain ASCII chars")
		return errors.New("name should contain ASCII chars")
	}
	for i := 0; i < len(set.ImagePreviewName); i++ {
		if str, ok := set.ImagePreviewName[i].Value.(string); ok {
			str = regexp.MustCompile(`[^a-zA-Z0-9.]`).ReplaceAllString(str, "")
			if len(str) < 1 {
				c.Status(http.StatusBadGateway).SendString("image name should contain ASCII chars")
				return errors.New("image name should contain ASCII chars")
			}
			app.log.Info("Changed Image Link from ", set.ImagePreviewName[i].Value, " to ", str)
			set.ImagePreviewName[i].Value = str
		}
	}
	if str, ok := set.DownloadLink.Value.(string); ok {
		if len(str) > 0 {
			str = regexp.MustCompile(`[^a-zA-Z0-9.]`).ReplaceAllString(str, "")
			if len(str) < 1 {
				c.Status(http.StatusBadGateway).SendString("download name should contain ASCII chars")
				return errors.New("download name should contain ASCII chars")
			}
			app.log.Info("Changed Download Link from ", set.DownloadLink.Value, " to ", str)
			set.DownloadLink.Value = str
		}
	}

	fmt.Println(set)

	if err := app.db.PushSet(set); err != nil {
		app.log.Info(err)
		return err
	}

	return nil
}
