package main

import (
	"dataset/internal/db"
	"errors"
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
	app.host.fiber.Post("/postPhoto", app.postPhoto)
	app.host.fiber.Post("/postFile", app.postFile)
	app.host.fiber.Post("/postJSON", app.postJSON)

	app.log.Fatal(app.host.fiber.Listen(":" + strconv.Itoa(port)))
	return nil
}

func status(c *fiber.Ctx) error {
	uri := os.Getenv("MONGODB_URI")
	return c.SendString(uri)
}

func (app *Application) getSet(c *fiber.Ctx) error {
	nameSet := c.Query("name", emptyNameSet)
	if nameSet == "" {
		nameSet = emptyNameSet
	}
	if nameSet == emptyNameSet {
		return c.Status(http.StatusUnprocessableEntity).SendString("name is required")
	}
	jsonSet, err := app.db.LoadSet(nameSet)
	if err != nil {
		return c.Status(http.StatusBadGateway).SendString("database error" + err.Error())
	}
	return c.JSON(jsonSet)
}

func (app *Application) getListOfSets(c *fiber.Ctx) error {
	jsonSet, err := app.db.LoadList()
	if err != nil {
		return c.Status(http.StatusBadGateway).SendString("database error" + err.Error())
	}
	return c.JSON(jsonSet)
}

func (app *Application) uploadHandler(c *fiber.Ctx, strType string, strPath string) error {
	nameSet := c.Query("name", emptyNameSet)
	nameSet = regexp.MustCompile(`[^a-zA-Z0-9.]`).ReplaceAllString(nameSet, "")
	if len(nameSet) < 1 {
		c.Status(http.StatusBadGateway).SendString("dataset name should contain ASCII chars")
		return errors.New("dataset name should contain ASCII chars")
	}

	file, err := c.FormFile(strType)
	if err != nil {
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
	return nil
}

// postPhoto receives file from POST request,
// makes new folder "images/{dataset_name}" and
// put received file to it
func (app *Application) postPhoto(c *fiber.Ctx) error {
	err := app.uploadHandler(c, "photo", "images")
	if err != nil {
		app.log.Info(err)
	}
	return err
}

// postFile receives file from POST request,
// makes new folder "downloads/{dataset_name}" and
// put received file to it
func (app *Application) postFile(c *fiber.Ctx) error {
	err := app.uploadHandler(c, "upload", "downloads")
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
	for _, k := range set.ImagePreviewName {
		if str, ok := k.Value.(string); ok {
			str = regexp.MustCompile(`[^a-zA-Z0-9.]`).ReplaceAllString(str, "")
			if len(str) < 1 {
				c.Status(http.StatusBadGateway).SendString("image name should contain ASCII chars")
				return errors.New("image name should contain ASCII chars")
			}
			k.Value = str
		}
	}
	if str, ok := set.DownloadLink.Value.(string); ok {
		str = regexp.MustCompile(`[^a-zA-Z0-9.]`).ReplaceAllString(str, "")
		if len(str) < 1 {
			c.Status(http.StatusBadGateway).SendString("download name should contain ASCII chars")
			return errors.New("download name should contain ASCII chars")
		}
		set.DownloadLink.Value = str
	}

	if err := app.db.PushSet(set); err != nil {
		app.log.Info(err)
		return err
	}

	return nil
}
