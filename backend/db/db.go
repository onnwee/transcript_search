package db

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PoolInterface abstracts pgxpool.Pool so handlers can be unit-tested with mocks.
type PoolInterface interface {
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
}

// Pool is the global connection pool used by handlers.
var Pool PoolInterface

// InitDB assigns a real *pgxpool.Pool (from DATABASE_URL) to Pool.
func InitDB() {
	pgxPool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Unable to connect to DB: %v", err)
	}
	Pool = pgxPool
}
