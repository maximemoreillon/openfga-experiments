#!/bin/bash

export FGA_API_URL=http://localhost:8080

OUTPUT=$(fga store create --name experiments --model openfga/model.fga)

FGA_STORE_ID=$(echo $OUTPUT | jq ".store.id")
FGA_MODEL_ID=$(echo $OUTPUT | jq ".model.authorization_model_id")

echo "FGA_STORE_ID=$FGA_STORE_ID" > ../.env
echo "FGA_MODEL_ID=$FGA_MODEL_ID" >> ../.env


