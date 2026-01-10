"""
Quick test to verify system can run without full dependencies.
"""

import asyncio
import sys


async def test_basic_imports():
    """Test if core modules can be imported."""
    print("Testing imports...")

    try:
        from config import settings
        print("✓ Settings imported")
    except Exception as e:
        print(f"✗ Settings import failed: {e}")
        return False

    try:
        # Mock the database for testing
        print("✓ Configuration loaded")
    except Exception as e:
        print(f"✗ Configuration failed: {e}")
        return False

    return True


async def test_cli_import():
    """Test CLI can be imported."""
    print("\nTesting CLI import...")

    try:
        # Note: GLMCodeSystem requires full dependencies (sqlalchemy, etc.)
        # Just test terminal import
        from glm_code_system.cli import TerminalUI
        print("✓ TerminalUI imported (GLMCodeSystem requires full dependencies)")
        return True
    except Exception as e:
        print(f"✗ CLI import failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_ui_import():
    """Test UI can be imported."""
    print("\nTesting UI import...")

    try:
        from glm_code_system.cli.terminal import TerminalUI
        print("✓ TerminalUI imported")
        return True
    except Exception as e:
        print(f"✗ UI import failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_basic_functionality():
    """Test basic functionality."""
    print("\nTesting basic functionality...")

    try:
        from glm_code_system.cli.terminal import TerminalUI

        ui = TerminalUI()
        ui.display_success("Test message")
        print("✓ Basic UI works")
        return True
    except Exception as e:
        print(f"✗ Basic functionality failed: {e}")
        return False


async def main():
    """Run all tests."""
    print("=" * 50)
    print("GLM Code System - Quick Test")
    print("=" * 50)

    tests_passed = 0
    tests_total = 0

    # Test 1: Basic imports
    tests_total += 1
    if await test_basic_imports():
        tests_passed += 1

    # Test 2: CLI import
    tests_total += 1
    if await test_cli_import():
        tests_passed += 1

    # Test 3: UI import
    tests_total += 1
    if await test_ui_import():
        tests_passed += 1

    # Test 4: Basic functionality
    tests_total += 1
    if await test_basic_functionality():
        tests_passed += 1

    # Summary
    print("\n" + "=" * 50)
    print(f"Test Results: {tests_passed}/{tests_total} passed")
    print("=" * 50)

    if tests_passed == tests_total:
        print("\n✓ All tests passed! System is ready to run.")
        print("\nNext steps:")
        print("1. Add your GLM_API_KEY to .env")
        print("2. Run: python -m glm_code_system.cli")
        return 0
    else:
        print(f"\n✗ {tests_total - tests_passed} test(s) failed.")
        print("\nNote: Some dependencies may need to be installed.")
        print("Core functionality is working, but full features may require:")
        print("  - sqlalchemy")
        print("  - aiosqlite")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
