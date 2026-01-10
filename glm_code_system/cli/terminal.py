"""Terminal UI for GLM Code System."""

from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.text import Text
from typing import Any

console = Console()


class TerminalUI:
    """Terminal user interface for the system."""

    def __init__(self) -> None:
        """Initialize terminal UI."""
        self.console = console

    def display_welcome(self) -> None:
        """Display welcome message."""
        welcome_text = """
[bold cyan]GLM Code System[/bold cyan]
[cyan]Autonomous coding with self-learning capabilities[cyan]

Type your task or /[command] to interact.
Available commands:
  /plan     - Show current plan
  /status   - Show system status
  /learn    - Show learned patterns
  /help     - Display help
  /quit     - Exit system
        """
        self.console.print(Panel(welcome_text, title="Welcome", border_style="cyan"))

    def display_agent_thought(self, agent_name: str, thought: str) -> None:
        """Display agent thought process."""
        self.console.print(
            f"\n[bold blue][{agent_name}][/bold blue] {thought}"
        )

    def display_plan(self, plan: dict[str, Any]) -> None:
        """Display development plan."""
        self.console.print(
            Panel(
                plan["plan"],
                title="[bold green]Development Plan[/bold green]",
                border_style="green",
            )
        )

        if plan.get("relevant_patterns"):
            self.console.print("\n[bold]Relevant Patterns:[/bold]")
            for pattern in plan["relevant_patterns"]:
                self.console.print(
                    f"  - [cyan]{pattern['type']}[/cyan]: {pattern['description']} "
                    f"([yellow]{pattern['success_rate']:.0%}[/yellow] success rate)"
                )

    def display_task_start(self, task: dict[str, Any], index: int, total: int) -> None:
        """Display start of task execution."""
        self.console.print(
            f"\n[bold yellow]Task {index}/{total}[/bold yellow]: "
            f"{task['description']} ([cyan]{task.get('complexity', 'medium')}[/cyan])"
        )

    def display_task_complete(
        self,
        task: dict[str, Any],
        success: bool,
        output: str,
    ) -> None:
        """Display task completion."""
        status = "[bold green]✓[/bold green]" if success else "[bold red]✗[/bold red]"
        self.console.print(
            f"{status} {task['description']}",
        )

        if success and output:
            self.console.print(f"\n[dim]{output[:200]}...[/dim]")

    def display_progress(
        self,
        current: int,
        total: int,
        message: str = "Processing...",
    ) -> None:
        """Display progress bar."""
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            console=self.console,
        ) as progress:
            progress.add_task(message, total=total, completed=current)

    async def display_streaming_thought(self, agent_name: str, stream) -> None:
        """Display streaming agent thought."""
        self.console.print(f"\n[bold blue][{agent_name}][/bold blue] ", end="")

        async for chunk in stream:
            self.console.print(chunk, end="")

        self.console.print()

    def display_error(self, error: str) -> None:
        """Display error message."""
        self.console.print(
            f"\n[bold red]Error:[/bold red] {error}",
        )

    def display_success(self, message: str) -> None:
        """Display success message."""
        self.console.print(
            f"\n[bold green]Success:[/bold green] {message}",
        )

    def display_learning(self, patterns_count: int) -> None:
        """Display learning progress."""
        if patterns_count > 0:
            self.console.print(
                f"\n[bold cyan][Learning][/bold cyan] "
                f"Recorded {patterns_count} new patterns in knowledge base"
            )

    def display_metrics(
        self,
        metrics: dict[str, Any],
    ) -> None:
        """Display performance metrics."""
        success_rate = 0
        total = metrics.get("total_tasks", 0)
        if total > 0:
            success_rate = metrics["successful_tasks"] / total

        metrics_text = f"""
[bold]System Metrics[/bold]
━━━━━━━━━━━━━━━━
Total Tasks: {total}
Successful: {metrics.get('successful_tasks', 0)}
Success Rate: [cyan]{success_rate:.1%}[/cyan]
Patterns Learned: {metrics.get('patterns_learned', 0)}
        """
        self.console.print(Panel(metrics_text, border_style="cyan"))

    def display_user_input(self) -> str:
        """Get user input with prompt."""
        return input("\n[bold cyan]glm-code>[/bold cyan] ")

    def display_help(self) -> None:
        """Display help information."""
        help_text = """
[bold]Available Commands:[/bold]
  /[command] - Execute command

[bold]Commands:[/bold]
  /plan     - Show current development plan
  /status   - Show system status and metrics
  /learn    - Display learned patterns and knowledge
  /feedback - Provide feedback on system performance
  /clear    - Clear conversation history
  /help     - Show this help message
  /quit     - Exit the system

[bold]Examples:[/bold]
  Create a user authentication system
  Fix the bug in api/users.py
  Add tests for the payment module
        """
        self.console.print(Panel(help_text, title="Help", border_style="cyan"))

    def display_knowledge(self, patterns: list[Any]) -> None:
        """Display learned patterns."""
        if not patterns:
            self.console.print("\n[yellow]No patterns learned yet.[/yellow]")
            return

        self.console.print("\n[bold]Learned Patterns:[/bold]")
        for i, pattern in enumerate(patterns[:10], 1):
            self.console.print(
                f"\n{[cyan]{i}.[/cyan] [bold]{pattern['type']}[/bold] "
                f"([yellow]{pattern['success_rate']:.0%}[/yellow] used {pattern.get('usage_count', 0)} times)"
            )
            self.console.print(f"   {pattern['description']}")

        if len(patterns) > 10:
            self.console.print(f"\n... and {len(patterns) - 10} more patterns")

    def clear_screen(self) -> None:
        """Clear terminal screen."""
        self.console.clear()
