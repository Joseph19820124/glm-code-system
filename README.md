# GLM Code System (TypeScript)

GLM-powered autonomous coding system with self-learning capabilities, rewritten in TypeScript.

## Features

- 🧠 **Three-Agent Architecture**: Planning, Coding, and Learning agents working together
- 📚 **Knowledge Base**: Stores successful patterns and solutions for reuse
- 🔧 **Tool System**: Safe execution of file operations, shell commands, and testing
- 📊 **Continuous Learning**: Improves over time from task execution
- 💬 **Terminal UI**: Clean, intuitive command-line interface using Ink
- 🔒 **Security**: Sandboxed tool execution with allowlist
- ⚡ **Type-Safe**: Full TypeScript support with strict typing

## Migration from Python

This is a complete rewrite of the Python version. All core features have been migrated:

| Python Feature | TypeScript Equivalent |
|--------------|---------------------|
| asyncio | async/await |
| pydantic | zod |
| sqlalchemy | better-sqlite3 |
| httpx | axios |
| rich | chalk + ora |
| pathlib | fs/promises |

## Project Structure

```
glm-code-system/
├── src/                    # Source code
│   ├── agents/           # Agent implementations
│   │   ├── base.ts       # Base agent class
│   │   ├── planning.ts    # Planning agent
│   │   ├── coding.ts      # Coding agent
│   │   └── learning.ts    # Learning agent
│   ├── tools/            # Tool system
│   │   └── registry.ts    # Tool registry and implementations
│   ├── learning/         # Knowledge base
│   │   └── knowledge-base.ts  # Database operations
│   ├── utils/            # Utilities
│   │   └── glm-client.ts  # GLM API client
│   ├── cli/              # User interface
│   │   └── terminal.ts    # Terminal UI
│   └── types/            # Type definitions
├── config/               # Configuration
│   └── settings.ts      # Application settings
├── .env.example         # Environment template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── README.md             # This file
```

## Installation

### Prerequisites

- Node.js 18+ or higher
- GLM API Key ([Get it here](https://open.bigmodel.cn/))

### Setup

```bash
# Clone repository
git clone https://github.com/your-username/glm-code-system.git
cd glm-code-system

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your GLM_API_KEY

# Initialize database
npm run build
```

## Usage

### Start the System

```bash
npm run cli

# Or using tsx directly
tsx src/cli/index.ts
```

### Available Commands

| Command | Description |
|---------|-------------|
| `/help` | Show help information |
| `/plan` | Display current plan |
| `/status` | Show system metrics |
| `/learn` | Display learned patterns |
| `/feedback` | Provide feedback |
| `/clear` | Clear conversation history |
| `/quit` | Exit system |

## Example Tasks

### Simple Task
```
glm-code> 创建一个Python的斐波那契数列函数
```

### Complex Task
```
glm-code> 创建一个带有用户认证的REST API
```

### Multi-Task Development
```
glm-code> 创建一个数据管理系统的完整功能
```

## Configuration

Edit `.env` to customize:

```env
# GLM API Configuration
GLM_API_KEY=your_api_key_here
GLM_MODEL=glm-4                      # glm-3-turbo, glm-4
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4

# Database
DATABASE_URL=file:./knowledge_base.db

# Agent Settings
MAX_ITERATIONS=100                    # Maximum iterations
LEARNING_ENABLED=true                   # Enable learning
AUTONOMY_LEVEL=medium                 # Autonomy: low/medium/high

# Security
ALLOWED_COMMANDS=git,npm,pnpm,yarn,python,pytest,node
SANDBOX_MODE=false                      # Sandbox mode

# UI
UI_MODE=terminal                       # UI mode
LOG_LEVEL=INFO                         # Log level: DEBUG/INFO/WARNING/ERROR
```

## Architecture

### Three-Agent System

#### 1. Planning Agent (`src/agents/planning.ts`)
- Analyzes user requirements
- Searches knowledge base for similar patterns
- Creates detailed execution plan
- Identifies dependencies and risks
- Estimates complexity for each subtask

#### 2. Coding Agent (`src/agents/coding.ts`)
- Implements code using tools
- Reads/writes files safely
- Executes bash commands with restrictions
- Runs tests and validates functionality
- Reports results and issues

#### 3. Learning Agent (`src/agents/learning.ts`)
- Evaluates task execution results
- Extracts reusable patterns
- Tracks performance metrics
- Suggests system improvements
- Incorporates user feedback

### Tool System

Available Tools:
- `read_file(path)` - Read file contents
- `write_file(path, content)` - Write files
- `bash(command)` - Execute shell commands (allowlisted)
- `search_files(pattern, path)` - Search files by pattern

### Knowledge Base

- **CodePattern** - Reusable code patterns with success rates
- **Solution** - Problem-solving approaches
- **UserPreference** - User coding preferences

### Security Features

- Command allowlisting
- Sandbox mode support
- Permission validation
- Clear error messages

## Development

### Running Tests

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run typecheck
```

## Contributing

Contributions welcome! Steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Make your changes
4. Add tests for new features
5. Commit your changes: `git commit -m 'Add some AmazingFeature'`
6. Push to the branch: `git push origin feature/AmazingFeature`
7. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

Inspired by:
- [Claude Code](https://github.com/anthropics/claude-code)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-python)
- [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- Original Python version

## Support

- 📖 [Documentation](https://github.com/your-username/glm-code-system/wiki)
- 🐛 [Issues](https://github.com/your-username/glm-code-system/issues)
- 💬 [Discussions](https://github.com/your-username/glm-code-system/discussions)

---

**Built with TypeScript and ❤️ by GLM Code System Team**
