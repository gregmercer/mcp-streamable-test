# MCP Servers over Streamable HTTP — Step-by-Step Guide

📝 **Read the original full article here**: [MCP Servers over Streamable HTTP (Step-by-Step)](https://aibootcamp.dev/blog/remote-mcp-servers)


---

This repository contains a complete, working example of how to build and run an **MCP (Model Context Protocol) server** using Python, `mcp`, and `FastAPI`. 

You’ll learn how to:

- Expose tools and functions over HTTP using the MCP protocol
- Connect those tools to AI assistants like [Claude Desktop](https://claude.ai/download) or an IDE like [Kiro](https://kiro.dev/)
- Use streamable HTTP as the transport
- Mount multiple MCP servers in a FastAPI app
- Connect to the MCP servers and use tools with NodeJs.

---

## 📁 Folder Structure

```bash
.
├── docs/                        # Diagrams and assets (e.g., mcp-client-server.png)
├── fastapi_example/            # Example mounting multiple MCP servers in FastAPI
│   ├── echo_server.py          # A server exposing a simple echo tool
│   ├── math_server.py          # A server exposing a math tool
│   ├── todos_server.py         # A server exposing todo management tools
│   └── server.py               # FastAPI app that mounts all three servers
├── mcp-client.js               # Node.js client for testing FastMCP servers
├── package.json                # Node.js dependencies for the client
├── .gitignore
├── .python-version             # Python version (for tools like pyenv or uv)
├── pyproject.toml              # Project config and dependencies
├── readme.md                   # You're here!
├── runtime.txt                 # Python runtime for platforms like Render
├── server.py                   # Basic standalone MCP server using Tavily search
├── uv.lock                     # Lockfile for uv dependency manager
```

⸻

🛠 Quickstart
1.	Install uv (recommended Python package manager)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2.	Install dependencies and set up environment

```
uv venv && source .venv/bin/activate
uv pip install -r pyproject.toml
```

3.	Run the FastAPI app with multiple MCP servers

```
uv run fastapi_example/server.py
```

This will mount:
- http://localhost:10000/echo/mcp/
- http://localhost:10000/math/mcp/
- http://localhost:10000/todos/mcp/

⸻

## 🚀 Node.js Client for Testing

This repository includes a comprehensive Node.js client (`mcp-client.js`) that can connect to and test FastMCP servers. The client automatically detects available tools and provides comprehensive testing for all three example servers.

### Features

- **FastMCP Compatible**: Works directly with FastMCP servers using HTTP POST + SSE
- **Auto-Discovery**: Automatically lists and tests available tools
- **Multi-Server Support**: Can connect to any of the example servers
- **Comprehensive Testing**: Includes dedicated test functions for each server type

### Setup

1. **Install Node.js dependencies**:
```bash
npm install
```

2. **Make sure your FastAPI server is running**:
```bash
uv run fastapi_example/server.py
```

### Usage

**Test the Echo Server** (default):
```bash
node mcp-client.js
# or explicitly:
node mcp-client.js http://localhost:10000/echo/mcp/
```

**Test the Math Server**:
```bash
node mcp-client.js http://localhost:10000/math/mcp/
```

**Test the Todos Server**:
```bash
node mcp-client.js http://localhost:10000/todos/mcp/
```

### What the Client Tests

#### Echo Server
- Tests the `echo` tool with multiple messages
- Verifies emoji support and various text formats
- Example output: `echo("Hello!") = Echo: Hello!`

#### Math Server  
- Tests the `add_two` tool with various numbers (5, 10, -3, 0, 100)
- Verifies mathematical operations work correctly
- Example output: `add_two(5) = 7`

#### Todos Server
- Tests both `get_todos` and `create_todo` tools
- Creates sample todos (groceries, walk dog, finish MCP client)
- Shows the complete CRUD workflow
- Displays todo list before and after operations

### Example Output

```bash
🚀 MCP Client Starting...
Server URL: http://localhost:10000/echo/mcp/

Connecting to FastMCP server at: http://localhost:10000/echo/mcp/
✅ Connected successfully!
Server: EchoServer v1.9.3

📋 Listing available tools...
🔧 Found 1 tool(s):

1. echo
   Description: A simple echo tool
   Parameters:
     - message: string 

🔊 Testing Echo Server...
Found echo tool, testing with different messages...
  echo("Hello from Node.js MCP client!") = Echo: Hello from Node.js MCP client!
  echo("🚀 Emojis work too!") = Echo: 🚀 Emojis work too!
```

⸻

## 🤖 LangChain Python Client

This repository also includes a Python client (`langchain-client.py`) that demonstrates how to use MCP servers with LangChain and LangGraph agents. This client connects to multiple MCP servers simultaneously and uses an AI agent to interact with the tools.

### Features

- **LangChain Integration**: Uses `@langchain/mcp-adapters` for seamless MCP integration
- **Multi-Server Support**: Connects to echo, math, and todos servers simultaneously
- **AI Agent**: Uses LangGraph's `create_react_agent` with GPT-4 to intelligently use tools
- **Environment Configuration**: Server URLs configured via `.env` file
- **Comprehensive Testing**: Automated tests for all server types using natural language

### Setup

1. **Configure environment variables** in `.env`:
```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# MCP Server URLs
MCP_ECHO_URL=https://your-server-name-here.onrender.com/echo/mcp
MCP_MATH_URL=https://your-server-name-here.onrender.com/math/mcp
MCP_TODOS_URL=https://your-server-name-here.onrender.com/todos/mcp
```

2. **Install Python dependencies** (already included in `pyproject.toml`):
```bash
uv sync
```

3. **Run the LangChain client**:
```bash
uv run langchain-client.py
```

### What the Client Does

The LangChain client demonstrates advanced MCP usage by:

1. **Connecting to Multiple Servers**: Simultaneously connects to echo, math, and todos MCP servers
2. **Tool Discovery**: Automatically discovers and lists all available tools from connected servers
3. **AI-Powered Tool Usage**: Uses natural language instructions to have the AI agent call appropriate tools
4. **Comprehensive Testing**: Runs through test scenarios for each server type

### Example Usage Patterns

The client shows how an AI agent can:

- **Echo Server**: `"Use the echo tool to echo this message: Hello World!"`
- **Math Server**: `"Use the add_two tool to add 2 to the number 42"`
- **Todos Server**: `"Use the create_todo tool to create a todo with id 1 and item 'Buy groceries'"`

### Example Output

```bash
🔗 Connecting to MCP servers:
  Echo: https://your-server-name-here.onrender.com/echo/mcp
  Math: https://your-server-name-here.onrender.com/math/mcp
  Todos: https://your-server-name-here.onrender.com/todos/mcp

📋 Found 4 tool(s): ['echo', 'add_two', 'get_todos', 'create_todo']

🔊 Testing Echo Server...
  echo('Hello from Python LangChain MCP client!') = I'll echo that message for you: "Hello from Python LangChain MCP client!"

🧮 Testing Math Server...
  add_two(5) = The result of adding 2 to 5 is 7.

📝 Testing Todos Server...
Getting current todos...
  Current todos: Here are the current todos: []
Creating sample todos...
  Created: Buy groceries - I've successfully created the todo item "Buy groceries" with ID 1.
```

This demonstrates how MCP servers can be seamlessly integrated into LangChain workflows, enabling AI agents to use your custom tools and functions.

⸻

🧪 Debug with MCP Inspector

You can use the official MCP Inspector to interactively test and debug your servers:

1. **Launch the MCP Inspector**:
```bash
npx @modelcontextprotocol/inspector
```

2. **Configure the connection** with these settings:
   - **Transport Type**: `Streamable Http`
   - **URL**: `http://localhost:10000/todos/mcp/` (or any of the other server endpoints)
   - **Connection Type**: `Via Proxy`

3. **Available endpoints to test**:
   - `http://localhost:10000/echo/mcp/` - Echo server
   - `http://localhost:10000/math/mcp/` - Math server  
   - `http://localhost:10000/todos/mcp/` - Todos server

The inspector provides a web-based interface to explore available tools, test function calls, and debug your MCP server implementations.



⸻

🔌 Connect to Cursor

In Cursor, add your MCP server under Chat Settings > MCP Servers:

**For the basic Tavily server**:
```json
{
  "mcpServers": {
    "tavily": {
      "url": "http://localhost:8000/mcp/"
    }
  }
}
```

**For the FastAPI example servers**:
```json
{
  "mcpServers": {
    "echo": {
      "url": "http://localhost:10000/echo/mcp/"
    },
    "math": {
      "url": "http://localhost:10000/math/mcp/"
    },
    "todos": {
      "url": "http://localhost:10000/todos/mcp/"
    }
  }
}
```

✅ **Important**: You must include the trailing `/` in all URLs.

## 🛠 Available Tools

### Echo Server (`/echo/mcp/`)
- **`echo`**: Returns the input message with "Echo: " prefix
  - Parameters: `message` (string)
  - Example: `echo("Hello")` → `"Echo: Hello"`

### Math Server (`/math/mcp/`)
- **`add_two`**: Adds 2 to the input number
  - Parameters: `n` (integer)
  - Example: `add_two(5)` → `7`

### Todos Server (`/todos/mcp/`)
- **`get_todos`**: Returns all current todos
  - Parameters: none
  - Returns: Array of todo objects
- **`create_todo`**: Creates a new todo item
  - Parameters: `todo` (object with `id` and `item` fields)
  - Example: `create_todo({id: 1, item: "Buy milk"})` → `"Todo was added"`

⸻

## Deployment

### Deploy to Render.com

The `fastapi_example/server.py` can be easily deployed to Render.com using a free account:

**[Deploy to Render](https://render.com)**

1. Create a Render account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service with these settings:
   - **Build Command**: `uv sync`
   - **Start Command**: `uv run fastapi_example/server.py`
   - **Environment**: Python 3
   - **Plan**: Free (sufficient for testing)

This project is also configured for easy deployment to other platforms like Heroku or any platform that supports Python web applications. The server automatically uses the `PORT` environment variable when available.

### Connect to Claude Desktop

To connect your deployed server to Claude Desktop, use the `mcp-proxy` with these settings in your MCP servers configuration:

```json
{
  "mcpServers": {
    "todos-remote": {
      "command": "uvx",
      "args": [
        "mcp-proxy",
        "--transport",
        "streamablehttp",
        "https://your-server-name-here.onrender.com/todos/mcp"
      ]
    }
  }
}
```

Replace `https://your-server-name-here.onrender.com/todos/mcp` with your actual Render.com deployment URL. You can also connect to the other servers by changing the endpoint:
- `/echo/mcp` for the echo server
- `/math/mcp` for the math server
- `/todos/mcp` for the todos server

⸻
