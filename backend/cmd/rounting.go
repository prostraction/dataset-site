package main

import (
	"net/http"
	"os"
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
