package handlers

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
	"github.com/onnwee/transcript_search/backend/db"
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
	var publishedAt time.Time

	err := row.Scan(&title, &transcript, &publishedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Printf("❌ No video found for ID: %s", videoID)
			return c.JSON(http.StatusNotFound, echo.Map{"error": "Video not found"})
		}
		log.Printf("🔥 DB error for video %s: %v", videoID, err)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error":  "Query failed",
			"detail": err.Error(),
		})
	}

	log.Printf("✅ Video fetched: %s", videoID)

	return c.JSON(http.StatusOK, echo.Map{
		"id":         videoID,
		"title":      title,
		"published":  publishedAt.Format(time.RFC3339),
		"transcript": transcript,
	})
}
