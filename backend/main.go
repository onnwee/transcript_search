package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"

	"backend/db"
	"backend/handlers"
)

func main() {
	godotenv.Load()
	db.InitDB()

	e := echo.New()
	e.GET("/api/ping", handlers.Ping)
	e.GET("/api/search", handlers.Search)
	e.GET("/api/video/:id", handlers.GetVideo)

	log.Println("🔌 Listening on :8080")
	e.Logger.Fatal(e.Start(":8080"))
}
