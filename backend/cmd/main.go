package main

import (
	"os"

	s "dataset/internal/server"

	"github.com/sirupsen/logrus"
)

func main() {

	var conInfo s.ConnectionInfo
	conInfo.PortServer = 9999

	var app s.Application
	app.Log = logrus.New()

	app.LoadDatabase(false, "datasets", "datasets", "", "", &app.DbView)
	app.LoadDatabase(true, "datasets", "datasets", "admin", "users", &app.DbAdmin)

	var err error
	app.Users, err = app.DbAdmin.LoadUsers()
	if err != nil {
		app.Log.Error("Unable to load users: ", err.Error())
	}
	app.JwtSign, err = app.GetEnv(2)
	if err != nil {
		app.Log.Fatal("Unable to load JWT sign. Did you forget to load mongo.env?")
		os.Exit(1)
	}
	app.Log.Info("Connected to MongoDB.")

	app.InitFiber(conInfo.PortServer)
}
