package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/onnwee/transcript_search/backend/db"
	"github.com/onnwee/transcript_search/backend/handlers"
)

func main() {
	// Load environment variables from .env file
	godotenv.Load()
	// Initialize the database connection
	db.InitDB()
	// Initialize the Redis connection
	e := echo.New()

	// Set up middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	
	// Enable CORS for all origins and methods
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"}, // Allow all origins for dev
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{"*"}, // Accept all headers for dev
	}))

	// Set up health check endpoint	
	e.GET("/api/health", func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	})

	// Set up API endpoints
	e.GET("/api/search", handlers.Search)
	e.GET("/api/video/:id", handlers.GetVideo)

	// Set up a custom error handler
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		c.Response().Header().Set(echo.HeaderAccessControlAllowOrigin, "http://localhost:5173")
		c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextPlainCharsetUTF8)
		c.String(http.StatusNotFound, "Not found")
	}

	log.Println("🔌 Listening on 0.0.0.0:3000")
	e.Logger.Fatal(e.Start("0.0.0.0:3000"))
}
