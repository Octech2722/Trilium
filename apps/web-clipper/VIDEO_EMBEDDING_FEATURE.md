# 📹 Web Video Embedding Feature for Trilium Web Clipper

## Overview

This feature enhances the Trilium Web Clipper to properly handle embedded video content from popular video platforms. Instead of losing video content during clipping, the extension now intelligently processes video iframes and links, converting them into standardized embeds or accessible links.

## Supported Platforms

### Fully Supported Video Platforms

- **YouTube** (`youtube.com`, `youtu.be`, `youtube-nocookie.com`)
- **Vimeo** (`vimeo.com`)
- **DailyMotion** (`dailymotion.com`)
- **Twitch** (`twitch.tv`)

### Archive Platforms

- **Internet Archive** (`archive.org`)
- **Wikimedia** (`upload.wikimedia.org`)

## Features

### 🎯 Smart Video Detection

- Automatically detects video iframes and links during page clipping
- Extracts video IDs from various URL formats
- Supports both embedded iframes and direct video links

### 🔧 Multiple Processing Modes

1. **Hybrid Mode** (Default)
   - Creates standardized embeds for supported platforms
   - Adds fallback links for accessibility
   - Best balance of functionality and compatibility

2. **Embed Only Mode**
   - Replaces all video content with clean, standardized embeds
   - Removes original iframes to prevent duplication
   - Ideal for clean, embedded video experience

3. **Links Only Mode**
   - Converts all video content to text links
   - Lightweight and highly compatible
   - Good for text-focused notes or slower connections

4. **Preserve Original Mode**
   - Keeps original iframes unchanged
   - Minimal processing for maximum compatibility
   - Use when original embed behavior is crucial

### 🔒 Privacy-Enhanced Features

- **YouTube**: Uses `youtube-nocookie.com` domain by default
- **Vimeo**: Adds `dnt=1` (Do Not Track) parameter
- **DailyMotion**: Disables video queue for privacy
- User-configurable privacy settings in popup

### 📊 Metadata Extraction

- Captures video titles, dimensions, and platform information
- Adds video count and platform summary to note labels
- Preserves original URLs for reference

## User Interface

### Popup Controls

The web clipper popup includes a new "📹 Video Handling" section with:

- **Processing Mode Selection**:
  - Radio buttons for choosing video processing mode
  - Real-time preference saving

- **Privacy Settings**:
  - Checkbox to enable/disable privacy-enhanced embeds
  - Applies platform-specific privacy parameters

### Visual Indicators

- Video links are enhanced with 📹 emoji
- Clear labeling of video content in processed notes
- Platform identification for each video

## Technical Implementation

### Core Components

1. **Video Detection Engine** (`content.js`)
   - `detectVideoPlatform()`: Identifies video platform from URL
   - `extractVideoId()`: Extracts platform-specific video identifiers
   - `getEmbeddedVideos()`: Main processing function

2. **Embed Generation** (`content.js`)
   - `createVideoEmbed()`: Generates standardized iframe embeds
   - Privacy-aware URL construction
   - Platform-specific parameter handling

3. **User Preferences** (`popup.js`, `video_config.js`)
   - Chrome storage integration for settings persistence
   - Real-time preference loading and saving
   - Default configuration management

4. **Advanced Handler** (`video_handler.js`)
   - Extensible class-based architecture
   - Metadata extraction and processing
   - Statistics and summary generation

### Integration Points

- **Page Clipping**: Processes videos during full page capture
- **Selection Clipping**: Handles videos in selected content
- **Link Processing**: Enhances regular video links
- **Trilium Integration**: Includes video metadata in note labels

## Configuration Options

### Available Settings

```javascript
{
  preserveOriginalIframes: false,    // Keep original iframes
  createStandardizedEmbeds: true,    // Generate clean embeds  
  addFallbackLinks: true,           // Include text links
  extractVideoMetadata: true,       // Capture video info
  enablePrivacyMode: true,          // Use privacy-enhanced URLs
  addVideoSummary: true,           // Include processing summary
  enhanceVideoLinks: true          // Add emojis to video links
}
```

### Storage Keys

- `trilium_video_processing_mode`: User's preferred processing mode
- `trilium_video_privacy_mode`: Privacy enhancement setting
- `trilium_video_embed_dimensions`: Preferred embed dimensions

## Testing

### Test Page

A comprehensive test page (`test-video-page.html`) is included with:

- Various video platform embeds
- Direct video links
- Mixed content scenarios
- Dynamic content generation

### Test Scenarios

1. **Full Page Clipping**: Test with video-rich pages
2. **Selection Clipping**: Select content containing videos
3. **Settings Changes**: Verify preference persistence
4. **Privacy Mode**: Confirm privacy-enhanced URLs
5. **Platform Coverage**: Test all supported video platforms

## Usage Examples

### Before Enhancement

```html
<!-- Original iframe gets lost or broken -->
<div>[Content clipped without video]</div>
```

### After Enhancement (Hybrid Mode)

```html
<!-- Clean, standardized embed -->
<iframe width="560" height="315" 
        src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1" 
        frameborder="0" allowfullscreen></iframe>

<!-- Fallback link for accessibility -->
<p><strong>📹 Video:</strong> 
   <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">
     Original Video Link
   </a>
</p>
```

## Browser Compatibility

### Supported Browsers

- **Chrome**: Full support (Manifest V2/V3)
- **Firefox**: Full support with polyfills
- **Edge**: Full support (Chromium-based)

### API Dependencies

- Chrome Storage API (for preferences)
- Content Script injection
- Background script messaging

## Future Enhancements

### Planned Features

- **Additional Platforms**: TikTok, Instagram, Twitter video support
- **Thumbnail Extraction**: Capture video thumbnails for offline viewing
- **Timestamp Support**: Handle video links with specific timestamps
- **Playlist Support**: Process video playlists and series
- **Quality Selection**: Allow users to choose embed quality
- **Responsive Embeds**: Automatic sizing based on note width

### Extensibility

The modular architecture allows easy addition of new video platforms by:

1. Adding platform regex patterns to `VIDEO_REGEX_PATTERNS`
2. Implementing platform-specific ID extraction
3. Creating embed template functions
4. Adding privacy parameter handling

## Migration Guide

### Existing Notes

- No migration required for existing notes
- New video processing applies to future clips
- Users can re-clip pages to get enhanced video handling

### Extension Updates

- Settings automatically migrate to new versions
- Backward compatibility maintained for existing preferences
- Graceful fallback to default settings if needed

## Troubleshooting

### Common Issues

1. **Videos not embedding**: Check platform support and URL format
2. **Privacy mode not working**: Verify settings in popup
3. **Preferences not saving**: Check Chrome storage permissions
4. **Embeds not loading**: Confirm Trilium server allows iframe content

### Debug Information

- Video processing metadata included in note labels
- Console logging available for development
- Test page provided for verification

## Contributing

To extend video platform support:

1. Add platform detection regex to `VIDEO_REGEX_PATTERNS`
2. Implement video ID extraction logic
3. Create embed template with privacy options
4. Add test cases to verification page
5. Update documentation

---

**Note**: This feature is designed to be a separate enhancement that can be merged independently of the Manifest V3 conversion work, allowing for parallel development and testing.
