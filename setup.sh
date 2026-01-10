#!/bin/bash
set -e

echo "======================================"
echo "GLM Code System Quick Setup"
echo "======================================"

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -e .

# Setup environment
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "IMPORTANT: Edit .env and add your GLM API key"
    echo "Get your key from: https://open.bigmodel.cn/"
else
    echo "✓ .env file already exists"
fi

# Initialize database
echo ""
echo "Initializing knowledge base..."
python -c "
import asyncio
from glm_code_system.learning.knowledge_base import KnowledgeBase

async def init():
    kb = KnowledgeBase()
    await kb.initialize()
    print('✓ Knowledge base initialized')

asyncio.run(init())
"

echo ""
echo "======================================"
echo "Setup complete!"
echo "======================================"
echo ""
echo "To start the system, run:"
echo "  glm-code"
echo ""
echo "Available commands:"
echo "  /help    - Show help"
echo "  /status  - Check system status"
echo "  /learn   - View learned patterns"
echo "  /quit    - Exit"
echo ""
