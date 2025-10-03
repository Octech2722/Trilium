/**
 * Debug utilities for Trilium Web Clipper Video Processing
 * Provides conditional logging based on user preferences
 */

// Debug log levels
const DEBUG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

class VideoDebugger {
    constructor() {
        this.enabled = false;
        this.level = DEBUG_LEVELS.INFO;
        this.init();
    }

    async init() {
        try {
            const result = await chrome.storage.sync.get(['trilium_video_debug_mode']);
            this.enabled = result.trilium_video_debug_mode === true;
        } catch (error) {
            // Silently fail if storage not available
            this.enabled = false;
        }
    }

    async refresh() {
        await this.init();
    }

    log(level, ...args) {
        if (!this.enabled || level > this.level) return;

        const prefix = this.getPrefix(level);
        console.log(prefix, ...args);
    }

    getPrefix(level) {
        const timestamp = new Date().toISOString().substr(11, 12);
        switch (level) {
            case DEBUG_LEVELS.ERROR: return `[${timestamp}] 🔴 VIDEO ERROR`;
            case DEBUG_LEVELS.WARN:  return `[${timestamp}] 🟡 VIDEO WARN`;
            case DEBUG_LEVELS.INFO:  return `[${timestamp}] 🔵 VIDEO INFO`;
            case DEBUG_LEVELS.DEBUG: return `[${timestamp}] 🟢 VIDEO DEBUG`;
            default: return `[${timestamp}] 📹 VIDEO`;
        }
    }

    // Convenience methods
    error(...args) { this.log(DEBUG_LEVELS.ERROR, ...args); }
    warn(...args)  { this.log(DEBUG_LEVELS.WARN, ...args); }
    info(...args)  { this.log(DEBUG_LEVELS.INFO, ...args); }
    debug(...args) { this.log(DEBUG_LEVELS.DEBUG, ...args); }

    // Special methods for video processing
    platform(url, detected) {
        this.debug(`Platform detection: "${url}" -> ${detected || 'none'}`);
    }

    extraction(url, platform, videoId) {
        this.debug(`Video ID extraction: ${platform} from "${url}" -> ${videoId || 'failed'}`);
    }

    processing(action, count, details = '') {
        this.info(`${action}: ${count} items ${details}`.trim());
    }

    settings(settings) {
        this.debug('Using settings:', JSON.stringify(settings, null, 2));
    }

    result(videos) {
        this.info(`Processing complete: ${videos.length} videos processed`);
        if (videos.length > 0) {
            const summary = videos.reduce((acc, video) => {
                acc[video.platform] = (acc[video.platform] || 0) + 1;
                return acc;
            }, {});
            this.debug('Video summary by platform:', summary);
        }
    }

    performance(operation, startTime) {
        const duration = Date.now() - startTime;
        this.debug(`Performance: ${operation} took ${duration}ms`);
    }
}

// Create a singleton instance
const videoDebugger = new VideoDebugger();

// Export simple functions for backward compatibility
export async function debugLog(...args) {
    await videoDebugger.refresh(); // Refresh settings each time
    videoDebugger.info(...args);
}

export async function debugError(...args) {
    await videoDebugger.refresh();
    videoDebugger.error(...args);
}

export async function debugWarn(...args) {
    await videoDebugger.refresh();
    videoDebugger.warn(...args);
}

export async function debugInfo(...args) {
    await videoDebugger.refresh();
    videoDebugger.info(...args);
}

export async function debugPlatform(url, detected) {
    await videoDebugger.refresh();
    videoDebugger.platform(url, detected);
}

export async function debugExtraction(url, platform, videoId) {
    await videoDebugger.refresh();
    videoDebugger.extraction(url, platform, videoId);
}

export async function debugProcessing(action, count, details = '') {
    await videoDebugger.refresh();
    videoDebugger.processing(action, count, details);
}

export async function debugSettings(settings) {
    await videoDebugger.refresh();
    videoDebugger.settings(settings);
}

export async function debugResult(videos) {
    await videoDebugger.refresh();
    videoDebugger.result(videos);
}

export async function debugPerformance(operation, startTime) {
    await videoDebugger.refresh();
    videoDebugger.performance(operation, startTime);
}

// Export the debugger instance for advanced usage
export { videoDebugger as VideoDebugger, DEBUG_LEVELS };

// Default export
export default {
    debugLog,
    debugError,
    debugWarn,
    debugInfo,
    debugPlatform,
    debugExtraction,
    debugProcessing,
    debugSettings,
    debugResult,
    debugPerformance,
    VideoDebugger: videoDebugger,
    DEBUG_LEVELS
};
