"""Planning agent for task analysis and decomposition."""

from typing import Any

from glm_code_system.agents.base import BaseAgent


class PlanningAgent(BaseAgent):
    """Agent specialized in planning and task decomposition."""

    def __init__(
        self,
        model: Any,
        tools: Any,
        knowledge_base: Any,
    ) -> None:
        """Initialize planning agent."""
        system_prompt = """You are a Planning Agent for software development tasks.

Your responsibilities:
1. Understand user requirements deeply
2. Search knowledge base for similar past tasks
3. Break down complex tasks into clear, actionable subtasks
4. Identify dependencies between subtasks
5. Estimate complexity for each subtask
6. Identify potential risks and edge cases

Format your plans as:
- Main goal: [clear description]
- Subtasks:
  1. [task description] (complexity: low/medium/high)
  2. [task description] (complexity: low/medium/high)
  ...
- Dependencies: [what must be done first]
- Risks: [potential issues]

Always consider past solutions from the knowledge base."""
        super().__init__(model, tools, knowledge_base, system_prompt)

    async def create_plan(
        self,
        user_request: str,
    ) -> dict[str, Any]:
        """Create a detailed plan for the user request."""
        # Search knowledge base for similar patterns
        relevant_info = await self.search_knowledge(user_request)

        context = ""
        if relevant_info:
            context = "\n\nRelevant past patterns:\n"
            for info in relevant_info:
                context += f"- {info['type']}: {info['description']} (success rate: {info['success_rate']:.0%})\n"

        prompt = f"""Create a detailed development plan for: {user_request}

{context}

Consider best practices and potential issues. Be thorough but practical."""

        plan_text = await self.think(prompt)

        return {
            "request": user_request,
            "plan": plan_text,
            "relevant_patterns": relevant_info,
        }

    async def refine_plan(
        self,
        current_plan: dict[str, Any],
        feedback: str,
    ) -> dict[str, Any]:
        """Refine plan based on feedback."""
        prompt = f"""Refine this plan based on feedback:

Current Plan:
{current_plan['plan']}

Feedback:
{feedback}

Update the plan to address the feedback."""

        refined_plan = await self.think(prompt)

        return {
            **current_plan,
            "plan": refined_plan,
            "refined": True,
        }
