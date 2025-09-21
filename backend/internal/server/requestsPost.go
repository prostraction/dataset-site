package server

import (
	"dataset/internal/db"
	"encoding/json"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func (app *Application) postJSON(c *fiber.Ctx) error {
	if err := app.validateJWT(c); err != nil {
		return c.Status(http.StatusUnauthorized).SendString(err.Error())
	}

	var set db.Set
	if err := json.Unmarshal([]byte(c.FormValue("jsonDB")), &set); err != nil {
		return c.Status(http.StatusInternalServerError).SendString("json parsing error")
	}
	if err := app.uploadHandler(c, set); err != nil {
		app.Log.Info("postJSON: ", err.Error())
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}
	return c.SendStatus(http.StatusCreated)
}
