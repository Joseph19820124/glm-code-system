"""
Example usage of GLM Code System
================================

This demonstrates how to use the system programmatically.
"""

import asyncio
from glm_code_system.cli import GLMCodeSystem


async def example_basic_task():
    """Example: Basic task execution."""
    system = GLMCodeSystem()
    await system.initialize()

    print("=" * 50)
    print("Example 1: Basic Task")
    print("=" * 50)

    # Process a simple task
    await system.process_task("Create a hello world function in Python")

    print("\n" + "=" * 50)
    print("Example Complete!")
    print("=" * 50)


async def example_with_feedback():
    """Example: Task with feedback loop."""
    system = GLMCodeSystem()
    await system.initialize()

    print("=" * 50)
    print("Example 2: Task with Feedback")
    print("=" * 50)

    # Provide a task and then feedback
    task = "Create a user registration API endpoint"

    await system.process_task(task)

    # Simulate user feedback
    await system.handle_feedback(
        "The API works, but I need input validation"
    )

    print("\n" + "=" * 50)
    print("Example Complete!")
    print("=" * 50)


async def example_learning_demonstration():
    """Example: Demonstrating learning capabilities."""
    system = GLMCodeSystem()
    await system.initialize()

    print("=" * 50)
    print("Example 3: Learning Demonstration")
    print("=" * 50)

    # Execute multiple tasks to see learning
    tasks = [
        "Create a database connection utility",
        "Add error handling to the connection",
        "Create a user model with Pydantic",
        "Write tests for the user model",
    ]

    for i, task in enumerate(tasks, 1):
        print(f"\n--- Task {i}/{len(tasks)} ---")
        await system.process_task(task)

    # Show what was learned
    print("\n" + "=" * 50)
    print("Learning Summary")
    print("=" * 50)
    await system.show_knowledge()

    print("\n" + "=" * 50)
    print("Example Complete!")
    print("=" * 50)


async def example_knowledge_base_interaction():
    """Example: Direct knowledge base interaction."""
    from glm_code_system.learning.knowledge_base import KnowledgeBase

    print("=" * 50)
    print("Example 4: Knowledge Base Interaction")
    print("=" * 50)

    kb = KnowledgeBase()
    await kb.initialize()

    # Add a custom pattern
    pattern = await kb.add_pattern(
        pattern_type="error_handling",
        code="""
try:
    result = risky_operation()
except Exception as e:
    logger.error(f"Operation failed: {e}")
    raise CustomError("Could not complete operation")
        """,
        description="Standard error handling pattern with logging",
        context="Used in all service layers",
    )

    print(f"✓ Added pattern ID: {pattern.id}")
    print(f"  Type: {pattern.pattern_type}")
    print(f"  Description: {pattern.description}")

    # Search for patterns
    patterns = await kb.search_patterns(pattern_type="error_handling")

    print(f"\n✓ Found {len(patterns)} error handling patterns")

    await system.model.close()


async def main():
    """Run all examples."""
    print("""
╔════════════════════════════════════════════╗
║                                            ║
║   GLM Code System - Examples           ║
║                                            ║
╚════════════════════════════════════════════╝

This demonstrates various features of the system.
    """)

    # Uncomment the example you want to run:

    # await example_basic_task()
    # await example_with_feedback()
    # await example_learning_demonstration()
    # await example_knowledge_base_interaction()

    print("""
Available examples:
1. example_basic_task() - Simple task execution
2. example_with_feedback() - Task with feedback loop
3. example_learning_demonstration() - Multi-task learning
4. example_knowledge_base_interaction() - Direct KB interaction

To run an example, uncomment it in the main() function.
    """)


if __name__ == "__main__":
    asyncio.run(main())
