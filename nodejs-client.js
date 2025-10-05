// Simple HTTP-based MCP client using fetch with SSE parsing
async function makeRPCRequest(serverEndpoint, method, params = {}) {
    const request = {
        jsonrpc: "2.0",
        id: Math.random().toString(36).substring(7),
        method: method,
        params: params
    };

    const response = await fetch(serverEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        },
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();

    // Parse SSE format
    const lines = text.split('\n');
    for (const line of lines) {
        if (line.startsWith('data: ')) {
            const jsonData = line.substring(6); // Remove 'data: ' prefix
            return JSON.parse(jsonData);
        }
    }

    throw new Error('No data found in SSE response');
}

try {
    const echoEndpoint = "http://localhost:10000/echo/mcp/";
    const todosEndpoint = "http://localhost:10000/todos/mcp/";
    const mathEndpoint = "http://localhost:10000/math/mcp/";

    console.log("=== Testing MCP Echo Server ===");

    // Initialize the echo server connection
    const echoInitResult = await makeRPCRequest(echoEndpoint, "initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
            name: "nodejs-test-client",
            version: "1.0.0"
        }
    });
    console.log("Echo server initialized:", echoInitResult.result.serverInfo);

    // List available tools on echo server
    const echoToolsResult = await makeRPCRequest(echoEndpoint, "tools/list");
    console.log("Echo server tools:", JSON.stringify(echoToolsResult.result.tools, null, 2));

    // Call the echo tool
    const echoResult = await makeRPCRequest(echoEndpoint, "tools/call", {
        name: "echo",
        arguments: {
            message: "Hello from Node.js MCP client!"
        }
    });
    console.log("Echo tool result:", echoResult.result.content[0].text);

    console.log("\n=== Testing MCP Todos Server ===");

    // Initialize the todos server connection
    const todosInitResult = await makeRPCRequest(todosEndpoint, "initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
            name: "nodejs-test-client",
            version: "1.0.0"
        }
    });
    console.log("Todos server initialized:", todosInitResult.result.serverInfo);

    // List available tools on todos server
    const todosToolsResult = await makeRPCRequest(todosEndpoint, "tools/list");
    console.log("Todos server tools:", JSON.stringify(todosToolsResult.result.tools, null, 2));

    // Test todos tools
    console.log("\n=== Testing Todos Tools ===");

    // First, get current todos (should be empty initially)
    const getTodosResult = await makeRPCRequest(todosEndpoint, "tools/call", {
        name: "get_todos",
        arguments: {}
    });
    if (getTodosResult.result.content.length === 0) {
        console.log("📋 Current todos: (empty list)");
    } else {
        const todosData = JSON.parse(getTodosResult.result.content[0].text);
        console.log("📋 Current todos:", Array.isArray(todosData) ? todosData : [todosData]);
    }

    // Create a new todo with unique ID
    const uniqueId = Date.now();
    const createTodoResult = await makeRPCRequest(todosEndpoint, "tools/call", {
        name: "create_todo",
        arguments: {
            todo: {
                id: uniqueId,
                item: "Test todo from Node.js client"
            }
        }
    });
    const createResult = JSON.parse(createTodoResult.result.content[0].text);
    console.log("✅ Create todo result:", createResult.message);

    // Create another todo
    const createTodo2Result = await makeRPCRequest(todosEndpoint, "tools/call", {
        name: "create_todo",
        arguments: {
            todo: {
                id: uniqueId + 1,
                item: "Another test todo"
            }
        }
    });
    const createResult2 = JSON.parse(createTodo2Result.result.content[0].text);
    console.log("✅ Create second todo result:", createResult2.message);

    // Get todos again to see the added items
    const getTodosResult2 = await makeRPCRequest(todosEndpoint, "tools/call", {
        name: "get_todos",
        arguments: {}
    });
    if (getTodosResult2.result.content.length === 0) {
        console.log("📋 Updated todos list: (still empty)");
    } else {
        const updatedTodosData = JSON.parse(getTodosResult2.result.content[0].text);
        console.log("📋 Updated todos list:", Array.isArray(updatedTodosData) ? updatedTodosData : [updatedTodosData]);
    }

    console.log("\n=== Testing MCP Math Server ===");

    // Initialize the math server connection
    const mathInitResult = await makeRPCRequest(mathEndpoint, "initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
            name: "nodejs-test-client",
            version: "1.0.0"
        }
    });
    console.log("Math server initialized:", mathInitResult.result.serverInfo);

    // List available tools on math server
    const mathToolsResult = await makeRPCRequest(mathEndpoint, "tools/list");
    console.log("Math server tools:", JSON.stringify(mathToolsResult.result.tools, null, 2));

    // Test math tools
    console.log("\n=== Testing Math Tools ===");

    // Test the add_two function with different numbers
    const testNumbers = [5, 10, 42, -3, 0];

    for (const num of testNumbers) {
        const mathResult = await makeRPCRequest(mathEndpoint, "tools/call", {
            name: "add_two",
            arguments: {
                n: num
            }
        });
        const result = JSON.parse(mathResult.result.content[0].text);
        console.log(`🧮 add_two(${num}) = ${result}`);
    }

} catch (error) {
    console.error("Error:", error);
}