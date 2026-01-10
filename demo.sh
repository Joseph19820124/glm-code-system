#!/bin/bash
# Quick test to show system can actually run

echo "=================================================="
echo "  GLM Code System - Live Demo"
echo "=================================================="
echo ""

cd "$(dirname "$0")"

echo "1️⃣ Checking Python version..."
python3 --version
echo ""

echo "2️⃣ Activating virtual environment..."
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "✓ Virtual environment activated"
else
    echo "✗ Virtual environment not found"
    exit 1
fi
echo ""

echo "3️⃣ Checking configuration..."
if [ -f ".env" ]; then
    echo "✓ .env file found"
else
    echo "⚠️  .env file not found, creating from template..."
    cp .env.example .env
    echo "✓ Created .env from template"
    echo "⚠️  Please add your GLM_API_KEY to .env"
fi
echo ""

echo "4️⃣ Testing basic imports..."
python3 << 'PYTEST'
import sys
try:
    from config import settings
    print(f"✓ Settings loaded")
    print(f"  Model: {settings.glm_model}")
    print(f"  Base URL: {settings.glm_base_url}")
except Exception as e:
    print(f"✗ Settings failed: {e}")
    sys.exit(1)

try:
    from rich.console import Console
    console = Console()
    console.print("[bold green]✓[/bold green] Rich library working")
except Exception as e:
    print(f"✗ Rich failed: {e}")
    sys.exit(1)

try:
    from glm_code_system.cli.terminal import TerminalUI
    ui = TerminalUI()
    ui.display_success("System ready!")
except Exception as e:
    print(f"✗ TerminalUI failed: {e}")
    sys.exit(1)

print("")
print("=" * 50)
print("✅ All core systems verified!")
print("=" * 50)
print("")
print("📖 Available documentation:")
print("  - START_HERE.md (🌟 Begin here)")
print("  - README.md (Complete guide)")
print("  - FINAL_GUIDE.md (Quick reference)")
print("")
print("🚀 To start the system:")
print("  python -m glm_code_system.cli.terminal")
print("")
PYTEST

echo ""
echo "5️⃣ Ready for action!"
echo "=================================================="
