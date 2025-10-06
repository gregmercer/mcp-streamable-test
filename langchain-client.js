import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function testEchoServer(agent) {
  console.log("\n🔊 Testing Echo Server...");

  const testMessages = [
    "Hello from JavaScript LangChain MCP client!",
    "Testing echo functionality",
    "MCP is working great!",
    "🚀 Emojis work too!"
  ];

  for (const message of testMessages) {
    try {
      const response = await agent.invoke({
        messages: [{ role: "user", content: `Use the echo tool to echo this message: ${message}` }]
      });

      if (response.messages && response.messages.length > 0) {
        const lastMessage = response.messages[response.messages.length - 1];
        console.log(`  echo('${message}') = ${lastMessage.content}`);
      }
    } catch (error) {
      console.log(`  echo('${message}') = Error: ${error.message}`);
    }
  }
}

async function testMathServer(agent) {
  console.log("\n🧮 Testing Math Server...");

  const testNumbers = [5, 10, -3, 0, 100];

  for (const num of testNumbers) {
    try {
      const response = await agent.invoke({
        messages: [{ role: "user", content: `Use the add_two tool to add 2 to the number ${num}` }]
      });

      if (response.messages && response.messages.length > 0) {
        const lastMessage = response.messages[response.messages.length - 1];
        console.log(`  add_two(${num}) = ${lastMessage.content}`);
      }
    } catch (error) {
      console.log(`  add_two(${num}) = Error: ${error.message}`);
    }
  }
}

async function testTodosServer(agent) {
  console.log("\n📝 Testing Todos Server...");

  // Get current todos
  console.log("Getting current todos...");
  try {
    const response = await agent.invoke({
      messages: [{ role: "user", content: "Use the get_todos tool to show me all current todos" }]
    });

    if (response.messages && response.messages.length > 0) {
      const lastMessage = response.messages[response.messages.length - 1];
      console.log(`  Current todos: ${lastMessage.content}`);
    }
  } catch (error) {
    console.log(`  Current todos: Error: ${error.message}`);
  }

  // Create sample todos
  console.log("Creating sample todos...");
  const sampleTodos = [
    { id: 1, item: "Buy groceries" },
    { id: 2, item: "Walk the dog" },
    { id: 3, item: "Finish MCP client" }
  ];

  for (const todo of sampleTodos) {
    try {
      const response = await agent.invoke({
        messages: [{ role: "user", content: `Use the create_todo tool to create a todo with id ${todo.id} and item '${todo.item}'` }]
      });

      if (response.messages && response.messages.length > 0) {
        const lastMessage = response.messages[response.messages.length - 1];
        console.log(`  Created: ${todo.item} - ${lastMessage.content}`);
      }
    } catch (error) {
      console.log(`  Created: ${todo.item} - Error: ${error.message}`);
    }
  }
  
  // Get final todos list to show what was created
  console.log("Getting final todos list...");
  try {
    const response = await agent.invoke({
      messages: [{ role: "user", content: "Use the get_todos tool to show me the complete final list of all todos" }]
    });

    if (response.messages && response.messages.length > 0) {
      const lastMessage = response.messages[response.messages.length - 1];
      console.log(`  Final todos list: ${lastMessage.content}`);
    }
  } catch (error) {
    console.log(`  Final todos list: Error: ${error.message}`);
  }
}

async function main() {
  try {
    // Get MCP server URLs from environment variables
    const echoUrl = process.env.MCP_ECHO_URL || "https://your-server-name-here.onrender.com/echo/mcp";
    const mathUrl = process.env.MCP_MATH_URL || "https://your-server-name-here.onrender.com/math/mcp";
    const todosUrl = process.env.MCP_TODOS_URL || "https://your-server-name-here.onrender.com/todos/mcp";

    console.log("🔗 Connecting to MCP servers:");
    console.log(`  Echo: ${echoUrl}`);
    console.log(`  Math: ${mathUrl}`);
    console.log(`  Todos: ${todosUrl}`);

    // Configure your MCP servers
    const client = new MultiServerMCPClient({
      mcpServers: {
        "echo": {
          url: echoUrl,
          transport: "http"
        },
        "math": {
          url: mathUrl,
          transport: "http"
        },
        "todos": {
          url: todosUrl,
          transport: "http"
        }
      }
    });

    const tools = await client.getTools();
    console.log(`📋 Found ${tools.length} tool(s): [${tools.map(t => t.name).join(', ')}]`);

    /*
    // Add some debugging to see what the tools look like
    console.log("🔍 Debugging tool schemas:");
    tools.forEach((tool, index) => {
      console.log(`  Tool ${index + 1}: ${tool.name}`);
      console.log(`    Schema: ${JSON.stringify(tool.schema, null, 2)}`);
    });

    // Fix problematic schemas by flattening $ref references
    const fixedTools = tools.map(tool => {
      if (tool.name === 'create_todo' && tool.schema.$defs) {
        // Flatten the $ref reference for create_todo
        const fixedSchema = {
          ...tool.schema,
          properties: {
            todo: {
              type: "object",
              properties: {
                id: { type: "integer", title: "Id" },
                item: { type: "string", title: "Item" }
              },
              required: ["id", "item"],
              title: "Todo"
            }
          }
        };
        delete fixedSchema.$defs;

        return {
          ...tool,
          schema: fixedSchema
        };
      }
      return tool;
    });

    console.log("🔧 Fixed schemas:");
    fixedTools.forEach((tool, index) => {
      if (tool.name === 'create_todo') {
        console.log(`  Fixed Tool: ${tool.name}`);
        console.log(`    Schema: ${JSON.stringify(tool.schema, null, 2)}`);
      }
    });
    */

    //const model = new ChatOpenAI({
      //modelName: "gpt-4",
      //temperature: 0
    //});

    const model = new ChatAnthropic({
      model: "claude-3-7-sonnet-20250219",
      temperature: 0
    });

    console.log("🤖 Creating agent...");
    const agent = createReactAgent({ llm: model, tools: tools });

    // Test Echo Server
    await testEchoServer(agent);

    // Test Math Server
    await testMathServer(agent);

    // Test Todos Server
    await testTodosServer(agent);

    console.log("\n✅ All tests completed!");

  } catch (error) {
    console.error("❌ Error during testing:", error.message);
    console.error("Full error:", error);
  }
}

main().catch(console.error);
