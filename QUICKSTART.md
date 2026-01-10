# Quick Start Guide

Get started with GLM Code System in 5 minutes!

## Prerequisites

- Python 3.10 or higher
- GLM API Key ([Get one here](https://open.bigmodel.cn/))

## Installation

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/glm-code-system.git
cd glm-code-system

# Install dependencies
pip install -r requirements.txt

# Or using Poetry
poetry install
```

### 2. Configure

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API key
nano .env
```

Add your API key:
```env
GLM_API_KEY=your_actual_api_key_here
```

### 3. Initialize

```bash
# Initialize knowledge base
python -c "
import asyncio
from glm_code_system.learning.knowledge_base import KnowledgeBase

async def init():
    kb = KnowledgeBase()
    await kb.initialize()
    print('✓ Knowledge base initialized')

asyncio.run(init())
"
```

## Running

### Start the System

```bash
# Using Python
python -m glm_code_system.cli

# Or if installed
glm-code
```

### First Task

Try a simple task:
```
glm-code> Create a Python function to calculate fibonacci numbers
```

Watch as the agents:
1. **Planning Agent** creates a plan
2. **Coding Agent** implements the solution
3. **Learning Agent** analyzes and learns

## Common Commands

### `/help` - Get Help
```
glm-code> /help
```

### `/status` - Check System Status
```
glm-code> /status
```

Shows:
- Total tasks completed
- Success rate
- Patterns learned

### `/learn` - View Learned Patterns
```
glm-code> /learn
```

Shows all patterns the system has learned from your tasks.

### `/plan` - View Current Plan
```
glm-code> /plan
```

If you have an active task, shows the current plan.

### `/clear` - Clear Memory
```
glm-code> /clear
```

Clears conversation history (doesn't affect knowledge base).

## Example Workflows

### 1. Simple Task

```
glm-code> Create a hello world function
```

**What happens:**
1. Planning Agent analyzes request
2. Creates a single-step plan
3. Coding Agent writes the function
4. Learning Agent records the pattern

### 2. Complex Task

```
glm-code> Create a REST API with user authentication
```

**What happens:**
1. Planning Agent breaks it down:
   - Set up FastAPI project
   - Create user model
   - Implement authentication
   - Add endpoints
   - Write tests

2. You review and confirm the plan

3. Coding Agent implements each step:
   - Creates files
   - Runs tests
   - Reports progress

4. Learning Agent:
   - Records successful patterns
   - Updates knowledge base
   - Improves future performance

### 3. Iterative Development

```
glm-code> Create a data processing pipeline
```

If it doesn't work perfectly:

```
glm-code> /feedback
Add error handling for empty data
```

The system improves based on your feedback!

## Tips

### 1. Be Specific
Good:
```
glm-code> Create a FastAPI endpoint that validates JWT tokens and returns user data
```

Less Effective:
```
glm-code> Make an API
```

### 2. Provide Context
Good:
```
glm-code> Add unit tests to api/users.py using pytest
```

### 3. Use Feedback
If the result isn't quite right:
```
glm-code> /feedback
The code works but needs better error messages
```

### 4. Check Learned Patterns
See what the system has learned:
```
glm-code> /learn
```

This helps you understand what it's good at!

## Troubleshooting

### "GLM API Key not found"

Make sure `.env` file exists and has:
```env
GLM_API_KEY=your_key
```

### "Command not allowed"

The system only allows safe commands by default. To add more:

Edit `.env`:
```env
ALLOWED_COMMANDS=git,npm,pnpm,yarn,python,pytest,node,your-command
```

### "Database locked"

The knowledge base might be in use. Ensure:
- Only one instance is running
- No other process is accessing `knowledge_base.db`

## Next Steps

- Read the full [README.md](../README.md)
- Check out [examples/basic_usage.py](./basic_usage.py)
- Contribute to the project!

## Support

- 📖 [Documentation](https://github.com/your-username/glm-code-system/wiki)
- 🐛 [Issues](https://github.com/your-username/glm-code-system/issues)
- 💬 [Discussions](https://github.com/your-username/glm-code-system/discussions)

---

Happy coding! 🚀
