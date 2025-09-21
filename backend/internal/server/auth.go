package server

import (
	"encoding/base64"
	"errors"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type (
	LoginRequest struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	LoginResponse struct {
		AccessToken string `json:"access_token"`
	}

	Auth struct {
		sub         string
		accessID    string
		accessTime  float64
		refresh     string
		refreshTime int64
	}
)

func (app *Application) JwtPayloadFromRequest(c *fiber.Ctx) (jwt.MapClaims, error) {
	fulltoken := c.Request().Header.PeekBytes([]byte("Authorization"))
	if len(fulltoken) < 8 {
		return nil, errors.New("wrong type of JWT token in context")
	}

	parsedToken := string(fulltoken[7:])
	jwtToken, err := jwt.Parse(parsedToken, func(token *jwt.Token) (any, error) {
		return []byte(app.JwtSign), nil
	})
	if err != nil {
		return nil, errors.New("wrong type of JWT token in context")
	}

	payload, ok := jwtToken.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("wrong type of JWT token claims")
	}

	return payload, nil
}

func (app *Application) validateJWT(c *fiber.Ctx) error {
	jwtPayload, err := app.JwtPayloadFromRequest(c)
	if err != nil {
		app.Log.Info(err.Error())
		return err
	}
	jwt, exists := app.Jwts[jwtPayload["sub"].(string)]
	if !exists {
		return errors.New("no JWT authorized")
	}
	if jwt.accessTime != jwtPayload["exp"].(float64) {
		return errors.New("this JWT is expired")
	}
	if jwt.accessID != jwtPayload["id"].(string) {
		return errors.New("wrong JWT")
	}
	return nil
}

func (app *Application) auth(c *fiber.Ctx) error {
	regReq := LoginRequest{}
	if err := c.BodyParser(&regReq); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}

	user, exists := app.Users[regReq.Login]
	app.Log.Info(user, exists, regReq.Password)
	if !exists {
		return errBadCredentials
	}
	// base64 bcrypt -> bcrypt -> validate with database
	passDebase64, err := base64.StdEncoding.DecodeString(regReq.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString(err.Error())
	}
	val := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(passDebase64))
	// wrong password
	if val != nil {
		return errBadCredentials
	}

	time := time.Now().Add(time.Hour * 72).Unix()
	accessID := uuid.New().String()

	payload := jwt.MapClaims{
		"sub": user.Login,
		"exp": time,
		"id":  accessID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)

	t, err := token.SignedString([]byte(app.JwtSign))
	if err != nil {
		app.Log.Error("JWT token signing: ", err.Error())
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	if app.Jwts == nil {
		app.Jwts = make(map[string]Auth)
	}
	app.Jwts[user.Login] = Auth{
		sub:         user.Login,
		accessID:    accessID,
		accessTime:  float64(time),
		refresh:     "",
		refreshTime: 0,
	}

	return c.JSON(LoginResponse{AccessToken: t})
}
