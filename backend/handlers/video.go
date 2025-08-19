package handlers

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
	"github.com/onnwee/transcript_search/backend/db"
)

func Ping(c echo.Context) error {
	return c.String(http.StatusOK, "pong")
}

func GetVideo(c echo.Context) error {
	// Returns basic video info and full formatted transcript (single string)
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

func GetVideoSentences(c echo.Context) error {
	// Returns aligned sentences for a video between [from, to] seconds.
	// If 'to' is omitted, returns up to 500 sentences from 'from'.
	videoID := c.Param("id")
	fromStr := c.QueryParam("from")
	toStr := c.QueryParam("to")

	var (
		from float64 = 0
		to   float64 = 0
		err  error
	)
	if fromStr != "" {
		from, err = strconv.ParseFloat(fromStr, 64)
		if err != nil { return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid 'from'"}) }
	}
	if toStr != "" {
		to, err = strconv.ParseFloat(toStr, 64)
		if err != nil { return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid 'to'"}) }
	}

	ctx := context.Background()
	var rows pgx.Rows
	var q string
	if to > 0 {
		q = `SELECT sentence_index, start_time, end_time, cleaned_text
			 FROM transcript_sentences
			 WHERE video_id=$1 AND start_time >= $2 AND end_time <= $3
			 ORDER BY sentence_index ASC`
		rows, err = db.Pool.Query(ctx, q, videoID, from, to)
	} else {
		q = `SELECT sentence_index, start_time, end_time, cleaned_text
			 FROM transcript_sentences
			 WHERE video_id=$1 AND start_time >= $2
			 ORDER BY sentence_index ASC LIMIT 500`
		rows, err = db.Pool.Query(ctx, q, videoID, from)
	}
	if err != nil {
		log.Printf("🔥 DB error sentences %s: %v", videoID, err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Query failed"})
	}
	defer rows.Close()

	type Sentence struct {
		SentenceIndex int     `json:"sentence_index"`
		StartTime     float64 `json:"start_time"`
		EndTime       float64 `json:"end_time"`
		Text          string  `json:"text"`
	}
	out := []Sentence{}
	for rows.Next() {
		var s Sentence
		if err := rows.Scan(&s.SentenceIndex, &s.StartTime, &s.EndTime, &s.Text); err != nil {
			log.Printf("🔥 Scan error: %v", err)
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Scan failed"})
		}
		out = append(out, s)
	}
	return c.JSON(http.StatusOK, echo.Map{"video_id": videoID, "sentences": out})
}
