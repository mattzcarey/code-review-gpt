#!/bin/bash

# Check if a file name is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <PEM_FILE>"
    exit 1
fi

# Read the PEM file and replace newlines with \n
FORMATTED_KEY=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' "$1")

# Output to a new file
echo "PRIVATE_KEY=\"$FORMATTED_KEY\"" > formatted_key.env

echo "Formatted key saved to formatted_key.env"
