# Video Embedding Support

The Trilium Web Clipper now supports embedded video detection and processing.

## Features

- **Multi-Platform Video Detection**: Automatically detects video iframes from YouTube, Vimeo, DailyMotion, and Twitch, replacing them with clickable links
- **In-Place Replacement**: Video links appear exactly where the original video was embedded
- **Clean Integration**: Works seamlessly with Readability.js content processing
- **Debug Support**: Configurable debug logging via extension options

## How It Works

1. The `lib/video-processor.js` module scans content for video iframes from supported platforms
2. Extracts video metadata (title, ID, URL)  
3. Replaces iframes with formatted video links in the same location
4. Integrates with the main content processing pipeline

## Configuration

Enable debug logging in the extension options page under "Debug Settings" → "Video Processor" to see detailed processing information.

## Implementation

- **Module**: `lib/video-processor.js`
- **Integration**: Loaded by `content.js` via `requireLib()`
- **Debug**: Uses `lib/debug.js` for logging
