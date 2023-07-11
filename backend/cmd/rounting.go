package main

import (
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
		AllowHeaders: "Origin, Content-Type, Accept, Type, Fetch",
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

	app.host.fiber.Post("/postJSON", app.postJSON)
	app.host.fiber.Put("/putJSON", app.putJSON)

	app.log.Fatal(app.host.fiber.Listen(":" + strconv.Itoa(port)))
	return nil
}

func status(c *fiber.Ctx) error {
	uri := os.Getenv("MONGODB_URI")
	return c.SendString(uri)
}
