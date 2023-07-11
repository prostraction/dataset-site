package main

import (
	"dataset/internal/db"
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"sync"

	"github.com/gofiber/fiber/v2"
)

func (app *Application) moveHandler(path string, datasetName1 string, datasetName2 string) error {
	filepath1 := filepath.Join(path, datasetName1)
	filepath2 := filepath.Join(path, datasetName2)
	return os.Rename(filepath1, filepath2)
}

func (app *Application) strRegex(str string, index int, useIndex bool) string {
	str = regexp.MustCompile(`[^a-zA-Z0-9.]`).ReplaceAllString(str, "")
	if str[0] == '.' && useIndex {
		str = strconv.Itoa(index) + str
	}
	return str
}

func (app *Application) uploadHandler(c *fiber.Ctx, set db.Set) error {
	if form, err := c.MultipartForm(); err == nil {
		/* database */
		var nameset string
		if nameset = app.strRegex(set.Name.Name, 0, false); len(nameset) < 1 {
			return c.Status(http.StatusBadRequest).SendString("name should contain ASCII chars")
		}
		set.Name.Name = nameset
		for i := 0; i < len(set.ImagePreviewName); i++ {
			if str, ok := set.ImagePreviewName[i].Value.(string); ok {
				str = app.strRegex(str, i+1, true)
				set.ImagePreviewName[i].Value = str
			}
		}
		if str, ok := set.DownloadLink.Value.(string); ok {
			if len(str) > 0 {
				str = app.strRegex(str, 1, true)
				set.DownloadLink.Value = str
			}
		}
		if err := app.db.PushSet(set); err != nil {
			return err
		}

		var wg sync.WaitGroup
		var fileErr error
		/* images */
		images := form.File["photo"]
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i, image := range images {
				os.MkdirAll(filepath.Join("images", nameset), os.ModeDir)
				image.Filename = filepath.Join(nameset, app.strRegex(image.Filename, (i+1), true))
				err = c.SaveFile(image, filepath.Join("images", image.Filename))
				if err != nil {
					fileErr = err
					return
				}
			}
		}()

		/* files */
		files := form.File["upload"]
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i, file := range files {
				os.MkdirAll(filepath.Join("downloads", nameset), os.ModeDir)
				file.Filename = filepath.Join(nameset, app.strRegex(file.Filename, (i+1), true))
				err = c.SaveFile(file, filepath.Join("downloads", file.Filename))
				if err != nil {
					fileErr = err
					return
				}
			}
		}()
		wg.Wait()

		if fileErr != nil {
			return fileErr
		}
	} else {
		return errors.New("no jsonDB data received")
	}
	return nil
}
