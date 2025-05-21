package handlers

import (
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

func StreamLogs(c echo.Context) error {
	ws, err := Upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		return err
	}
	defer ws.Close()

	for {
		// Example: send timestamp every second (replace with log lines)
		msg := time.Now().Format(time.RFC3339)
		if err := ws.WriteMessage(websocket.TextMessage, []byte(msg)); err != nil {
			break
		}
		time.Sleep(1 * time.Second)
	}
	return nil
}
