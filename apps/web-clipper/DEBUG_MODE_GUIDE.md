# 🐛 Debug Mode for Video Processing

## Overview

The Trilium Web Clipper now includes a comprehensive debug mode for video processing that can be toggled on/off by users. This feature helps troubleshoot video embedding issues and provides detailed insights into the processing pipeline.

## How to Enable Debug Mode

### Via Extension Popup

1. Click the Trilium Web Clipper extension icon
2. Look for the "📹 Video Handling" section
3. Check the "🐛 Enable video processing debug logs" checkbox
4. The setting is automatically saved and will persist across browser sessions

### What Debug Mode Shows

When enabled, debug mode provides detailed console logging with:

#### 🔵 **INFO Level Messages**

- Processing start/completion notifications
- Video detection summaries (e.g., "Found 3 iframes in container")
- Platform detection results (e.g., "Detected YouTube platform for: https://...")
- Processing statistics and performance metrics
- Final results and platform summaries

#### 🟢 **DEBUG Level Messages**  

- Detailed function calls and parameters
- Individual URL processing steps
- Settings and configuration details
- Raw video data structures

#### Timestamp Format

All debug messages include timestamps in `HH:MM:SS.mmm` format for precise timing analysis.

## Example Debug Output

``` text
[14:23:15.123] 🔵 VIDEO INFO: === Starting page clipping process ===
[14:23:15.145] 🔵 VIDEO INFO: Got readable document: "Arduino Project Tutorial", body has 12 children
[14:23:15.156] 🔵 VIDEO INFO: Using video preferences: {preserveIframes: false, createEmbeds: true, ...}
[14:23:15.167] 🔵 VIDEO INFO: Starting video processing...
[14:23:15.178] 🔵 VIDEO INFO: Found 2 iframes in container
[14:23:15.189] 🔵 VIDEO INFO: Detected YouTube platform for: https://www.youtube.com/embed/dQw4w9WgXcQ
[14:23:15.201] 🔵 VIDEO INFO: Found 5 links in container
[14:23:15.223] 🔵 VIDEO INFO: Video processing complete: 1 videos processed in 67ms
[14:23:15.234] 🔵 VIDEO INFO: Video summary by platform: {youtube: 1}
[14:23:15.245] 🔵 VIDEO INFO: Final result: 1 videos processed
```

## Troubleshooting with Debug Mode

### Common Issues and Debug Patterns

#### ❌ **No Videos Detected**

Look for:

``` text
Found 0 iframes in container
Found X links in container
No video platform detected for: [url]
```

**Solution**: Check if the page actually contains video iframes or links

#### ❌ **Videos Not Processing**

Look for:

``` text
Using video preferences: {preserveIframes: true, createEmbeds: false, ...}
```

**Solution**: Check video processing mode in popup settings

#### ❌ **Platform Not Recognized**

Look for:

``` text
No video platform detected for: https://somesite.com/video/123
```

**Solution**: The platform may not be supported yet

#### ❌ **Performance Issues**

Look for:

``` text
Video processing complete: X videos processed in XXXXms
```

**Solution**: Large processing times may indicate performance bottlenecks

### Debug Data Collection

When reporting issues, provide:

1. **Full console output** - Copy all `VIDEO INFO` and `VIDEO DEBUG` messages
2. **Page URL** - The page being clipped  
3. **Video settings** - Current processing mode and preferences
4. **Expected vs actual behavior** - What should happen vs what happened

## Performance Impact

- **Disabled** (default): Zero performance impact
- **Enabled**: Minimal impact (~1-5ms per operation)
- Storage operations are cached to minimize repeated lookups
- Debug state refreshes only at the start of clipping operations

## Storage Usage

Debug preferences are stored in Chrome's sync storage:

- **Key**: `trilium_video_debug_mode`
- **Value**: `true` or `false`
- **Sync**: Automatically syncs across devices with the same Chrome account

## Advanced Usage

### Temporary Debug Enable

For developers or power users, debug mode can be temporarily enabled via console:

```javascript
chrome.storage.sync.set({'trilium_video_debug_mode': true});
```

### Debug State Cache

The debug state is cached during operations to avoid repeated storage lookups. If you change the debug setting, it will take effect on the next clipping operation.

## Security & Privacy

- Debug logs only appear in the browser's developer console
- No debug data is sent to external servers
- Debug logs may contain URLs from clipped pages
- Logs are cleared when the browser tab is closed/refreshed

## Future Enhancements

Planned debug features:

- **Debug levels**: ERROR, WARN, INFO, DEBUG with user-selectable levels
- **Export logs**: Save debug output to file for support requests  
- **Visual debugging**: Highlight detected video elements on page
- **Performance profiling**: Detailed timing breakdown of processing steps

---

**Note**: This debug mode is designed for troubleshooting and development. For normal usage, keep it disabled to avoid console clutter.
