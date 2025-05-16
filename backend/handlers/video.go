package handlers

import (
	"backend/db"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func Ping(c echo.Context) error {
	return c.String(http.StatusOK, "pong")
}

func GetVideo(c echo.Context) error {
	videoID := c.Param("id")
	row := db.Pool.QueryRow(context.Background(), `
		SELECT video_title, formatted_transcript, published_at
		FROM videos WHERE video_id = $1
	`, videoID)

	var title, transcript string
	var publishedAt string

	err := row.Scan(&title, &transcript, &publishedAt)
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Video not found"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"id":         videoID,
		"title":      title,
		"published":  publishedAt,
		"transcript": transcript,
	})
}
