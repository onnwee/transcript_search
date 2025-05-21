package handlers

import (
	"context"
	"log"
	"net/http"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
)

func GetDockerStatus(c echo.Context) error {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		log.Printf("❌ Docker client error: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Docker client init failed"})
	}
	containers, err := cli.ContainerList(context.Background(), container.ListOptions{All: true})
	if err != nil {
		log.Printf("❌ Failed to list containers: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to list containers"})
	}

	var result []map[string]interface{}
	for _, container := range containers {
		result = append(result, map[string]interface{}{
			"id":     container.ID[:12],
			"name":   container.Names[0],
			"image":  container.Image,
			"status": container.Status,
			"state":  container.State,
		})
	}

	return c.JSON(http.StatusOK, result)
}
