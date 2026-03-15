# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-03-15

### Added
- Auto-reconnect when server drops (up to 3 attempts with 5s delay)
- Periodic health check for server connections (30s interval)
- Automatic tool cleanup when server disconnects
- MCP Resources support (`/mcp resources`)
- MCP Prompts support (`/mcp prompts`)
- TLS/SSL skip option (`--insecure` flag)
- Configurable timeout per server (`--timeout <ms>`)
- Move server between scopes (`/mcp move <name> --global|--project`)
- Export server configuration (`/mcp export [file]`)
- Import server configuration (`/mcp import <file>`)
- Health check manager with configurable interval

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

### Added (continued)
- MCP Resources support (`/mcp resources`)
- MCP Prompts support (`/mcp prompts`)
- TLS/SSL skip option (`--insecure` flag)
- Configurable timeout per server (`--timeout <ms>`)
- Move server between scopes (`/mcp move <name> --global|--project`)
- Export server configuration (`/mcp export [file]`)
- Import server configuration (`/mcp import <file>`)

### Known Issues
- Server groups not yet implemented
- Tool filters not yet implemented
