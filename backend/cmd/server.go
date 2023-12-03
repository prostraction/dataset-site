package main

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
	host    HostRoutes
	dbView  db.Database
	dbAdmin db.Database
	log     *logrus.Logger
	users   map[string]s.User
	jwts    map[string]Auth
	jwtSign string
}

func main() {
	var conInfo ConnectionInfo
	conInfo.PortServer = 9999

	var app Application
	app.log = logrus.New()

	app.loadDatabase(false, "datasets", "datasets", "", "", &app.dbView)
	app.loadDatabase(true, "datasets", "datasets", "admin", "users", &app.dbAdmin)

	var err error
	app.users, err = app.dbAdmin.LoadUsers()
	if err != nil {
		app.log.Error("Unable to load users: ", err.Error())
	}
	app.jwtSign, err = app.getEnv(2)
	if err != nil {
		app.log.Fatal("Unable to load JWT sign. Did you forget to load mongo.env?")
		os.Exit(1)
	}
	app.log.Info("Connected to MongoDB.")

	app.InitFiber(conInfo.PortServer)
}

func (app *Application) loadDatabase(mode bool, databaseDataset string, collectionDataset string, databaseAdmin string, collectionAdmin string, db *db.Database) {
	// https://github.com/golang/go/issues/9367#issuecomment-143128337
	launchEnvMode := 0
	if mode {
		launchEnvMode = 1
	}
	uri, err := app.getEnv(launchEnvMode)
	if err != nil {
		app.log.Fatal("Error loading .env file")
		os.Exit(1)
	}
	app.log.Info(uri)
	err = db.InitDatabase(uri, databaseDataset, collectionDataset, databaseAdmin, collectionAdmin, mode)
	if err != nil {
		app.log.Fatal(err)
		os.Exit(1)
	}
}

func (app *Application) getEnv(mode int) (string, error) {
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
		return "", errors.New("getEnv used 0..2 value")
	}
}
