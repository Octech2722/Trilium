// Debug Library for Trilium Web Clipper
// Provides centralized debug logging with per-module toggles

class TriliumDebugger {
    constructor() {
        this.debugConfig = {
            enabled: false,
            modules: {
                'content': false,
                'video-processor': false,
                'background': false,
                'toast': false,
                'readability': false,
                'images': false,
                'all': false
            }
        };
        this.loadConfig();
    }

    async loadConfig() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.sync.get('trilium_debug_config');
                if (result.trilium_debug_config) {
                    this.debugConfig = { ...this.debugConfig, ...result.trilium_debug_config };
                }
            }
        } catch (error) {
            // Fallback if storage not available
            console.log('Debug config storage not available, using defaults');
        }
    }

    async saveConfig() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.sync.set({ trilium_debug_config: this.debugConfig });
            }
        } catch (error) {
            console.log('Failed to save debug config:', error);
        }
    }

    // Enable/disable debugging for a specific module
    setModuleDebug(module, enabled) {
        this.debugConfig.modules[module] = enabled;
        this.saveConfig();
    }

    // Enable/disable all debugging
    setGlobalDebug(enabled) {
        this.debugConfig.enabled = enabled;
        this.debugConfig.modules.all = enabled;
        this.saveConfig();
    }

    // Check if debugging is enabled for a module
    isEnabled(module) {
        return this.debugConfig.enabled &&
               (this.debugConfig.modules.all || this.debugConfig.modules[module]);
    }

    // Main debug logging function
    log(module, level, message, ...args) {
        if (!this.isEnabled(module)) return;

        const timestamp = new Date().toISOString().substr(11, 12);
        const prefix = `[${timestamp}] [${module.toUpperCase()}] [${level.toUpperCase()}]`;

        switch (level) {
            case 'info':
                console.log(`${prefix} ${message}`, ...args);
                break;
            case 'warn':
                console.warn(`${prefix} ${message}`, ...args);
                break;
            case 'error':
                console.error(`${prefix} ${message}`, ...args);
                break;
            case 'debug':
            default:
                console.log(`${prefix} ${message}`, ...args);
                break;
        }
    }

    // Convenience methods for different modules
    content(level, message, ...args) {
        this.log('content', level, message, ...args);
    }

    videoProcessor(level, message, ...args) {
        this.log('video-processor', level, message, ...args);
    }

    background(level, message, ...args) {
        this.log('background', level, message, ...args);
    }

    toast(level, message, ...args) {
        this.log('toast', level, message, ...args);
    }

    readability(level, message, ...args) {
        this.log('readability', level, message, ...args);
    }

    images(level, message, ...args) {
        this.log('images', level, message, ...args);
    }

    // Get current configuration for options UI
    getConfig() {
        return { ...this.debugConfig };
    }
}

// Create global instance
const TriliumDebug = new TriliumDebugger();

// Export for use in content scripts and other modules
if (typeof window !== 'undefined') {
    window.TriliumDebug = TriliumDebug;
}

// Also make available as global for service worker
if (typeof globalThis !== 'undefined') {
    globalThis.TriliumDebug = TriliumDebug;
}

console.log('*** TRILIUM DEBUG LIBRARY LOADED ***');
