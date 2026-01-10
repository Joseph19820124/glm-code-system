"""Coding agent for implementing tasks."""

import json
from typing import Any

from glm_code_system.agents.base import BaseAgent
from glm_code_system.tools.registry import ToolResult


class CodingAgent(BaseAgent):
    """Agent specialized in writing and modifying code."""

    def __init__(
        self,
        model: Any,
        tools: Any,
        knowledge_base: Any,
    ) -> None:
        """Initialize coding agent."""
        system_prompt = """You are a Coding Agent responsible for implementing software.

Your responsibilities:
1. Understand the task requirements clearly
2. Search knowledge base for relevant code patterns
3. Write clean, maintainable code following best practices
4. Use tools to read, write, and test code
5. Run tests and verify functionality
6. Report results and any issues

Available tools:
- read_file(path): Read file contents
- write_file(path, content): Write content to file
- bash(command): Execute shell commands
- search_files(pattern): Search for files

When using tools, clearly state what you're doing and why.
Always test your changes if possible.
Report success or failure clearly."""
        super().__init__(model, tools, knowledge_base, system_prompt)
        self.current_task: dict[str, Any] | None = None
        self.test_results: list[dict[str, Any]] = []

    async def execute_task(
        self,
        task: dict[str, Any],
        plan_context: str | None = None,
    ) -> dict[str, Any]:
        """Execute a single coding task."""
        self.current_task = task

        context = f"Context:\n{plan_context}" if plan_context else ""

        prompt = f"""Execute this coding task:

Task: {task['description']}
Complexity: {task.get('complexity', 'medium')}

{context}

Use available tools to implement this task.
Test your changes if possible.
Report the result clearly."""

        result = await self.think_stream(prompt)

        return {
            "task": task,
            "success": True,
            "output": result,
            "test_results": self.test_results,
        }

    async def write_code(
        self,
        path: str,
        content: str,
        description: str,
    ) -> ToolResult:
        """Write code to file and track in knowledge base."""
        result = await self.use_tool("write_file", path=path, content=content)

        if result[0]:
            pattern_type = self._infer_pattern_type(description)
            await self.kb.add_pattern(
                pattern_type=pattern_type,
                code=content,
                description=description,
                context=f"File: {path}",
            )

        return result[0], result[1]

    async def run_tests(self) -> list[dict[str, Any]]:
        """Run tests for the current task."""
        results = []

        success, output = await self.use_tool("bash", "pytest -v")

        test_result = {
            "command": "pytest -v",
            "success": success,
            "output": output,
        }

        results.append(test_result)
        self.test_results.append(test_result)

        return results

    async def analyze_code(
        self,
        file_path: str,
    ) -> dict[str, Any]:
        """Analyze code in a file."""
        success, content = await self.use_tool("read_file", path=file_path)

        if not success:
            return {"error": content}

        prompt = f"""Analyze this code:\n\n{content}\n\nProvide:
- Code quality assessment
- Potential issues
- Suggestions for improvement
- Complexity estimate"""

        analysis = await self.think(prompt, use_memory=False)

        return {
            "file": file_path,
            "content": content,
            "analysis": analysis,
        }

    async def learn_from_execution(
        self,
        task_result: dict[str, Any],
    ) -> None:
        """Learn from the execution of a task."""
        if task_result["success"]:
            # Record successful patterns
            await self.kb.add_solution(
                problem_type="coding_task",
                solution=task_result.get("output", ""),
                description=f"Successfully completed: {self.current_task['description']}",
                metadata={"task": self.current_task},
            )
        else:
            # Record issues for future avoidance
            pass

    def _infer_pattern_type(self, description: str) -> str:
        """Infer pattern type from description."""
        description_lower = description.lower()

        if "api" in description_lower or "endpoint" in description_lower:
            return "api_endpoint"
        elif "model" in description_lower:
            return "data_model"
        elif "test" in description_lower:
            return "test"
        elif "component" in description_lower or "ui" in description_lower:
            return "ui_component"
        else:
            return "general_code"
