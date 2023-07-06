package main

import (
	"net/http"
	"os"
	"path/filepath"
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
	app.host.fiber.Get("/dataset", app.getSet)
	app.host.fiber.Get("/list", app.getListOfSets)
	app.host.fiber.Post("/uploadPhoto", app.uploadPhoto)
	app.host.fiber.Post("/uploadFile", app.uploadFile)

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
		return c.Status(http.StatusBadGateway).SendString("Database error" + err.Error())
	}
	return c.JSON(jsonSet)
}

func (app *Application) getListOfSets(c *fiber.Ctx) error {
	jsonSet, err := app.db.LoadList()
	if err != nil {
		return c.Status(http.StatusBadGateway).SendString("Database error" + err.Error())
	}
	return c.JSON(jsonSet)
}

func (app *Application) uploadHandler(c *fiber.Ctx, strType string, strPath string) error {
	file, err := c.FormFile(strType)
	if err != nil {
		return err
	}

	path := strings.Split(file.Filename, ",")
	if len(path) == 2 {
		dir := path[0]
		os.MkdirAll(filepath.Join(strPath, dir), os.ModeDir)
		file.Filename = filepath.Join(dir, path[1])
	}

	err = c.SaveFile(file, filepath.Join(strPath, file.Filename))
	if err != nil {
		return err
	}
	return nil
}

// uploadPhoto receives file from POST request,
// makes new folder "images/{dataset_name}" and
// put received file to it
func (app *Application) uploadPhoto(c *fiber.Ctx) error {
	err := app.uploadHandler(c, "photo", "images")
	if err != nil {
		app.log.Info(err)
	}
	return err
}

// uploadFile receives file from POST request,
// makes new folder "downloads/{dataset_name}" and
// put received file to it
func (app *Application) uploadFile(c *fiber.Ctx) error {
	err := app.uploadHandler(c, "upload", "downloads")
	if err != nil {
		app.log.Info(err)
	}
	return err
}
