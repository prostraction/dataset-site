package server

import (
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func (app *Application) getSet(c *fiber.Ctx) error {
	nameSet := c.Query("name", emptyNameSet)
	if nameSet == "" {
		nameSet = emptyNameSet
	}
	if nameSet == emptyNameSet {
		return c.Status(http.StatusInternalServerError).SendString("name is required")
	}
	jsonSet, err := app.DbView.LoadSet(nameSet)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString("database error" + err.Error())
	}
	return c.JSON(jsonSet)
}

func (app *Application) getListOfSets(c *fiber.Ctx) error {
	jsonSet, err := app.DbView.LoadList()
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString("database error" + err.Error())
	}
	return c.JSON(jsonSet)
}

func (app *Application) getImage(c *fiber.Ctx) error {
	path := strings.Split(c.Request().URI().String(), "/")
	if len(path) < 2 {
		return c.Status(http.StatusInternalServerError).SendString("wrong url")
	}
	dataset := path[len(path)-2]
	image := path[len(path)-1]
	fpath := filepath.Join(dataset, image)
	return c.SendFile(filepath.Join("images", fpath))
}

func (app *Application) getFile(c *fiber.Ctx) error {
	path := strings.Split(c.Request().URI().String(), "/")
	if len(path) < 2 {
		return c.Status(http.StatusInternalServerError).SendString("wrong url")
	}
	dataset := path[len(path)-2]
	file := path[len(path)-1]
	fpath := filepath.Join(dataset, file)
	return c.Download(filepath.Join("downloads", fpath))
}
