#!/bin/bash

echo "🚀 Building AI Journal for Mac..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building Mac app..."
npm run build-mac

echo "✅ Build complete! Check the 'dist' folder for your .app file."
echo "📱 You can now drag the AI Journal.app to your Applications folder!"
