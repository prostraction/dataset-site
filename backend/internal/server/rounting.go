package server

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
	app.Host.fiber = fiber.New(fiber.Config{
		BodyLimit: 2048 * 1024 * 1024,
	})
	app.Host.fiber.Use(cors.New(cors.Config{
		AllowOrigins: "*", // rename
		AllowHeaders: "Origin, Content-Type, Authorization, Accept, Type, Fetch",
		AllowMethods: strings.Join([]string{
			fiber.MethodGet,
			fiber.MethodPost,
			fiber.MethodPut,
		}, ","),
	}))

	app.Host.fiber.Get("/getDataset", app.getSet)
	app.Host.fiber.Get("/getList", app.getListOfSets)

	app.Host.fiber.Get("images/:s/:s", app.getImage)
	app.Host.fiber.Get("downloads/:s/:s", app.getFile)

	app.Host.fiber.Post("/auth", app.auth)

	authorizedGroup := app.Host.fiber.Group("")
	authorizedGroup.Use(jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{
			Key: []byte(app.JwtSign),
		},
		ContextKey: contextKeyUser,
	}))

	authorizedGroup.Post("/postJSON", app.postJSON)
	authorizedGroup.Put("/putJSON", app.putJSON)

	app.Log.Fatal(app.Host.fiber.Listen(":" + strconv.Itoa(port)))
	return nil
}
