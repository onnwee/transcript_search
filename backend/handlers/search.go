package handlers

import (
	"net/http"
	"os"

	"github.com/go-resty/resty/v2"
	"github.com/labstack/echo/v4"
)

type MeiliHit struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	Transcript string `json:"transcript"`
}

type MeiliSearchResp struct {
	Hits []MeiliHit `json:"hits"`
}

func Search(c echo.Context) error {
	query := c.QueryParam("q")
	if query == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Missing 'q' query parameter"})
	}

	client := resty.New()
	var result MeiliSearchResp

	resp, err := client.R().
		SetHeader("Authorization", "Bearer "+os.Getenv("MEILI_API_KEY")).
		SetHeader("Content-Type", "application/json").
		SetBody(map[string]string{"q": query}).
		SetResult(&result).
		Post(os.Getenv("MEILI_HOST") + "/indexes/transcripts/search")

	if err != nil || resp.IsError() {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to search Meilisearch"})
	}

	return c.JSON(http.StatusOK, result.Hits)
}
