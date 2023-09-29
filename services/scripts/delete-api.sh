#!/bin/bash

# Define a sleep interval in seconds between delete operations
SLEEP_INTERVAL=4

# List all API Gateway REST API IDs
api_ids=$(aws apigateway get-rest-apis --query "items[].id" --output text)

# Check if there are any APIs to delete
if [ -z "$api_ids" ]; then
  echo "No REST APIs found."
  exit 0
fi

# Loop through each API ID
for api_id in $api_ids; do
    echo "Deleting API: $api_id"
    
    # Delete the API
    aws apigateway delete-rest-api --rest-api-id $api_id
    
    # Sleep for the defined interval
    sleep $SLEEP_INTERVAL
done

echo "API deletion completed."
