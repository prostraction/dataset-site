package main

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
		return c.Status(http.StatusUnprocessableEntity).SendString("name is required")
	}
	app.log.Info("Called getSet with name = ", nameSet)
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

func (app *Application) getImage(c *fiber.Ctx) error {
	path := strings.Split(c.Request().URI().String(), "/")
	if len(path) < 2 {
		return nil
	}
	dataset := path[len(path)-2]
	image := path[len(path)-1]
	fpath := filepath.Join(dataset, image)
	c.SendFile(filepath.Join("images", fpath))
	return nil
}

func (app *Application) getFile(c *fiber.Ctx) error {
	path := strings.Split(c.Request().URI().String(), "/")
	if len(path) < 2 {
		return nil
	}
	dataset := path[len(path)-2]
	file := path[len(path)-1]
	fpath := filepath.Join(dataset, file)
	c.SendFile(filepath.Join("downloads", fpath))
	return nil
}
