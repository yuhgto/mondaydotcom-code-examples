#!/bin/bash
  curl "https://api.monday.com/v2/get_schema?format=sdl&version=2025-01" -o src/schema.graphql