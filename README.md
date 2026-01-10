# GLM Code System

An autonomous coding system powered by GLM models with self-learning capabilities, inspired by Claude Code.

## Features

- 🧠 **Three-Agent Architecture**: Planning, Coding, and Learning agents work together
- 📚 **Knowledge Base**: Stores successful patterns and solutions for reuse
- 🔧 **Tool System**: Safe execution of file operations, bash commands, and testing
- 📊 **Continuous Learning**: Improves over time from task execution
- 💬 **Terminal UI**: Clean, intuitive command-line interface
- 🔒 **Security**: Sandboxed tool execution with allowlist

## Architecture

```
User Input
    ↓
Planning Agent
    ├→ Knowledge Base (search patterns)
    ├→ GLM Model (generate plan)
    ↓
Coding Agent
    ├→ Tools (execute, test, analyze)
    ├→ Knowledge Base (record patterns)
    ↓
Learning Agent
    ├→ Evaluate results
    ├→ Extract patterns
    └→ Update knowledge base
```

## Installation

### Prerequisites

- Python 3.10+
- GLM API Key ([Get it here](https://open.bigmodel.cn/))

### Setup

```bash
# Clone repository
git clone https://github.com/your-username/glm-code-system.git
cd glm-code-system

# Install dependencies
pip install -e .

# Configure environment
cp .env.example .env
# Edit .env and add your GLM_API_KEY

# Run
glm-code
```

## Usage

### Basic Workflow

1. **Start the system**:
   ```bash
   glm-code
   ```

2. **Enter your task**:
   ```
   glm-code> Create a REST API for user authentication
   ```

3. **Review the plan**:
   The Planning Agent will create a detailed plan with subtasks.

4. **Execute**: Confirm and let the Coding Agent implement each task.

5. **Learn**: The Learning Agent analyzes results and updates the knowledge base.

### Commands

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/plan` | Display current development plan |
| `/status` | Show system metrics |
| `/learn` | Display learned patterns |
| `/feedback` | Provide feedback to improve the system |
| `/clear` | Clear conversation history |
| `/quit` | Exit the system |

## Components

### 1. Planning Agent

Breaks down complex tasks into manageable subtasks:
- Analyzes requirements
- Searches knowledge base for similar patterns
- Creates detailed execution plan
- Identifies dependencies and risks

### 2. Coding Agent

Implements tasks using tools:
- Reads and writes files
- Executes bash commands safely
- Runs tests and validates code
- Reports results and issues

### 3. Learning Agent

Continuous improvement:
- Evaluates task execution
- Extracts reusable patterns
- Updates knowledge base
- Suggests system improvements

### 4. Knowledge Base

Stores learned information:
- **Code Patterns**: Reusable code solutions
- **Solutions**: Problem-solving approaches
- **User Preferences**: Coding style and preferences

## Configuration

Edit `.env` to configure:

```env
# GLM API
GLM_API_KEY=your_key_here
GLM_MODEL=glm-4
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4

# Agent Settings
MAX_ITERATIONS=100
LEARNING_ENABLED=true
AUTONOMY_LEVEL=medium

# Security
ALLOWED_COMMANDS=git,npm,pnpm,yarn,python,pytest,node
SANDBOX_MODE=false
```

## Development

### Running Tests

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run with coverage
pytest --cov=glm_code_system
```

### Code Quality

```bash
# Format code
black glm_code_system/

# Lint
ruff check glm_code_system/

# Type check
mypy glm_code_system/
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Roadmap

- [ ] Web UI interface
- [ ] Multi-model support (GLM, Claude, etc.)
- [ ] Cloud knowledge base sync
- [ ] Team collaboration features
- [ ] Advanced learning algorithms
- [ ] Plugin system

## License

MIT License - see LICENSE file for details

## Acknowledgments

Inspired by:
- [Claude Code](https://github.com/anthropics/claude-code)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-python)
- [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)

## Support

- 📖 [Documentation](https://github.com/your-username/glm-code-system/wiki)
- 🐛 [Issues](https://github.com/your-username/glm-code-system/issues)
- 💬 [Discussions](https://github.com/your-username/glm-code-system/discussions)

---

Built with ❤️ by the GLM Code System team
