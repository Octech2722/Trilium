// Video Processing Module for Trilium Web Clipper
// Processes embedded videos and adds visible links to content

function processEmbeddedVideos(body, videoPrefs = {}) {
    // Use debug system if available, fallback to console
    const debug = window.TriliumDebug || { videoProcessor: (level, msg, ...args) => console.log(`[VIDEO] ${msg}`, ...args) };

    debug.videoProcessor('info', 'Starting video processing');

    // Find all video iframes from supported platforms
    const videoSelectors = [
        'iframe[src*="youtube"]',
        'iframe[src*="vimeo"]',
        'iframe[src*="dailymotion"]',
        'iframe[src*="twitch"]'
    ];

    const iframes = body.querySelectorAll(videoSelectors.join(', '));
    debug.videoProcessor('info', `Found ${iframes.length} video iframes`);

    const videos = [];
    const videoLinks = [];

    // Process each iframe - replace in original location
    Array.from(iframes).forEach((iframe, index) => {
        debug.videoProcessor('debug', `Processing iframe ${index}`, { src: iframe.src });

        const platform = detectVideoPlatform(iframe.src);
        const videoData = {
            platform: platform,
            videoId: extractVideoIdFromUrl(iframe.src, platform),
            originalUrl: iframe.src,
            title: iframe.title || getDefaultTitle(platform),
            width: iframe.width || '560',
            height: iframe.height || '315'
        };

        videos.push(videoData);

        // Create replacement element with video link - dynamic platform name
        const replacement = document.createElement('div');
        replacement.className = 'trilium-video-replacement';
        const platformName = getPlatformDisplayName(platform);
        replacement.innerHTML = `<p><strong>[VIDEO] ${platformName}:</strong> <a href="${videoData.originalUrl}" target="_blank">${videoData.title}</a></p>`;

        // Replace the iframe with the video link in the same location
        iframe.parentNode.replaceChild(replacement, iframe);

        debug.videoProcessor('info', `Replaced iframe ${index} with ${platformName} link for "${videoData.title}"`);
    });

    if (videos.length > 0) {
        debug.videoProcessor('info', `Successfully replaced ${videos.length} video iframes with links`);
    }

    return {
        videos: videos,
        videoCount: videos.length
    };
}

function detectVideoPlatform(url) {
    if (url.includes('youtube')) return 'youtube';
    if (url.includes('vimeo')) return 'vimeo';
    if (url.includes('dailymotion')) return 'dailymotion';
    if (url.includes('twitch')) return 'twitch';
    return 'unknown';
}

function extractVideoIdFromUrl(url, platform) {
    let match;

    switch (platform) {
        case 'youtube':
            match = url.match(/embed\/([^?&]+)/);
            return match ? match[1] : '';

        case 'vimeo':
            match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
            return match ? match[1] : '';

        case 'dailymotion':
            match = url.match(/dailymotion\.com\/embed\/video\/([^?&]+)/);
            return match ? match[1] : '';

        case 'twitch':
            match = url.match(/twitch\.tv\/videos\/(\d+)/);
            return match ? match[1] : '';

        default:
            return '';
    }
}

function getPlatformDisplayName(platform) {
    const displayNames = {
        'youtube': 'YouTube',
        'vimeo': 'Vimeo',
        'dailymotion': 'DailyMotion',
        'twitch': 'Twitch'
    };
    return displayNames[platform] || 'Video';
}

function getDefaultTitle(platform) {
    const defaultTitles = {
        'youtube': 'YouTube Video',
        'vimeo': 'Vimeo Video',
        'dailymotion': 'DailyMotion Video',
        'twitch': 'Twitch Video'
    };
    return defaultTitles[platform] || 'Video';
}

// Export functions for use in content script
if (typeof window !== 'undefined') {
    window.TriliumVideoProcessor = {
        processEmbeddedVideos: processEmbeddedVideos,
        extractVideoIdFromUrl: extractVideoIdFromUrl,
        detectVideoPlatform: detectVideoPlatform,
        getPlatformDisplayName: getPlatformDisplayName,
        getDefaultTitle: getDefaultTitle
    };
}

console.log('*** TRILIUM VIDEO PROCESSOR LIBRARY LOADED ***');
