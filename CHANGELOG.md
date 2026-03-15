# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-15

### Added
- Initial release
- MCP HTTP client with Streamable HTTP and SSE support
- MCP session management (Mcp-Session-Id header handling)
- Auto-discovery of MCP tools
- JSON Schema to TypeBox conversion for tool parameters
- Global and project-scoped server configurations
- Auto-connect to all servers on Pi startup
- Commands:
  - `/mcp add <name> <url> [--global|--project]` - Add server
  - `/mcp remove <name>` - Remove server
  - `/mcp list` - List servers grouped by scope
  - `/mcp connect [name]` - Connect to all or specific server
  - `/mcp disconnect [name]` - Disconnect from all or specific server
  - `/mcp tools [name]` - List available tools
  - `/mcp status` - Show connection status
  - `/mcp refresh [name]` - Refresh tool list
  - `/mcp scopes` - Show config file paths
- Quick commands:
  - `/mcp-status` - Quick status overview
  - `/mcp-logs` - View debug logs
  - `/mcp-logs clear` - Clear debug logs
- Debug logging to file (`~/.pi/agent/mcp/debug.log`)
- Persistent configuration storage
- Configuration files:
  - Global: `~/.pi/agent/mcp/servers.json`
  - Project: `.pi/mcp/servers.json`

### Added (continued)
- Auto-reconnect when server drops (up to 3 attempts with 5s delay)
- Periodic health check for server connections (30s interval)
- Automatic tool cleanup when server disconnects
- Health check manager with configurable interval

### Known Issues
- No TLS/SSL skip option yet
- No configurable timeout per server
