# Changelog

All notable changes to GLM Code System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Web UI interface
- Multi-model support (GLM, Claude, GPT)
- Cloud knowledge base synchronization
- Advanced learning algorithms
- Plugin system
- Team collaboration features

## [0.1.0] - 2026-01-09

### Added
- Three-agent architecture (Planning, Coding, Learning)
- Knowledge base with pattern storage and retrieval
- Tool system with safety restrictions and allowlisting
- Terminal UI interface with Rich library
- GLM API integration with streaming support
- Self-learning capabilities from task execution
- Command system (/help, /plan, /status, /learn, /feedback, /clear)
- SQLite database with SQLAlchemy
- Async/await architecture throughout
- Configuration management with environment variables
- User preference learning
- Code pattern extraction and storage
- Success rate tracking and metrics

### Agents
- **PlanningAgent**: Task decomposition and planning
- **CodingAgent**: Code implementation and testing
- **LearningAgent**: Evaluation and continuous improvement

### Tools
- ReadFileTool: Read file contents safely
- WriteFileTool: Write files with knowledge base integration
- BashTool: Execute shell commands with safety restrictions
- SearchFilesTool: Search files by pattern

### Documentation
- Comprehensive README
- Quick start guide
- Example usage scripts
- Inline code documentation

### Project Structure
- Modular architecture with clear separation of concerns
- Type hints throughout
- Async-first design
- Test directory structure ready

### Configuration
- Environment variable based configuration
- GLM API key management
- Command allowlisting for security
- Autonomy level settings
- Learning toggle

## [0.0.1] - Future

### Planned
- Unit tests for all components
- Integration tests
- Performance optimization
- Caching for frequent operations
- Error recovery mechanisms
- Better logging and debugging

## [0.0.2] - Future

### Planned
- Web-based UI
- Real-time collaboration
- Multi-user support
- Project templates
- CI/CD integration
- GitHub integration

---

**Note:** Version numbers below 1.0.0 indicate development releases
and may have breaking changes.
