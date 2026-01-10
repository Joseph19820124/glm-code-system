"""Learning agent for evaluation and continuous improvement."""

from typing import Any

from glm_code_system.agents.base import BaseAgent


class LearningAgent(BaseAgent):
    """Agent responsible for learning and system improvement."""

    def __init__(
        self,
        model: Any,
        tools: Any,
        knowledge_base: Any,
    ) -> None:
        """Initialize learning agent."""
        system_prompt = """You are a Learning Agent focused on system improvement.

Your responsibilities:
1. Analyze execution results to identify patterns
2. Evaluate code quality and effectiveness
3. Identify successful vs unsuccessful approaches
4. Update knowledge base with learned patterns
5. Suggest improvements to system behavior
6. Monitor performance metrics

When analyzing:
- Look for code patterns that consistently succeed
- Identify common failure modes
- Suggest optimizations
- Be specific and actionable"""
        super().__init__(model, tools, knowledge_base, system_prompt)
        self.metrics: dict[str, Any] = {
            "total_tasks": 0,
            "successful_tasks": 0,
            "patterns_learned": 0,
        }

    async def evaluate_task(
        self,
        task_result: dict[str, Any],
    ) -> dict[str, Any]:
        """Evaluate the outcome of a task."""
        self.metrics["total_tasks"] += 1

        if task_result.get("success", False):
            self.metrics["successful_tasks"] += 1

        prompt = f"""Evaluate this task execution:

Task: {task_result.get('task', {}).get('description', 'Unknown')}
Success: {task_result.get('success', False)}
Output: {task_result.get('output', '')[:500]}

Provide assessment:
1. Success/Failure analysis
2. What went well (if successful)
3. What went wrong (if failed)
4. Key learnings
5. Recommendations for improvement"""

        evaluation = await self.think(prompt, use_memory=False)

        return {
            "evaluation": evaluation,
            "success": task_result.get("success", False),
            "metrics": self.metrics.copy(),
        }

    async def extract_pattern(
        self,
        task_data: dict[str, Any],
    ) -> dict[str, Any] | None:
        """Extract reusable patterns from task execution."""
        if not task_data.get("success"):
            return None

        prompt = f"""Extract reusable patterns from this successful task:

Description: {task_data.get('task', {}).get('description', '')}
Output: {task_data.get('output', '')[:1000]}

Identify:
1. Code patterns that could be reused
2. Approaches that worked well
3. General principles that apply

Format as JSON with 'patterns' array containing:
- type: pattern type (e.g., api_endpoint, data_model, test_pattern)
- code: the pattern code
- description: when and why to use this pattern
- complexity: low/medium/high"""

        response = await self.think(prompt, use_memory=False)

        try:
            import json

            pattern_data = json.loads(response)
            if "patterns" in pattern_data:
                self.metrics["patterns_learned"] += len(pattern_data["patterns"])
                return pattern_data
        except (json.JSONDecodeError, KeyError):
            pass

        return None

    async def suggest_improvements(
        self,
        performance_data: dict[str, Any],
    ) -> list[str]:
        """Suggest system improvements based on performance."""
        success_rate = 0
        if self.metrics["total_tasks"] > 0:
            success_rate = (
                self.metrics["successful_tasks"] / self.metrics["total_tasks"]
            )

        prompt = f"""Analyze system performance and suggest improvements:

Total Tasks: {self.metrics['total_tasks']}
Success Rate: {success_rate:.1%}
Patterns Learned: {self.metrics['patterns_learned']}

Recent Performance:
{json.dumps(performance_data, indent=2)[:1000]}

Suggest 3-5 concrete improvements to:
1. Increase success rate
2. Better utilize knowledge base
3. Improve code quality
4. Speed up execution

Format as a numbered list."""

        suggestions_text = await self.think(prompt, use_memory=False)

        suggestions = []
        for line in suggestions_text.split("\n"):
            line = line.strip()
            if line and line[0].isdigit():
                suggestions.append(line)

        return suggestions

    async def generate_report(self) -> str:
        """Generate learning report."""
        success_rate = 0
        if self.metrics["total_tasks"] > 0:
            success_rate = (
                self.metrics["successful_tasks"] / self.metrics["total_tasks"]
            )

        report = f"""
Learning Agent Report
==================

Performance Metrics:
- Total Tasks: {self.metrics['total_tasks']}
- Successful Tasks: {self.metrics['successful_tasks']}
- Success Rate: {success_rate:.1%}
- Patterns Learned: {self.metrics['patterns_learned']}

System Health: {'Healthy' if success_rate > 0.7 else 'Needs Improvement'}

Top Recommendations:
"""
        recommendations = await self.suggest_improvements({})
        report += "\n".join([f"- {r}" for r in recommendations[:5]])

        return report

    async def improve_from_feedback(
        self,
        feedback: str,
    ) -> dict[str, Any]:
        """Incorporate user feedback into learning."""
        prompt = f"""Analyze and incorporate this user feedback:

{feedback}

Update system behavior and knowledge base to address feedback.
Provide:
1. What was learned
2. How system will change
3. Knowledge base updates needed"""

        improvements = await self.think(prompt)

        return {
            "feedback": feedback,
            "improvements": improvements,
            "applied": True,
        }
