"""Tool registry and execution system for agents."""

import asyncio
import subprocess
from abc import ABC, abstractmethod
from typing import Any

from config.settings import settings


class ToolResult:
    """Result from tool execution."""

    def __init__(
        self,
        success: bool,
        output: str,
        error: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.success = success
        self.output = output
        self.error = error
        self.metadata = metadata or {}


class BaseTool(ABC):
    """Base class for all tools."""

    name: str
    description: str

    @abstractmethod
    async def execute(self, *args: Any, **kwargs: Any) -> ToolResult:
        """Execute tool with given arguments."""
        pass

    def is_authorized(self) -> bool:
        """Check if tool is authorized to execute."""
        return True


class ReadFileTool(BaseTool):
    """Tool for reading file contents."""

    name = "read_file"
    description = "Read contents of a file at the given path"

    async def execute(self, path: str) -> ToolResult:
        """Read file contents."""
        try:
            import aiofiles

            async with aiofiles.open(path, "r") as f:
                content = await f.read()
            return ToolResult(success=True, output=content)
        except Exception as e:
            return ToolResult(success=False, output="", error=str(e))


class WriteFileTool(BaseTool):
    """Tool for writing content to a file."""

    name = "write_file"
    description = "Write content to a file at the given path"

    async def execute(self, path: str, content: str) -> ToolResult:
        """Write content to file."""
        try:
            import aiofiles

            async with aiofiles.open(path, "w") as f:
                await f.write(content)
            return ToolResult(success=True, output=f"Successfully wrote to {path}")
        except Exception as e:
            return ToolResult(success=False, output="", error=str(e))


class BashTool(BaseTool):
    """Tool for executing shell commands with safety restrictions."""

    name = "bash"
    description = "Execute a shell command (with safety restrictions)"

    async def execute(self, command: str) -> ToolResult:
        """Execute bash command with safety checks."""
        if not self._is_safe_command(command):
            return ToolResult(
                success=False,
                output="",
                error=f"Command not allowed: {command}",
            )

        try:
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                return ToolResult(
                    success=True,
                    output=stdout.decode(),
                    metadata={"exit_code": process.returncode},
                )
            else:
                return ToolResult(
                    success=False,
                    output=stdout.decode(),
                    error=stderr.decode(),
                    metadata={"exit_code": process.returncode},
                )
        except Exception as e:
            return ToolResult(success=False, output="", error=str(e))

    def _is_safe_command(self, command: str) -> bool:
        """Check if command is safe to execute."""
        allowed = settings.allowed_commands_list

        for allowed_cmd in allowed:
            if command.strip().startswith(allowed_cmd):
                return True

        return False


class SearchFilesTool(BaseTool):
    """Tool for searching files by pattern."""

    name = "search_files"
    description = "Search for files matching a pattern"

    async def execute(self, pattern: str, path: str = ".") -> ToolResult:
        """Search for files."""
        try:
            import glob

            matches = glob.glob(f"{path}/**/{pattern}", recursive=True)
            return ToolResult(
                success=True,
                output="\n".join(matches),
                metadata={"count": len(matches)},
            )
        except Exception as e:
            return ToolResult(success=False, output="", error=str(e))


class ToolRegistry:
    """Registry for managing tools."""

    def __init__(self) -> None:
        """Initialize tool registry."""
        self.tools: dict[str, BaseTool] = {}
        self._register_default_tools()

    def _register_default_tools(self) -> None:
        """Register default tools."""
        self.register(ReadFileTool())
        self.register(WriteFileTool())
        self.register(BashTool())
        self.register(SearchFilesTool())

    def register(self, tool: BaseTool) -> None:
        """Register a tool."""
        self.tools[tool.name] = tool

    async def execute(self, tool_name: str, **kwargs: Any) -> ToolResult:
        """Execute a tool by name."""
        tool = self.tools.get(tool_name)

        if tool is None:
            return ToolResult(
                success=False,
                output="",
                error=f"Tool not found: {tool_name}",
            )

        if not tool.is_authorized():
            return ToolResult(
                success=False,
                output="",
                error=f"Tool not authorized: {tool_name}",
            )

        return await tool.execute(**kwargs)

    def get_tool_descriptions(self) -> list[dict[str, str]]:
        """Get descriptions of all available tools."""
        return [
            {"name": name, "description": tool.description}
            for name, tool in self.tools.items()
        ]
