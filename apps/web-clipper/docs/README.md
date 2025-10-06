# Trilium Web Clipper Documentation

This directory contains comprehensive documentation for the Trilium Web Clipper extension.

## 📚 Documentation Index

### Core Documentation

- **[VIDEO_SUPPORT.md](VIDEO_SUPPORT.md)** - Video embedding feature documentation
- **[DEBUG_MODE_GUIDE.md](DEBUG_MODE_GUIDE.md)** - Debug system usage guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation overview

### Development Documentation

- **[MANIFEST_V3_CONVERSION.md](MANIFEST_V3_CONVERSION.md)** - Chrome Manifest V3 migration details
- **[PULL_REQUEST.md](PULL_REQUEST.md)** - Pull request documentation

## 🚀 Quick Start

For basic usage, see the main [README.md](../README.md) in the project root.

## 🔧 Features

- **Web Page Clipping**: Save entire web pages to Trilium notes
- **Video Embedding**: Automatic detection and linking of YouTube videos
- **Image Processing**: Handle embedded images and screenshots
- **Debug System**: Comprehensive debugging with per-module controls
- **Cross-Platform**: Works on Chrome and Firefox browsers

## 🛠️ Architecture

The web clipper uses a modular architecture:

- **`content.js`** - Main content script for page processing
- **`background.js`** - Service worker for extension functionality
- **`lib/`** - Modular libraries (video processing, debug system, etc.)
- **`options/`** - Extension options UI with debug controls
- **`popup/`** - Extension popup interface

## 📝 Contributing

When adding new features or documentation:

1. Add technical documentation to this `docs/` directory
2. Update this index file with links to new documentation
3. Keep the main README.md focused on user-facing information
4. Use descriptive filenames that clearly indicate the content
