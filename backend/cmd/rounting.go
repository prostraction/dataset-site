package main

import (
	"strconv"
	"strings"

	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type HostRoutes struct {
	fiber *fiber.App
}

func (app *Application) InitFiber(port int) error {
	app.host.fiber = fiber.New(fiber.Config{
		BodyLimit: 2048 * 1024 * 1024,
	})
	app.host.fiber.Use(cors.New(cors.Config{
		AllowOrigins: "*", // rename
		AllowHeaders: "Origin, Content-Type, Accept, Type, Fetch",
		AllowMethods: strings.Join([]string{
			fiber.MethodGet,
			fiber.MethodPost,
			fiber.MethodPut,
		}, ","),
	}))

	app.host.fiber.Get("/getDataset", app.getSet)
	app.host.fiber.Get("/getList", app.getListOfSets)

	app.host.fiber.Get("images/:s/:s", app.getImage)
	app.host.fiber.Get("downloads/:s/:s", app.getFile)

	app.host.fiber.Post("/auth", app.auth)

	authorizedGroup := app.host.fiber.Group("")
	authorizedGroup.Use(jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{
			Key: []byte(app.jwtSign),
		},
		ContextKey: contextKeyUser,
	}))

	authorizedGroup.Post("/postJSON", app.postJSON)
	authorizedGroup.Put("/putJSON", app.putJSON)

	app.log.Fatal(app.host.fiber.Listen(":" + strconv.Itoa(port)))
	return nil
}
