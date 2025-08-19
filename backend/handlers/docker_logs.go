package handlers

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

// Upgrader for WebSocket connections; permissive origin check for dev.
var Upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for dev
	},
}


// StreamDockerLogs opens a WebSocket that tails logs from all running containers.
// Each line is prefixed with container name and a timestamp, with basic ANSI color.
func StreamDockerLogs(c echo.Context) error {
	var mu sync.Mutex
	ws, err := Upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return err
	}
	defer ws.Close()

	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return ws.WriteMessage(websocket.TextMessage, []byte("Docker client init failed"))
	}

	containers, err := cli.ContainerList(ctx, container.ListOptions{})
	if err != nil {
		return ws.WriteMessage(websocket.TextMessage, []byte("Failed to list containers"))
	}

	for _, container := range containers {
		go streamContainerLogs(ctx, cli, ws, container.ID, strings.TrimPrefix(container.Names[0], "/"), &mu)
	}

	// Keep the connection alive
	go func() {
		for {
			if _, _, err := ws.ReadMessage(); err != nil {
				ws.Close()
				break
			}
		}
	}()

	select {} // Block forever
}

func streamContainerLogs(ctx context.Context, cli *client.Client, ws *websocket.Conn, containerID, name string, mu *sync.Mutex) {
	reader, err := cli.ContainerLogs(ctx, containerID, container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Timestamps: false,
		Tail:       "10",
	})
	if err != nil {
		mu.Lock()
		err := ws.WriteMessage(websocket.TextMessage, []byte(name + ": log error"))
		mu.Unlock()
		if err != nil {
			log.Printf("Failed to send error message: %v", err)
		}
		
		return
	}
	defer reader.Close()

	scanner := bufio.NewScanner(reader)
	for scanner.Scan() {
		line := scanner.Text()

		// Optional: ANSI color based on log content
		var colorPrefix string
		lower := strings.ToLower(line)
		switch {
		case strings.Contains(lower, "error"), strings.Contains(line, "ERR"):
			colorPrefix = "\u001b[31m" // red
		case strings.Contains(lower, "warn"):
			colorPrefix = "\u001b[33m" // yellow
		default:
			colorPrefix = "\u001b[32m" // green
		}

		timestamp := time.Now().Format("15:04:05")
		msg := fmt.Sprintf("%s[%s] %s: %s\u001b[0m", colorPrefix, timestamp, name, line)

		mu.Lock()
		err := ws.WriteMessage(websocket.TextMessage, []byte(msg))
		mu.Unlock()
		if err != nil {
			break
		}
	}
}