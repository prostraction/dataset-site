package main

import (
	"dataset/internal/db"
	"os"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type ConnectionInfo struct {
	PortServer int
}

type Application struct {
	host HostRoutes
	db   db.Database
	log  *logrus.Logger
}

func main() {
	var conInfo ConnectionInfo
	conInfo.PortServer = 9999

	var app Application
	app.log = logrus.New()

	uri, err := app.getEnv()
	if err != nil {
		app.log.Fatal("Error loading .env file")
		os.Exit(1)
	}
	err = app.db.InitDatabase(uri, "datasets", "datasets")
	if err != nil {
		app.log.Fatal(err)
		os.Exit(1)
	}
	app.log.Info("Connected to MongoDB.")

	//app.db.LoadList("TreeLeafsDirty")

	app.InitFiber(conInfo.PortServer)
}

func (app *Application) getEnv() (string, error) {
	err := godotenv.Load("mongo.env")
	if err != nil {
		return "", err
	}
	return os.Getenv("MONGODB_URI"), nil
}
