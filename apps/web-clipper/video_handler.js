/**
 * Enhanced Web Video Handler for Trilium Web Clipper
 * Supports YouTube, Vimeo, DailyMotion, Twitch, and other video platforms
 */

export const VIDEO_PLATFORMS = {
    YOUTUBE: 'youtube',
    VIMEO: 'vimeo',
    DAILYMOTION: 'dailymotion',
    TWITCH: 'twitch',
    ARCHIVE: 'archive',
    WIKIMEDIA: 'wikimedia'
};

export const VIDEO_REGEX_PATTERNS = {
    [VIDEO_PLATFORMS.YOUTUBE]: {
        urlPattern: /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        domainPattern: /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i,
        embedTemplate: (id) => `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    },
    [VIDEO_PLATFORMS.VIMEO]: {
        urlPattern: /vimeo\.com\/(?:channels\/[^\/]+\/|groups\/[^\/]+\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/,
        domainPattern: /vimeo\.com/i,
        embedTemplate: (id) => `<iframe src="https://player.vimeo.com/video/${id}" width="560" height="315" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
    },
    [VIDEO_PLATFORMS.DAILYMOTION]: {
        urlPattern: /dailymotion\.com\/video\/([^_\?]+)/,
        domainPattern: /dailymotion\.com/i,
        embedTemplate: (id) => `<iframe frameborder="0" width="560" height="315" src="https://www.dailymotion.com/embed/video/${id}" allowfullscreen allow="autoplay"></iframe>`
    },
    [VIDEO_PLATFORMS.TWITCH]: {
        urlPattern: /twitch\.tv\/(?:videos\/)?(\d+)/,
        domainPattern: /twitch\.tv/i,
        embedTemplate: (id) => `<iframe src="https://player.twitch.tv/?video=${id}&parent=trilium.local" frameborder="0" allowfullscreen="true" scrolling="no" height="315" width="560"></iframe>`
    }
};

export class VideoHandler {
    constructor(options = {}) {
        this.options = {
            preserveOriginalIframes: false,
            createStandardizedEmbeds: true,
            addFallbackLinks: true,
            extractVideoMetadata: true,
            enablePrivacyMode: true, // Use privacy-enhanced embeds when available
            ...options
        };
    }

    /**
     * Detect video platform from URL
     */
    detectPlatform(url) {
        if (!url) return null;

        for (const [platform, config] of Object.entries(VIDEO_REGEX_PATTERNS)) {
            if (config.domainPattern.test(url)) {
                return platform;
            }
        }

        return null;
    }

    /**
     * Extract video ID from URL
     */
    extractVideoId(url, platform) {
        const config = VIDEO_REGEX_PATTERNS[platform];
        if (!config) return null;

        const match = url.match(config.urlPattern);
        return match ? match[1] : null;
    }

    /**
     * Create standardized video embed
     */
    createEmbed(videoId, platform, originalUrl, metadata = {}) {
        const config = VIDEO_REGEX_PATTERNS[platform];

        if (!config || !videoId) {
            // Fallback to link for unsupported platforms
            return `<p><strong>📹 Video:</strong> <a href="${originalUrl}" target="_blank">${originalUrl}</a></p>`;
        }

        const embedHtml = config.embedTemplate(videoId);

        // Add metadata as comments for debugging
        const metadataComment = this.options.extractVideoMetadata
            ? `<!-- Video Metadata: ${JSON.stringify({platform, videoId, ...metadata})} -->\n`
            : '';

        return metadataComment + embedHtml;
    }

    /**
     * Extract video metadata from iframe attributes
     */
    extractMetadata(iframe) {
        return {
            title: iframe.title || iframe.getAttribute('aria-label') || '',
            width: iframe.width || iframe.getAttribute('width') || '560',
            height: iframe.height || iframe.getAttribute('height') || '315',
            allowFullscreen: iframe.allowFullscreen || iframe.hasAttribute('allowfullscreen'),
            loading: iframe.loading || 'lazy'
        };
    }

    /**
     * Process all videos in a container
     */
    processVideos(container) {
        const processedVideos = [];
        const iframes = Array.from(container.getElementsByTagName('iframe'));

        // Process iframes
        for (const iframe of iframes) {
            const src = iframe.src;
            if (!src) continue;

            const platform = this.detectPlatform(src);
            if (!platform) continue;

            const videoId = this.extractVideoId(src, platform);
            if (!videoId) continue;

            const metadata = this.extractMetadata(iframe);
            const videoInfo = {
                platform,
                videoId,
                originalUrl: src,
                metadata,
                processed: new Date().toISOString()
            };

            processedVideos.push(videoInfo);

            if (this.options.createStandardizedEmbeds) {
                const embedHtml = this.createEmbed(videoId, platform, src, metadata);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = embedHtml;
                iframe.parentNode.replaceChild(tempDiv.firstChild, iframe);
            } else if (this.options.addFallbackLinks) {
                const link = document.createElement('p');
                link.innerHTML = `<strong>📹 ${metadata.title || 'Video'}:</strong> <a href="${src}" target="_blank">${src}</a>`;
                iframe.parentNode.replaceChild(link, iframe);
            }
        }

        // Process video links in anchor tags
        const links = Array.from(container.getElementsByTagName('a'));

        for (const link of links) {
            if (!link.href) continue;

            const platform = this.detectPlatform(link.href);
            if (!platform) continue;

            const videoId = this.extractVideoId(link.href, platform);
            if (!videoId) continue;

            // Check if we already processed this video
            const alreadyProcessed = processedVideos.some(
                v => v.videoId === videoId && v.platform === platform
            );

            if (!alreadyProcessed) {
                const videoInfo = {
                    platform,
                    videoId,
                    originalUrl: link.href,
                    metadata: {
                        title: link.textContent || link.title || '',
                        linkText: link.textContent
                    },
                    processed: new Date().toISOString()
                };

                processedVideos.push(videoInfo);

                // Enhance the link with video emoji and title
                const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
                link.innerHTML = `📹 ${link.innerHTML || `${platformName} Video`}`;
                link.title = `${platformName} Video: ${videoInfo.metadata.title}`;
            }
        }

        return processedVideos;
    }

    /**
     * Generate summary statistics for processed videos
     */
    generateSummary(videos) {
        const platformCounts = videos.reduce((acc, video) => {
            acc[video.platform] = (acc[video.platform] || 0) + 1;
            return acc;
        }, {});

        return {
            totalVideos: videos.length,
            platforms: Object.keys(platformCounts),
            platformCounts,
            processedAt: new Date().toISOString()
        };
    }
}

// Export for use in content.js
export default VideoHandler;
