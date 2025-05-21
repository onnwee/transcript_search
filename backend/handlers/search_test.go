package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestSearchHandler(t *testing.T) {
	// Mock Meilisearch HTTP server
	meiliServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "/indexes/transcripts/search", r.URL.Path)
		assert.Equal(t, "Bearer test-key", r.Header.Get("Authorization"))

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"hits": []map[string]string{
				{"id": "abc123", "title": "Test Video", "transcript": "This is a test transcript"},
			},
		})
	}))
	defer meiliServer.Close()

	// Set mock env vars
	os.Setenv("MEILI_HOST", meiliServer.URL)
	os.Setenv("MEILI_API_KEY", "test-key")

	// Create Echo and request
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/search?q=test", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// Run the handler
	if assert.NoError(t, Search(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.True(t, strings.Contains(rec.Body.String(), "Test Video"))
	}
}
