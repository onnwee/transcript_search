package handlers

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/onnwee/transcript_search/backend/db"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

type mockRow struct {
	pgx.Row
	scanFunc func(dest ...any) error
}

func (m mockRow) Scan(dest ...any) error {
	return m.scanFunc(dest...)
}

type mockDB struct {
	pgxpool.Pool
	row pgx.Row
}

func (m *mockDB) QueryRow(ctx context.Context, sql string, args ...any) pgx.Row {
	return m.row
}

func TestGetVideoSuccess(t *testing.T) {
	e := echo.New()

	db.Pool = &mockDB{
		row: mockRow{
			scanFunc: func(dest ...any) error {
				dest[0] = "Test Title"
				dest[1] = "Formatted transcript here"
				dest[2] = "2023-01-01T00:00:00Z"
				return nil
			},
		},
	}

	req := httptest.NewRequest(http.MethodGet, "/api/video/abc123", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("abc123")

	err := GetVideo(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), "Test Title")
}

func TestGetVideoNotFound(t *testing.T) {
	e := echo.New()

	db.Pool = &mockDB{
		row: mockRow{
			scanFunc: func(dest ...any) error {
				return errors.New("no rows in result set")
			},
		},
	}

	req := httptest.NewRequest(http.MethodGet, "/api/video/missing", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames("id")
	c.SetParamValues("missing")

	err := GetVideo(c)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusNotFound, rec.Code)
	assert.Contains(t, rec.Body.String(), "Video not found")
}
