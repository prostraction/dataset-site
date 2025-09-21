package server

import (
	"dataset/internal/db"
	s "dataset/internal/structs"
	"errors"
	"os"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type ConnectionInfo struct {
	PortServer int
}

type Application struct {
	Host    HostRoutes
	DbView  db.Database
	DbAdmin db.Database
	Log     *logrus.Logger
	Users   map[string]s.User
	Jwts    map[string]Auth
	JwtSign string
}

func (app *Application) LoadDatabase(mode bool, databaseDataset string, collectionDataset string, databaseAdmin string, collectionAdmin string, db *db.Database) {
	// https://github.com/golang/go/issues/9367#issuecomment-143128337
	launchEnvMode := 0
	if mode {
		launchEnvMode = 1
	}
	uri, err := app.GetEnv(launchEnvMode)
	if err != nil {
		app.Log.Fatal("Error loading .env file")
		os.Exit(1)
	}
	app.Log.Info(uri)
	err = db.InitDatabase(uri, databaseDataset, collectionDataset, databaseAdmin, collectionAdmin, mode)
	if err != nil {
		app.Log.Fatal(err)
		os.Exit(1)
	}
}

func (app *Application) GetEnv(mode int) (string, error) {
	err := godotenv.Load("mongo.env")
	if err != nil {
		return "", err
	}
	switch mode {
	case 0:
		return os.Getenv("MONGODB_URI_VIEW"), nil
	case 1:
		return os.Getenv("MONGODB_URI_ADM"), nil
	case 2:
		return os.Getenv("JWT"), nil
	default:
		return "", errors.New("GetEnv used 0..2 value")
	}
}
