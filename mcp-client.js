#!/usr/bin/env node

/**
 * Node.js FastMCP Client Script
 * Connects to FastMCP servers using HTTP POST + SSE
 */

import EventSource from 'eventsource';
import fetch from 'node-fetch';

// Polyfill EventSource and fetch for Node.js
global.EventSource = EventSource;
global.fetch = fetch;

class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.requestId = 1;
  }

  async sendRequest(method, params = {}) {
    const request = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method: method,
      params: params
    };

    try {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Read the SSE response
      const text = await response.text();

      // Parse SSE format
      const lines = text.split('\n');
      const dataLine = lines.find(line => line.startsWith('data: '));

      if (dataLine) {
        const jsonData = dataLine.replace('data: ', '').trim();
        return JSON.parse(jsonData);
      } else {
        throw new Error('No data line found in SSE response');
      }
    } catch (error) {
      console.error(`❌ Request failed:`, error.message);
      return null;
    }
  }

  async connect() {
    try {
      console.log(`Connecting to FastMCP server at: ${this.serverUrl}`);

      const result = await this.sendRequest('initialize', {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: "fastmcp-nodejs-client",
          version: "1.0.0"
        }
      });

      if (result && result.result) {
        console.log('✅ Connected successfully!');
        console.log(`Server: ${result.result.serverInfo.name} v${result.result.serverInfo.version}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
  }

  async listTools() {
    try {
      console.log('\n📋 Listing available tools...');

      const result = await this.sendRequest('tools/list');

      if (result && result.result && result.result.tools) {
        const tools = result.result.tools;
        console.log(`\n🔧 Found ${tools.length} tool(s):\n`);

        tools.forEach((tool, index) => {
          console.log(`${index + 1}. ${tool.name}`);
          if (tool.description) {
            console.log(`   Description: ${tool.description}`);
          }
          if (tool.inputSchema && tool.inputSchema.properties) {
            console.log(`   Parameters:`);
            Object.entries(tool.inputSchema.properties).forEach(([param, schema]) => {
              console.log(`     - ${param}: ${schema.type || 'unknown'} ${schema.description ? `(${schema.description})` : ''}`);
            });
          }
          console.log('');
        });

        return tools;
      } else {
        console.log('No tools found.');
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to list tools:', error.message);
      return [];
    }
  }

  async callTool(toolName, args = {}) {
    try {
      console.log(`\n🔧 Calling tool: ${toolName}`);
      console.log(`   Arguments:`, args);

      const result = await this.sendRequest('tools/call', {
        name: toolName,
        arguments: args
      });

      if (result && result.result) {
        console.log(`✅ Tool response:`, result.result);
        return result.result;
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to call tool ${toolName}:`, error.message);
      return null;
    }
  }

  async disconnect() {
    console.log('🔌 Disconnected from server');
  }
}

/**
 * Test Echo Server functionality
 */
async function testEchoServer(client, tools) {
  console.log('\n🔊 Testing Echo Server...');

  const echoTool = tools.find(tool => tool.name === 'echo');
  if (echoTool) {
    console.log('Found echo tool, testing with different messages...');

    // Test with various messages
    const testMessages = [
      'Hello from Node.js MCP client!',
      'Testing echo functionality',
      'MCP is working great!',
      '🚀 Emojis work too!'
    ];

    for (const message of testMessages) {
      const result = await client.callTool('echo', { message });
      if (result && result.content) {
        console.log(`  echo("${message}") = ${result.content[0]?.text || 'unknown'}`);
      }
    }
  } else {
    console.log('❌ echo tool not found. Make sure echo server is running.');
  }
}

/**
 * Test Math Server functionality
 */
async function testMathServer(client, tools) {
  console.log('\n🧮 Testing Math Server...');

  const addTwoTool = tools.find(tool => tool.name === 'add_two');
  if (addTwoTool) {
    console.log('Found add_two tool, testing with different numbers...');

    // Test with various numbers
    const testNumbers = [5, 10, -3, 0, 100];

    for (const num of testNumbers) {
      const result = await client.callTool('add_two', { n: num });
      if (result && result.content) {
        console.log(`  add_two(${num}) = ${result.content[0]?.text || 'unknown'}`);
      }
    }
  } else {
    console.log('❌ add_two tool not found. Make sure math server is running.');
  }
}

/**
 * Test Todos Server functionality
 */
async function testTodosServer(client, tools) {
  console.log('\n📝 Testing Todos Server...');

  const getTodosTool = tools.find(tool => tool.name === 'get_todos');
  const createTodoTool = tools.find(tool => tool.name === 'create_todo');

  if (getTodosTool && createTodoTool) {
    // First, get current todos
    console.log('Getting current todos...');
    let result = await client.callTool('get_todos', {});
    if (result && result.content) {
      console.log('  Current todos:', result.content[0]?.text || '[]');
    }

    // Create some sample todos
    console.log('Creating sample todos...');
    const sampleTodos = [
      { id: 1, item: 'Buy groceries' },
      { id: 2, item: 'Walk the dog' },
      { id: 3, item: 'Finish MCP client' }
    ];

    for (const todo of sampleTodos) {
      const createResult = await client.callTool('create_todo', { todo });
      if (createResult && createResult.content) {
        console.log(`  Created: ${todo.item} - ${createResult.content[0]?.text || 'success'}`);
      }
    }

    // Get todos again to see the updates
    console.log('Getting updated todos...');
    result = await client.callTool('get_todos', {});
    if (result && result.content) {
      console.log('  Updated todos:', result.content[0]?.text || '[]');
    }

  } else {
    console.log('❌ Todos tools not found. Make sure todos server is running.');
    if (!getTodosTool) console.log('  - get_todos tool missing');
    if (!createTodoTool) console.log('  - create_todo tool missing');
  }
}

async function main() {
  // Default server URL - adjust port if needed
  // Use different endpoints for different servers:
  // - Echo server: http://localhost:10000/echo/mcp/
  // - Math server: http://localhost:10000/math/mcp/  
  // - Todos server: http://localhost:10000/todos/mcp/
  const serverUrl = process.argv[2] || 'http://localhost:10000/echo/mcp/';

  console.log('🚀 MCP Client Starting...');
  console.log(`Server URL: ${serverUrl}\n`);

  const client = new MCPClient(serverUrl);

  try {
    // Connect to server
    const connected = await client.connect();
    if (!connected) {
      process.exit(1);
    }

    // List available tools
    const tools = await client.listTools();

    // Echo Server Examples
    await testEchoServer(client, tools);

    // Math Server Examples
    await testMathServer(client, tools);

    // Todos Server Examples  
    await testTodosServer(client, tools);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    await client.disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

// Run the client
main().catch(console.error);
