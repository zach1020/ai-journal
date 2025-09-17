# Building AI Journal for Mac

## Prerequisites

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose the LTS version

2. **Install npm** (comes with Node.js)

## Quick Build

### Option 1: Using the Build Script
```bash
./build.sh
```

### Option 2: Manual Build
```bash
# Install dependencies
npm install

# Build for Mac
npm run build-mac
```

## What You'll Get

After building, you'll find:
- `dist/AI Journal-1.0.0.dmg` - Installer for distribution
- `dist/mac/AI Journal.app` - The actual app bundle

## Installing the App

1. **From DMG**: Double-click the `.dmg` file and drag the app to Applications
2. **From App Bundle**: Drag `AI Journal.app` directly to your Applications folder

## Running the App

- **From Applications**: Open Applications folder and double-click "AI Journal"
- **From Terminal**: `open "AI Journal.app"`
- **From Finder**: Navigate to the app and double-click

## Development Mode

To run the app in development mode:
```bash
npm start
```

## Troubleshooting

### "Command not found: npm"
- Make sure Node.js is installed correctly
- Try restarting your terminal

### Build fails
- Make sure you're in the project directory
- Try `npm install` first
- Check that all files are present

### App won't open
- Right-click the app and select "Open" (first time only)
- Check System Preferences → Security & Privacy if blocked

## Customization

- **App Icon**: Replace `assets/icon.png` with your own 512x512 PNG
- **App Name**: Change `productName` in `package.json`
- **Window Size**: Modify `width` and `height` in `main.js`
