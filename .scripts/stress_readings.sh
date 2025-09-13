#!/bin/bash

# Exit on error
set -e

# Configuration
LOGIN_URL="http://localhost:7771/tempmesh/api/auth/login"
DEVICES_URL="http://localhost:7771/tempmesh/api/devices"
READINGS_URL="http://localhost:7771/tempmesh/api/readings/add"
EMAIL="test@example.com"
PASSWORD="password123"
CONNECTIONS=1000
REQUESTS=1000
TIMEOUT="5s"
DURATION="30s"
NUM_READINGS=100  # Number of readings per JSON body (adjust as needed)

# Function to check and install jq
install_jq() {
  if ! command -v jq &>/dev/null; then
    echo "jq not found. Attempting to install..."
    if command -v apt-get &>/dev/null; then
      echo "Detected apt (Ubuntu/Debian). Installing jq..."
      sudo apt-get update
      sudo apt-get install -y jq
    elif command -v brew &>/dev/null; then
      echo "Detected Homebrew (macOS). Installing jq..."
      brew install jq
    else
      echo "Error: No supported package manager (apt or brew) found. Please install jq manually."
      echo "For Ubuntu/Debian: sudo apt-get install jq"
      echo "For macOS: brew install jq"
      echo "For other systems, see https://jqlang.github.io/jq/download/"
      exit 1
    fi
    # Verify installation
    if ! command -v jq &>/dev/null; then
      echo "Error: jq installation failed. Please install jq manually."
      exit 1
    fi
    echo "jq installed successfully."
  else
    echo "jq is already installed."
  fi
}

# Function to check and install Go
install_go() {
  if ! command -v go &>/dev/null; then
    echo "Go not found. Attempting to install..."
    if command -v apt-get &>/dev/null; then
      echo "Detected apt (Ubuntu/Debian). Installing golang..."
      sudo apt-get update
      sudo apt-get install -y golang
    elif command -v brew &>/dev/null; then
      echo "Detected Homebrew (macOS). Installing go..."
      brew install go
    else
      echo "Error: No supported package manager (apt or brew) found. Please install Go manually."
      echo "Download and install from https://go.dev/dl/"
      exit 1
    fi
    # Verify installation
    if ! command -v go &>/dev/null; then
      echo "Error: Go installation failed. Please install Go manually from https://go.dev/dl/"
      exit 1
    fi
    echo "Go installed successfully."
  else
    echo "Go is already installed."
  fi
}

# Function to check and install Bombardier
install_bombardier() {
  if ! command -v bombardier &>/dev/null; then
    echo "Bombardier not found. Attempting to install..."
    # Ensure Go is installed before attempting to install Bombardier
    install_go
    # Set up Go environment (ensure GOPATH is set)
    export GOPATH=${GOPATH:-$HOME/go}
    export PATH=$PATH:$GOPATH/bin
    # Install Bombardier
    go install github.com/codesenberg/bombardier@latest
    # Verify installation
    if ! command -v bombardier &>/dev/null; then
      echo "Error: Bombardier installation failed. Please install manually with:"
      echo "go install github.com/codesenberg/bombardier@latest"
      exit 1
    fi
    echo "Bombardier installed successfully."
  else
    echo "Bombardier is already installed."
  fi
}

# Check and install dependencies
install_jq
install_bombardier

# Login to get JWT token
echo "Logging in to $LOGIN_URL..."
LOGIN_RESPONSE=$(curl -s -X POST "$LOGIN_URL" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

# Extract JWT token (assuming response is { "access_token": "..." })
JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" = "null" ]; then
  echo "Error: Failed to obtain JWT token. Response: $LOGIN_RESPONSE"
  exit 1
fi
echo "JWT token obtained successfully."

# Fetch seeded devices and extract MACs (prefer WORKER+ACTIVE; fallback to all)
echo "Fetching devices from $DEVICES_URL..."
DEVICES_JSON=$(curl -s -X GET "$DEVICES_URL" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN")

MACS_JSON=$(echo "$DEVICES_JSON" | jq -c '[ .[] | select((.role=="WORKER") and (.status=="ACTIVE")) | .macAddress ]')
if [ "$(echo "$MACS_JSON" | jq 'length')" -eq 0 ]; then
  MACS_JSON=$(echo "$DEVICES_JSON" | jq -c '[ .[] | .macAddress ]')
fi

MAC_COUNT=$(echo "$MACS_JSON" | jq 'length')
if [ "$MAC_COUNT" -eq 0 ]; then
  echo "Error: No devices found. Seed the database first (see prisma/seed.ts)."
  exit 1
fi
echo "Using $MAC_COUNT device MAC(s) from seed."

# Build JSON body with NUM_READINGS entries using seeded MACs
READINGS_JSON=$(jq -c -n \
  --argjson num_readings "$NUM_READINGS" \
  --argjson macs "$MACS_JSON" \
  '
  def lcg(s): ((s * 1103515245 + 12345) % 2147483648);
  def rnd01(s): (lcg(s) / 2147483648);
  def randf(min; max; s): (rnd01(s) * (max - min) + min);
  def pick_mac(s): $macs[(lcg(s)) % ($macs|length)];
  {
    data: [
      range($num_readings) as $i |
      (now*1000|floor) as $t |
      {
        mac: pick_mac($t + ($i*13)),
        temp: (randf(15; 35; $t + ($i*17))),
        hum: (randf(30; 80; $t + ($i*23))),
        readingTime: (now | todateiso8601)
      }
    ]
  }')

# Debug: Print the generated JSON
# echo "Generated JSON body:"
# echo "$READINGS_JSON"
# echo ""

# Save JSON body to a temporary file (Bombardier reads body from file or string)
TEMP_BODY_FILE=$(mktemp)
echo "$READINGS_JSON" > "$TEMP_BODY_FILE"

# Run Bombardier
echo "Starting Bombardier stress test on $READINGS_URL..."
bombardier \
  -c "$CONNECTIONS" \
  -n "$REQUESTS" \
  -t "$TIMEOUT" \
  -d "$DURATION" \
  -m POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -b "@$TEMP_BODY_FILE" \
  "$READINGS_URL"

# Clean up
rm "$TEMP_BODY_FILE"
echo "Stress test completed."