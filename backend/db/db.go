package db

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Define an interface to allow mocking in tests
type PoolInterface interface {
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

// Global pool variable using the interface
var Pool PoolInterface

// InitDB assigns a real *pgxpool.Pool to the interface
func InitDB() {
	pgxPool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Unable to connect to DB: %v", err)
	}
	Pool = pgxPool
}
