#!/bin/bash

# BEE Keepers MVP - Test Runner Script
# Automates test execution with proper setup and reporting

echo "🐝 BEE Keepers MVP - Running Unit Tests"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if we're in the tests directory
if [ ! -f "package.json" ]; then
    echo "📁 Navigating to tests directory..."
    cd tests/ || {
        echo "❌ Tests directory not found!"
        exit 1
    }
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing test dependencies..."
    npm install
fi

# Run different test commands based on argument
case "$1" in
    "watch")
        echo "👀 Running tests in watch mode..."
        npm run test:watch
        ;;
    "coverage")
        echo "📊 Running tests with coverage report..."
        npm run test:coverage
        ;;
    "unit")
        echo "🧪 Running unit tests only..."
        npx jest app.test.js
        ;;
    "integration")
        echo "🔗 Running integration tests only..."
        npx jest integration.test.js
        ;;
    "ci")
        echo "🤖 Running tests for CI/CD..."
        npm test -- --ci --coverage --watchAll=false
        ;;
    *)
        echo "🚀 Running all tests..."
        npm test
        ;;
esac

# Get exit code from test run
test_exit_code=$?

# Report results
echo ""
echo "======================================"
if [ $test_exit_code -eq 0 ]; then
    echo "✅ All tests passed!"
    echo "🎉 BEE Keepers MVP is working correctly!"
else
    echo "❌ Some tests failed!"
    echo "🔧 Please check the test output above for details."
fi

echo ""
echo "Available test commands:"
echo "  ./run-tests.sh          - Run all tests"
echo "  ./run-tests.sh watch    - Run tests in watch mode"
echo "  ./run-tests.sh coverage - Run tests with coverage"
echo "  ./run-tests.sh unit     - Run unit tests only"
echo "  ./run-tests.sh integration - Run integration tests only"
echo "  ./run-tests.sh ci       - Run tests for CI/CD"

exit $test_exit_code