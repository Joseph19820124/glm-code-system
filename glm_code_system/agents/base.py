"""Base agent class and common functionality."""

from typing import Any

from glm_code_system.utils.glm_client import GLMClient
from glm_code_system.tools.registry import ToolRegistry
from glm_code_system.learning.knowledge_base import KnowledgeBase


class BaseAgent:
    """Base agent with common functionality."""

    def __init__(
        self,
        model: GLMClient,
        tools: ToolRegistry,
        knowledge_base: KnowledgeBase,
        system_prompt: str | None = None,
    ) -> None:
        """Initialize base agent."""
        self.model = model
        self.tools = tools
        self.kb = knowledge_base
        self.system_prompt = system_prompt
        self.memory: list[dict[str, Any]] = []

    async def think(
        self,
        user_input: str,
        use_memory: bool = True,
        temperature: float = 0.7,
    ) -> str:
        """Generate response to user input."""
        messages = []

        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})

        if use_memory and self.memory:
            messages.extend(self.memory)

        messages.append({"role": "user", "content": user_input})

        response = await self.model.generate(messages, temperature=temperature)

        if use_memory:
            self.memory.append({"role": "user", "content": user_input})
            self.memory.append({"role": "assistant", "content": response})

        return response

    async def think_stream(
        self,
        user_input: str,
        use_memory: bool = True,
        temperature: float = 0.7,
    ):
        """Generate streaming response."""
        messages = []

        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})

        if use_memory and self.memory:
            messages.extend(self.memory)

        messages.append({"role": "user", "content": user_input})

        response_chunks = []
        async for chunk in self.model.generate_stream(messages, temperature=temperature):
            response_chunks.append(chunk)
            yield chunk

        full_response = "".join(response_chunks)

        if use_memory:
            self.memory.append({"role": "user", "content": user_input})
            self.memory.append({"role": "assistant", "content": full_response})

    async def use_tool(
        self,
        tool_name: str,
        **kwargs: Any,
    ) -> tuple[bool, str]:
        """Use a tool and return (success, output)."""
        result = await self.tools.execute(tool_name, **kwargs)

        if result.success:
            return (True, result.output)

        return (False, result.error or "Unknown error")

    async def search_knowledge(self, query: str) -> list[Any]:
        """Search knowledge base for relevant information."""
        patterns = await self.kb.search_patterns(limit=5)

        return [
            {
                "type": pattern.pattern_type,
                "code": pattern.code,
                "description": pattern.description,
                "success_rate": pattern.success_rate,
            }
            for pattern in patterns
        ]

    def clear_memory(self) -> None:
        """Clear agent memory."""
        self.memory = []
