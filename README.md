# MCP Server for Homey

Model Context Protocol (MCP) server for interacting with the Homey smart home platform.

## Features

- **Device Management**: List and control all Homey devices
- **Capability Control**: Set device capabilities (on/off, brightness, temperature, etc.)
- **Zone Management**: List and organize zones
- **Flow Automation**: List and trigger Homey Flows

## Prerequisites

- Node.js >= 18
- A Homey Pro device with local API access
- Homey API token and local IP address

## Getting Homey API Credentials

1. Navigate to Settings → API Keys in the Homey Web App
2. Tap "New API Key"
3. Give it a name and select appropriate permissions
4. Copy the generated API token
5. Find your Homey's local IP address in Settings → General → Network

## Installation

```bash
npm install
npm run build
```

## Configuration

Create a `.env` file or set environment variables:

```bash
HOMEY_API_TOKEN=your_api_token_here
HOMEY_LOCAL_IP=192.168.1.xxx
```

## Usage

### Running the Server

```bash
npm run build
node dist/index.js
```

### Claude Desktop Configuration

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "homey": {
      "command": "node",
      "args": ["/absolute/path/to/demo/dist/index.js"],
      "env": {
        "HOMEY_API_TOKEN": "your_api_token_here",
        "HOMEY_LOCAL_IP": "192.168.1.xxx"
      }
    }
  }
}
```

## Available Tools

### list_devices
List all devices connected to Homey with their capabilities and status.

### get_device
Get detailed information about a specific device.

**Parameters:**
- `deviceId` (string): The ID of the device

### set_capability
Set a capability value for a device.

**Parameters:**
- `deviceId` (string): The ID of the device
- `capability` (string): The capability to set (e.g., `onoff`, `dim`, `target_temperature`)
- `value` (any): The value to set

**Examples:**
- Turn on a light: `{ deviceId: "abc123", capability: "onoff", value: true }`
- Set brightness: `{ deviceId: "abc123", capability: "dim", value: 0.5 }`
- Set temperature: `{ deviceId: "abc123", capability: "target_temperature", value: 21 }`

### list_zones
List all zones in your Homey setup.

### list_flows
List all available Flows.

### trigger_flow
Trigger a specific Homey Flow.

**Parameters:**
- `flowId` (string): The ID of the flow to trigger

## Development

### Watch Mode

```bash
npm run watch
```

### Project Structure

```
.
├── src/
│   └── index.ts       # Main MCP server implementation
├── dist/              # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## Common Device Capabilities

- `onoff`: Turn device on/off (boolean)
- `dim`: Brightness level (0-1)
- `target_temperature`: Target temperature (number)
- `measure_temperature`: Current temperature (read-only)
- `measure_power`: Power consumption (read-only)
- `measure_humidity`: Humidity level (read-only)
- `volume_set`: Volume level (0-1)
- `speaker_playing`: Playback state (boolean)

## Troubleshooting

### Connection Issues

- Verify your Homey's local IP address hasn't changed
- Ensure the API token has sufficient permissions
- Check that your device is on the same network as Homey

### Device Not Found

- Use `list_devices` to get the correct device ID
- Verify the device is available in the Homey app

## License

MIT
