package main

import (
	"dataset/internal/db"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"sync"

	"github.com/gofiber/fiber/v2"
)

func (app *Application) putJSON(c *fiber.Ctx) error {
	if err := app.validateJWT(c); err != nil {
		return c.Status(http.StatusUnauthorized).SendString(err.Error())
	}

	app.log.Info("here")

	oldDataset := c.Query("oldName", emptyNameSet)
	if oldDataset == "" {
		oldDataset = emptyNameSet
	}
	if oldDataset == emptyNameSet {
		return c.Status(http.StatusInternalServerError).SendString("oldName required")
	}
	newDataset := c.Query("newName", emptyNameSet)
	if newDataset == "" {
		newDataset = emptyNameSet
	}
	if newDataset == emptyNameSet {
		newDataset = oldDataset
	}
	var set db.Set
	if err := json.Unmarshal([]byte(c.FormValue("jsonDB")), &set); err != nil {
		return c.Status(http.StatusInternalServerError).SendString("json parsing error")
	}

	/* remove image / files not in db */
	images := make(map[string]bool)
	files := make(map[string]bool)
	for _, k := range set.ImagePreviewName {
		images[k.Value.(string)] = true
	}
	files[set.DownloadLink.Value.(string)] = true

	var wg sync.WaitGroup
	imageList, err := os.ReadDir(filepath.Join("images", oldDataset))
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err == nil {
			for _, k := range imageList {
				datasetPath := filepath.Join("images", oldDataset)
				if _, ok := images[k.Name()]; !ok {
					if err := os.Remove(filepath.Join(datasetPath, k.Name())); err != nil {
						app.log.Info(err)
					}
				}
			}
		}
	}()

	fileList, err := os.ReadDir(filepath.Join("downloads", oldDataset))
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err == nil {
			datasetPath := filepath.Join("downloads", oldDataset)
			for _, k := range fileList {
				if err := os.Remove(filepath.Join(datasetPath, k.Name())); err != nil {
					app.log.Info(err)
				}
			}
		}
	}()
	wg.Wait()

	/* move image / files if needed */
	if oldDataset != newDataset {
		app.moveHandler("images", oldDataset, newDataset)
		app.moveHandler("downloads", oldDataset, newDataset)
	}
	/* upload files */
	app.dbAdmin.DeleteSet(oldDataset)

	if err := app.uploadHandler(c, set); err != nil {
		app.log.Info("putJSON: ", err.Error())
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}
	return c.SendStatus(http.StatusAccepted)
}
