/**
 * Configuration options for Web Video Embedding in Trilium Web Clipper
 */

export const VIDEO_CONFIG = {
    // Default processing options
    DEFAULT_OPTIONS: {
        preserveOriginalIframes: false,    // Keep original iframes unchanged
        createStandardizedEmbeds: true,    // Replace with standardized embeds
        addFallbackLinks: true,           // Add text links for unsupported videos
        extractVideoMetadata: true,       // Extract and store video metadata
        enablePrivacyMode: true,          // Use privacy-enhanced embeds (e.g., youtube-nocookie)
        addVideoSummary: true,           // Add summary of processed videos
        enhanceVideoLinks: true          // Enhance regular video links with emojis
    },

    // Video processing modes
    PROCESSING_MODES: {
        EMBED_ONLY: {
            preserveOriginalIframes: false,
            createStandardizedEmbeds: true,
            addFallbackLinks: false
        },
        LINKS_ONLY: {
            preserveOriginalIframes: false,
            createStandardizedEmbeds: false,
            addFallbackLinks: true
        },
        PRESERVE_ORIGINAL: {
            preserveOriginalIframes: true,
            createStandardizedEmbeds: false,
            addFallbackLinks: false
        },
        HYBRID: {
            preserveOriginalIframes: false,
            createStandardizedEmbeds: true,
            addFallbackLinks: true
        }
    },

    // Platform-specific settings
    PLATFORM_SETTINGS: {
        youtube: {
            useNoCookieDomain: true,
            defaultParams: 'rel=0&modestbranding=1',
            privacyEnhanced: true
        },
        vimeo: {
            defaultParams: 'dnt=1',
            privacyEnhanced: true
        },
        dailymotion: {
            defaultParams: 'queue-enable=false',
            privacyEnhanced: false
        },
        twitch: {
            requireParentDomain: true,
            defaultParent: 'trilium.local',
            privacyEnhanced: false
        }
    },

    // Embed dimensions
    EMBED_DIMENSIONS: {
        DEFAULT: { width: 560, height: 315 },
        SMALL: { width: 400, height: 225 },
        LARGE: { width: 800, height: 450 },
        RESPONSIVE: { width: '100%', height: 'auto' }
    },

    // Supported video platforms and their patterns
    SUPPORTED_PLATFORMS: [
        'youtube',
        'vimeo',
        'dailymotion',
        'twitch',
        'archive',
        'wikimedia'
    ],

    // Storage keys for user preferences
    STORAGE_KEYS: {
        VIDEO_PROCESSING_MODE: 'trilium_video_processing_mode',
        EMBED_DIMENSIONS: 'trilium_video_embed_dimensions',
        PRIVACY_MODE: 'trilium_video_privacy_mode'
    }
};

// User preference management
export class VideoPreferences {
    static async get(key, defaultValue = null) {
        try {
            const result = await chrome.storage.sync.get(key);
            return result[key] !== undefined ? result[key] : defaultValue;
        } catch (error) {
            console.warn('Failed to get video preference:', key, error);
            return defaultValue;
        }
    }

    static async set(key, value) {
        try {
            await chrome.storage.sync.set({ [key]: value });
            return true;
        } catch (error) {
            console.warn('Failed to set video preference:', key, error);
            return false;
        }
    }

    static async getProcessingMode() {
        const mode = await this.get(VIDEO_CONFIG.STORAGE_KEYS.VIDEO_PROCESSING_MODE, 'HYBRID');
        return VIDEO_CONFIG.PROCESSING_MODES[mode] || VIDEO_CONFIG.PROCESSING_MODES.HYBRID;
    }

    static async setProcessingMode(mode) {
        if (!VIDEO_CONFIG.PROCESSING_MODES[mode]) {
            throw new Error(`Invalid processing mode: ${mode}`);
        }
        return await this.set(VIDEO_CONFIG.STORAGE_KEYS.VIDEO_PROCESSING_MODE, mode);
    }

    static async getEmbedDimensions() {
        const dimensions = await this.get(VIDEO_CONFIG.STORAGE_KEYS.EMBED_DIMENSIONS, 'DEFAULT');
        return VIDEO_CONFIG.EMBED_DIMENSIONS[dimensions] || VIDEO_CONFIG.EMBED_DIMENSIONS.DEFAULT;
    }

    static async getPrivacyMode() {
        return await this.get(VIDEO_CONFIG.STORAGE_KEYS.PRIVACY_MODE, true);
    }
}

export default VIDEO_CONFIG;
