package main

import "errors"

var (
	errBadCredentials = errors.New("login or password is incorrect")
	emptyNameSet      = "unknown"
	contextKeyUser    = "user"
	imagesPath        = "images"
	filesPath         = "files"
)
