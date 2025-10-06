import asyncio
import os
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

# Load environment variables from .env file
load_dotenv()

async def test_echo_server(agent):
    """Test Echo Server functionality"""
    print("\n🔊 Testing Echo Server...")
    
    test_messages = [
        "Hello from Python LangChain MCP client!",
        "Testing echo functionality",
        "MCP is working great!",
        "🚀 Emojis work too!"
    ]
    
    for message in test_messages:
        response = await agent.ainvoke({"messages": f"Use the echo tool to echo this message: {message}"})
        if "messages" in response and response["messages"]:
            last_message = response["messages"][-1]
            content = last_message.content if hasattr(last_message, 'content') else str(last_message)
            print(f"  echo('{message}') = {content}")

async def test_math_server(agent):
    """Test Math Server functionality"""
    print("\n🧮 Testing Math Server...")
    
    test_numbers = [5, 10, -3, 0, 100]
    
    for num in test_numbers:
        response = await agent.ainvoke({"messages": f"Use the add_two tool to add 2 to the number {num}"})
        if "messages" in response and response["messages"]:
            last_message = response["messages"][-1]
            content = last_message.content if hasattr(last_message, 'content') else str(last_message)
            print(f"  add_two({num}) = {content}")

async def test_todos_server(agent):
    """Test Todos Server functionality"""
    print("\n📝 Testing Todos Server...")
    
    # Get current todos
    print("Getting current todos...")
    response = await agent.ainvoke({"messages": "Use the get_todos tool to show me all current todos"})
    if "messages" in response and response["messages"]:
        last_message = response["messages"][-1]
        content = last_message.content if hasattr(last_message, 'content') else str(last_message)
        print(f"  Current todos: {content}")
    
    # Create sample todos
    print("Creating sample todos...")
    sample_todos = [
        {"id": 1, "item": "Buy groceries"},
        {"id": 2, "item": "Walk the dog"},
        {"id": 3, "item": "Finish MCP client"}
    ]
    
    for todo in sample_todos:
        response = await agent.ainvoke({"messages": f"Use the create_todo tool to create a todo with id {todo['id']} and item '{todo['item']}'"})
        if "messages" in response and response["messages"]:
            last_message = response["messages"][-1]
            content = last_message.content if hasattr(last_message, 'content') else str(last_message)
            print(f"  Created: {todo['item']} - {content}")
    
    # Get updated todos
    print("Getting updated todos...")
    response = await agent.ainvoke({"messages": "Use the get_todos tool to show me all current todos after adding the new ones"})
    if "messages" in response and response["messages"]:
        last_message = response["messages"][-1]
        content = last_message.content if hasattr(last_message, 'content') else str(last_message)
        print(f"  Updated todos: {content}")

async def main():
    # Get MCP server URLs from environment variables
    echo_url = os.getenv("MCP_ECHO_URL", "https://your-server-name-here.onrender.com/echo/mcp")
    math_url = os.getenv("MCP_MATH_URL", "https://your-server-name-here.onrender.com/math/mcp")
    todos_url = os.getenv("MCP_TODOS_URL", "https://your-server-name-here.onrender.com/todos/mcp")
    
    print(f"🔗 Connecting to MCP servers:")
    print(f"  Echo: {echo_url}")
    print(f"  Math: {math_url}")
    print(f"  Todos: {todos_url}")
    
    client = MultiServerMCPClient(
        {
            "echo": {
                "transport": "streamable_http",
                "url": echo_url,
            },
            "math": {
                "transport": "streamable_http", 
                "url": math_url,
            },
            "todos": {
                "transport": "streamable_http",
                "url": todos_url,
            }
        }
    )

    # Load available MCP tools asynchronously
    tools = await client.get_tools()
    print(f"📋 Found {len(tools)} tool(s): {[tool.name for tool in tools]}")

    # Create an agent (change to your preferred LLM model)
    agent = create_react_agent("gpt-4-turbo-preview", tools)

    try:
        # Test Echo Server
        # await test_echo_server(agent)
        
        # Test Math Server
        await test_math_server(agent)
        
        # Test Todos Server
        # await test_todos_server(agent)
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    asyncio.run(main())
