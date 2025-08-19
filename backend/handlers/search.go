package handlers

import (
	"net/http"
	"os"

	"github.com/go-resty/resty/v2"
	"github.com/labstack/echo/v4"
)

type MeiliHit struct {
	ID         string  `json:"id"`
	VideoID    string  `json:"video_id"`
	Title      string  `json:"title"`
	Text       string  `json:"text"`
	Start      float64 `json:"start"`
	End        float64 `json:"end"`
	Formatted  struct {
		Title string `json:"title"`
		Text  string `json:"text"`
	} `json:"_formatted"`
}

type MeiliSearchResp struct {
	Hits []MeiliHit          `json:"hits"`
	EstimatedTotalHits int64 `json:"estimatedTotalHits"`
}

func Search(c echo.Context) error {
	// Validates query and forwards to Meilisearch segment index with highlighting
	query := c.QueryParam("q")
	if query == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Missing 'q' query parameter"})
	}

	index := os.Getenv("MEILI_SEGMENT_INDEX")
	if index == "" {
		// fallback to original transcripts index
		index = "transcripts"
	}

	page := c.QueryParam("page")
	limit := c.QueryParam("limit")
	offset := c.QueryParam("offset")
	videoFilter := c.QueryParam("video_id")

	client := resty.New() // lightweight HTTP client
	var result MeiliSearchResp

	body := map[string]any{
		"q": query,
		"attributesToHighlight": []string{"text", "title"},
		"highlightPreTag": "<mark>",
		"highlightPostTag": "</mark>",
	}
	if page != "" { body["page"] = page }
	if limit != "" { body["limit"] = limit }
	if offset != "" { body["offset"] = offset }
	if videoFilter != "" {
		body["filter"] = []string{"video_id = \"" + videoFilter + "\""}
	}

	// Support both MEILI_HOST and MEILISEARCH_HOST for flexibility
	host := os.Getenv("MEILI_HOST")
	if host == "" {
		host = os.Getenv("MEILISEARCH_HOST")
	}

	resp, err := client.R().
		SetHeader("X-Meili-API-Key", os.Getenv("MEILI_API_KEY")).
		SetHeader("Content-Type", "application/json").
		SetBody(body).
		SetResult(&result).
		Post(host + "/indexes/" + index + "/search")

	if err != nil || resp.IsError() {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to search Meilisearch"})
	}

	return c.JSON(http.StatusOK, result)
}
