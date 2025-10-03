from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel
from typing import List

class Todo(BaseModel):
    id: int
    item: str

mcp = FastMCP(name="TodosServer", stateless_http=True)

todos = []

# Todos

# Get all todos
@mcp.tool(description="A get_todos tool")
async def get_todos():
    return todos

# Create a todo
@mcp.tool(description="A create_todos tool")
async def create_todo(todo: Todo):
    print(f"DEBUG: Received todo - ID: {todo.id}, Item: '{todo.item}'")
    todos.append(todo)
    return {"message": "Todo was added"}