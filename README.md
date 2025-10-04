# MCP Remote Server Example

This project demonstrates how to create and deploy remote Model Context Protocol (MCP) servers using FastAPI. It includes multiple MCP servers that can be accessed remotely via HTTP, making them available to Claude Desktop and other MCP clients.

## Project Structure

The project contains three example MCP servers:

- **Echo Server** (`echo_server.py`) - A simple echo tool that returns the input message
- **Math Server** (`math_server.py`) - A basic math tool that adds 2 to any number
- **Todos Server** (`todos_server.py`) - A todo management system with create and retrieve functionality

All servers are combined into a single FastAPI application (`server.py`) and mounted at different endpoints.

## Features

- **Remote MCP Access**: Servers are accessible via HTTP using the streamable HTTP transport
- **Multiple Endpoints**: Each MCP server is mounted at its own path (`/echo`, `/math`, `/todos`)
- **Stateless Design**: All servers are configured for stateless HTTP operation
- **Production Ready**: Configured for deployment with environment-based port configuration

## Installation

1. Clone this repository
2. Install dependencies using uv:
   ```bash
   uv sync
   ```

## Running the Server

Start the FastAPI server:

```bash
uv run python fastapi_example/server.py
```

The server will start on port 10000 by default (configurable via `PORT` environment variable).

## Available Tools

### Echo Server (`/echo/mcp`)
- `echo(message: str)` - Returns the input message with "Echo: " prefix

### Math Server (`/math/mcp`)
- `add_two(n: int)` - Adds 2 to the input number

### Todos Server (`/todos/mcp`)
- `get_todos()` - Retrieves all todos
- `create_todo(todo: Todo)` - Creates a new todo item

## Claude Desktop Configuration

To use this MCP server with Claude Desktop, add the following configuration to your MCP settings file:

### For Remote Server (Production)

```json
{
  "mcpServers": {
    "todos-remote": {
        "command": "uvx",
        "args": [
          "mcp-proxy",
          "--transport",
          "streamablehttp",
          "https://mcp-streamable-test.onrender.com/echo/mcp"
        ]
    }
  }
}
```

### For Local Development

```json
{
  "mcpServers": {
    "todos-local": {
        "command": "uvx",
        "args": [
          "mcp-proxy",
          "--transport",
          "streamablehttp",
          "http://localhost:10000/todos/mcp"
        ]
    }
  }
}
```

## Dependencies

- **FastAPI** - Web framework for building the HTTP server
- **MCP** - Model Context Protocol implementation
- **python-dotenv** - Environment variable management
- **Pydantic** - Data validation and serialization

## Deployment

This project is configured for easy deployment to platforms like Render, Heroku, or any other platform that supports Python web applications. The server automatically uses the `PORT` environment variable when available.

## Development

To add new MCP tools:

1. Create a new server file (e.g., `new_server.py`)
2. Define your tools using the `@mcp.tool()` decorator
3. Import and mount the server in `server.py`
4. Update the lifespan context manager to include your new server

## License

This project is provided as an example for educational purposes.