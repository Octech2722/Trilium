// Utility functions (inline to avoid module dependency issues)
function randomString(len) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < len; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function getBaseUrl() {
    let output = getPageLocationOrigin() + location.pathname;

    if (output[output.length - 1] !== '/') {
        output = output.split('/');
        output.pop();
        output = output.join('/');
    }

    return output;
}

function getPageLocationOrigin() {
    // location.origin normally returns the protocol + domain + port (eg. https://example.com:8080)
    // but for file:// protocol this is browser dependant and in particular Firefox returns "null" in this case.
    return location.protocol === 'file:' ? 'file://' : location.origin;
}

function absoluteUrl(url) {
	if (!url) {
		return url;
	}

	const protocol = url.toLowerCase().split(':')[0];
	if (['http', 'https', 'file'].indexOf(protocol) >= 0) {
		return url;
	}

	if (url.indexOf('//') === 0) {
		return location.protocol + url;
	} else if (url[0] === '/') {
		return location.protocol + '//' + location.host + url;
	} else {
		return getBaseUrl() + '/' + url;
	}
}

function pageTitle() {
	const titleElements = document.getElementsByTagName("title");

	return titleElements.length ? titleElements[0].text.trim() : document.title.trim();
}

function getReadableDocument() {
	// Readability directly change the passed document, so clone to preserve the original web page.
	const documentCopy = document.cloneNode(true);
	const readability = new Readability(documentCopy, {
		serializer: el => el // so that .content is returned as DOM element instead of HTML
	});

	const article = readability.parse();

	if (!article) {
		throw new Error('Could not parse HTML document with Readability');
	}

	return {
		title: article.title,
		body: article.content,
	}
}

function getDocumentDates() {
	var dates = {
		publishedDate: null,
		modifiedDate: null,
	};

	const articlePublishedTime = document.querySelector("meta[property='article:published_time']");
	if (articlePublishedTime && articlePublishedTime.getAttribute('content')) {
		dates.publishedDate = new Date(articlePublishedTime.getAttribute('content'));
	}

	const articleModifiedTime = document.querySelector("meta[property='article:modified_time']");
	if (articleModifiedTime && articleModifiedTime.getAttribute('content')) {
		dates.modifiedDate = new Date(articleModifiedTime.getAttribute('content'));
	}

	// TODO: if we didn't get dates from meta, then try to get them from JSON-LD

	return dates;
}

function getRectangleArea() {
	return new Promise((resolve, reject) => {
		const overlay = document.createElement('div');
		overlay.style.opacity = '0.6';
		overlay.style.background = 'black';
		overlay.style.width = '100%';
		overlay.style.height = '100%';
		overlay.style.zIndex = 99999999;
		overlay.style.top = 0;
		overlay.style.left = 0;
		overlay.style.position = 'fixed';

		document.body.appendChild(overlay);

		const messageComp = document.createElement('div');

		const messageCompWidth = 300;
		messageComp.setAttribute("tabindex", "0"); // so that it can be focused
		messageComp.style.position = 'fixed';
		messageComp.style.opacity = '0.95';
		messageComp.style.fontSize = '14px';
		messageComp.style.width = messageCompWidth + 'px';
		messageComp.style.maxWidth = messageCompWidth + 'px';
		messageComp.style.border = '1px solid black';
		messageComp.style.background = 'white';
		messageComp.style.color = 'black';
		messageComp.style.top = '10px';
		messageComp.style.textAlign = 'center';
		messageComp.style.padding = '10px';
		messageComp.style.left = Math.round(document.body.clientWidth / 2 - messageCompWidth / 2) + 'px';
		messageComp.style.zIndex = overlay.style.zIndex + 1;

		messageComp.textContent = 'Drag and release to capture a screenshot';

		document.body.appendChild(messageComp);

		const selection = document.createElement('div');
		selection.style.opacity = '0.5';
		selection.style.border = '1px solid red';
		selection.style.background = 'white';
		selection.style.border = '2px solid black';
		selection.style.zIndex = overlay.style.zIndex - 1;
		selection.style.top = 0;
		selection.style.left = 0;
		selection.style.position = 'fixed';

		document.body.appendChild(selection);

		messageComp.focus(); // we listen on keypresses on this element to cancel on escape

		let isDragging = false;
		let draggingStartPos = null;
		let selectionArea = {};

		function updateSelection() {
			selection.style.left = selectionArea.x + 'px';
			selection.style.top = selectionArea.y + 'px';
			selection.style.width = selectionArea.width + 'px';
			selection.style.height = selectionArea.height + 'px';
		}

		function setSelectionSizeFromMouse(event) {
			if (event.clientX < draggingStartPos.x) {
				selectionArea.x = event.clientX;
			}

			if (event.clientY < draggingStartPos.y) {
				selectionArea.y = event.clientY;
			}

			selectionArea.width = Math.max(1, Math.abs(event.clientX - draggingStartPos.x));
			selectionArea.height = Math.max(1, Math.abs(event.clientY - draggingStartPos.y));
			updateSelection();
		}

		function selection_mouseDown(event) {
			selectionArea = {x: event.clientX, y: event.clientY, width: 0, height: 0};
			draggingStartPos = {x: event.clientX, y: event.clientY};
			isDragging = true;
			updateSelection();
		}

		function selection_mouseMove(event) {
			if (!isDragging) return;
			setSelectionSizeFromMouse(event);
		}

		function removeOverlay() {
			isDragging = false;

			overlay.removeEventListener('mousedown', selection_mouseDown);
			overlay.removeEventListener('mousemove', selection_mouseMove);
			overlay.removeEventListener('mouseup', selection_mouseUp);

			document.body.removeChild(overlay);
			document.body.removeChild(selection);
			document.body.removeChild(messageComp);
		}

		function selection_mouseUp(event) {
			setSelectionSizeFromMouse(event);

			removeOverlay();

			console.info('selectionArea:', selectionArea);

			if (!selectionArea || !selectionArea.width || !selectionArea.height) {
				return;
			}

			// Need to wait a bit before taking the screenshot to make sure
			// the overlays have been removed and don't appear in the
			// screenshot. 10ms is not enough.
			setTimeout(() => resolve(selectionArea), 100);
		}

		function cancel(event) {
			if (event.key === "Escape") {
				removeOverlay();
			}
		}

		overlay.addEventListener('mousedown', selection_mouseDown);
		overlay.addEventListener('mousemove', selection_mouseMove);
		overlay.addEventListener('mouseup', selection_mouseUp);
		overlay.addEventListener('mouseup', selection_mouseUp);
		messageComp.addEventListener('keydown', cancel);
	});
}

function makeLinksAbsolute(container) {
	for (const link of container.getElementsByTagName('a')) {
		if (link.href) {
			link.href = absoluteUrl(link.href);
		}
	}
}

function getImages(container) {
	const images = [];

	for (const img of container.getElementsByTagName('img')) {
		if (!img.src) {
			continue;
		}

		const existingImage = images.find(image => image.src === img.src);

		if (existingImage) {
			img.src = existingImage.imageId;
		}
		else {
			const imageId = randomString(20);

			images.push({
				imageId: imageId,
				src: img.src
			});

			img.src = imageId;
		}
	}

	return images;
}

function extractVideoId(url, platform) {
	switch (platform) {
		case 'youtube':
			// Handle various YouTube URL formats
			const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
			const ytMatch = url.match(ytRegex);
			return ytMatch ? ytMatch[1] : null;

		case 'vimeo':
			// Handle Vimeo URLs
			const vimeoRegex = /vimeo\.com\/(?:channels\/[^\/]+\/|groups\/[^\/]+\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/;
			const vimeoMatch = url.match(vimeoRegex);
			return vimeoMatch ? vimeoMatch[1] : null;

		case 'dailymotion':
			// Handle DailyMotion URLs
			const dmRegex = /dailymotion\.com\/video\/([^_\?]+)/;
			const dmMatch = url.match(dmRegex);
			return dmMatch ? dmMatch[1] : null;

		case 'twitch':
			// Handle Twitch URLs
			const twitchRegex = /twitch\.tv\/(?:videos\/)?(\d+)/;
			const twitchMatch = url.match(twitchRegex);
			return twitchMatch ? twitchMatch[1] : null;

		default:
			return null;
	}
}

function detectVideoPlatform(url) {
	try {
		debugDebug('detectVideoPlatform called with URL:', url);
		if (!url) {
			debugDebug('No URL provided');
			return null;
		}

	if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com')) {
		debugInfo('Detected YouTube platform for:', url);
		return 'youtube';
	} else if (url.includes('vimeo.com')) {
		debugInfo('Detected Vimeo platform for:', url);
		return 'vimeo';
	} else if (url.includes('dailymotion.com')) {
		debugInfo('Detected DailyMotion platform for:', url);
		return 'dailymotion';
	} else if (url.includes('twitch.tv')) {
		debugInfo('Detected Twitch platform for:', url);
		return 'twitch';
	} else if (url.includes('archive.org') || url.includes('upload.wikimedia.org')) {
		debugInfo('Detected Archive platform for:', url);
		return 'archive';
	}

	debugDebug('No video platform detected for:', url);
	return null;
	} catch (error) {
		console.error('Error in detectVideoPlatform:', error);
		return null;
	}
}

function createVideoEmbed(videoId, platform, originalUrl, options = {}) {
	const privacyMode = options.privacyMode !== false; // Default true

	switch (platform) {
		case 'youtube':
			const ytDomain = privacyMode ? 'www.youtube-nocookie.com' : 'www.youtube.com';
			const ytParams = privacyMode ? 'rel=0&modestbranding=1' : '';
			const ytSrc = `https://${ytDomain}/embed/${videoId}${ytParams ? '?' + ytParams : ''}`;
			return `<iframe width="560" height="315" src="${ytSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

		case 'vimeo':
			const vimeoParams = privacyMode ? 'dnt=1' : '';
			const vimeoSrc = `https://player.vimeo.com/video/${videoId}${vimeoParams ? '?' + vimeoParams : ''}`;
			return `<iframe src="${vimeoSrc}" width="560" height="315" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

		case 'dailymotion':
			const dmParams = privacyMode ? 'queue-enable=false' : '';
			const dmSrc = `https://www.dailymotion.com/embed/video/${videoId}${dmParams ? '?' + dmParams : ''}`;
			return `<iframe frameborder="0" width="560" height="315" src="${dmSrc}" allowfullscreen allow="autoplay"></iframe>`;

		case 'twitch':
			const twitchSrc = `https://player.twitch.tv/?video=${videoId}&parent=trilium.local`;
			return `<iframe src="${twitchSrc}" frameborder="0" allowfullscreen="true" scrolling="no" height="315" width="560"></iframe>`;

		default:
			// For unsupported platforms, create a link
			return `<p><strong>Video:</strong> <a href="${originalUrl}" target="_blank">${originalUrl}</a></p>`;
	}
}

function getEmbeddedVideos(container, options = {}) {
	const startTime = Date.now();

	// Force debug test - this should always show
	console.log('[DEBUG] FORCED DEBUG TEST - getEmbeddedVideos called');
	console.log('[DEBUG] Container type:', container.tagName || 'unknown');
	console.log('[DEBUG] Options:', options);

	debugInfo('Starting video processing...');
	debugDebug('getEmbeddedVideos called with options:', options);

	const videos = [];
	const videoData = [];

	// Default options
	const settings = {
		preserveIframes: options.preserveIframes !== false, // Default true
		createEmbeds: options.createEmbeds !== false, // Default true
		addVideoLinks: options.addVideoLinks !== false, // Default true
		...options
	};
	debugDebug('Final settings:', settings);

	// Find all iframes and extract video information
	const iframes = container.getElementsByTagName('iframe');
	debugInfo(`Found ${iframes.length} iframes in container`);

	for (let i = iframes.length - 1; i >= 0; i--) {
		const iframe = iframes[i];
		const src = iframe.src;
		debugDebug(`Processing iframe ${i} with src:`, src);

		if (!src) {
			debugDebug(`Iframe ${i} has no src, skipping`);
			continue;
		}

		const platform = detectVideoPlatform(src);

		if (platform) {
			const videoId = extractVideoId(src, platform);

			if (videoId) {
				const videoInfo = {
					platform: platform,
					videoId: videoId,
					originalUrl: src,
					title: iframe.title || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video`,
					width: iframe.width || '560',
					height: iframe.height || '315'
				};

				videoData.push(videoInfo);

				if (settings.createEmbeds) {
					// Replace the iframe with a new standardized embed
					const newEmbed = createVideoEmbed(videoId, platform, src, settings);
					const tempDiv = document.createElement('div');
					tempDiv.innerHTML = newEmbed;
					iframe.parentNode.replaceChild(tempDiv.firstChild, iframe);
				} else if (settings.addVideoLinks) {
					// Replace iframe with a video link
					const videoLink = document.createElement('p');
					videoLink.innerHTML = `<strong>Video: ${videoInfo.title}:</strong> <a href="${src}" target="_blank">${src}</a>`;
					iframe.parentNode.replaceChild(videoLink, iframe);
				} else if (!settings.preserveIframes) {
					// Remove the iframe entirely
					iframe.parentNode.removeChild(iframe);
				}
			}
		}
	}

	// Also look for video links in regular anchor tags
	const links = container.getElementsByTagName('a');
	debugInfo(`Found ${links.length} links in container`);

	for (const link of links) {
		debugDebug('Processing link with href:', link.href);
		if (!link.href) {
			debugDebug('Link has no href, skipping');
			continue;
		}

		const platform = detectVideoPlatform(link.href);

		if (platform) {
			debugInfo(`Link detected as ${platform} platform:`, link.href);
			const videoId = extractVideoId(link.href, platform);
			debugDebug('Extracted video ID:', videoId);

			if (videoId && settings.addVideoLinks) {
				const existingVideo = videoData.find(v => v.videoId === videoId && v.platform === platform);

				if (!existingVideo) {
					const videoInfo = {
						platform: platform,
						videoId: videoId,
						originalUrl: link.href,
						title: link.textContent || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video`,
						width: '560',
						height: '315'
					};

					videoData.push(videoInfo);

					// Enhance the link with video information
					link.innerHTML = `Video: ${link.innerHTML || videoInfo.title}`;
					link.title = `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video: ${videoInfo.title}`;
				}
			}
		}
	}

	const duration = Date.now() - startTime;
	debugInfo(`Video processing complete: ${videoData.length} videos processed in ${duration}ms`);

	if (videoData.length > 0) {
		const summary = videoData.reduce((acc, video) => {
			acc[video.platform] = (acc[video.platform] || 0) + 1;
			return acc;
		}, {});
		debugInfo('Video summary by platform:', summary);
		debugDebug('Detailed video data:', videoData);
	}

	return videoData;
}

function createLink(clickAction, text, color = "lightskyblue") {
	const link = document.createElement('a');
	link.href = "javascript:";
	link.style.color = color;
	link.appendChild(document.createTextNode(text));
	link.addEventListener("click", () => {
		chrome.runtime.sendMessage(null, clickAction)
	});

	return link
}

// Debug logging utilities - SIMPLIFIED for reliability
let debugEnabled = false; // Start with false, will be updated

// Simple, reliable debug logging
function debugLog(level = 'INFO', ...args) {
	// Always try to get fresh debug state for now
	if (typeof chrome !== 'undefined' && chrome.storage) {
		chrome.storage.sync.get(['trilium_video_debug_mode']).then(result => {
			if (result.trilium_video_debug_mode === true) {
				const timestamp = new Date().toISOString().substr(11, 12);
				const icons = { ERROR: '[ERR]', WARN: '[WARN]', INFO: '[INFO]', DEBUG: '[DEBUG]' };
				const icon = icons[level] || '[VIDEO]';
				console.log(`[${timestamp}] ${icon} VIDEO ${level}:`, ...args);
			}
		}).catch(() => {
			// If storage fails, check URL parameter
			if (window.location.search.includes('debug=true')) {
				const timestamp = new Date().toISOString().substr(11, 12);
				const icons = { ERROR: '[ERR]', WARN: '[WARN]', INFO: '[INFO]', DEBUG: '[DEBUG]' };
				const icon = icons[level] || '[VIDEO]';
				console.log(`[${timestamp}] ${icon} VIDEO ${level}:`, ...args);
			}
		});
	} else {
		// Fallback: check URL parameter when chrome APIs not available
		if (window.location.search.includes('debug=true')) {
			const timestamp = new Date().toISOString().substr(11, 12);
			const icons = { ERROR: '[ERR]', WARN: '[WARN]', INFO: '[INFO]', DEBUG: '[DEBUG]' };
			const icon = icons[level] || '[VIDEO]';
			console.log(`[${timestamp}] ${icon} VIDEO ${level}:`, ...args);
		}
	}
}

// Convenience functions
function debugError(...args) { debugLog('ERROR', ...args); }
function debugWarn(...args) { debugLog('WARN', ...args); }
function debugInfo(...args) { debugLog('INFO', ...args); }
function debugDebug(...args) { debugLog('DEBUG', ...args); }

async function getUserVideoPreferences() {
	try {
		const result = await chrome.storage.sync.get([
			'trilium_video_processing_mode',
			'trilium_video_privacy_mode',
			'trilium_video_debug_mode'
		]);

		const mode = result.trilium_video_processing_mode || 'HYBRID';
		const privacyMode = result.trilium_video_privacy_mode !== false; // Default true
		const debugMode = result.trilium_video_debug_mode === true; // Default false

		// Map mode to options
		const modeOptions = {
			'EMBED_ONLY': {
				preserveIframes: false,
				createEmbeds: true,
				addVideoLinks: false
			},
			'LINKS_ONLY': {
				preserveIframes: false,
				createEmbeds: false,
				addVideoLinks: true
			},
			'PRESERVE_ORIGINAL': {
				preserveIframes: true,
				createEmbeds: false,
				addVideoLinks: false
			},
			'HYBRID': {
				preserveIframes: false,
				createEmbeds: true,
				addVideoLinks: true
			}
		};

		return {
			...modeOptions[mode],
			privacyMode: privacyMode,
			debugMode: debugMode,
			extractMetadata: true
		};
	} catch (error) {
		console.warn('Failed to get video preferences, using defaults:', error);
		// Return default hybrid mode
		return {
			preserveIframes: false,
			createEmbeds: true,
			addVideoLinks: true,
			privacyMode: true,
			debugMode: false,
			extractMetadata: true
		};
	}
}

async function prepareMessageResponse(message) {
	console.info('Message: ' + message.name);

	// Force debug test - this should always show
	console.log('[DEBUG] FORCED DEBUG TEST - Message received:', message.name);

	// Test debug functionality on every message
	debugInfo(`Processing message: ${message.name}`);	if (message.name === "ping") {
		return { success: true };
	}
	else if (message.name === "toast") {
		let messageText;

		if (message.noteId) {
			messageText = document.createElement('p');
			messageText.setAttribute("style", "padding: 0; margin: 0; font-size: larger;")
			messageText.appendChild(document.createTextNode(message.message + " "));
			messageText.appendChild(createLink(
				{name: 'openNoteInTrilium', noteId: message.noteId},
				"Open in Trilium."
			));

			// only after saving tabs
			if (message.tabIds) {
				messageText.appendChild(document.createElement("br"));
				messageText.appendChild(createLink(
					{name: 'closeTabs', tabIds: message.tabIds},
					"Close saved tabs.",
					"tomato"
				));
			}
		}
		else {
			messageText = message.message;
		}

		await requireLib('/lib/toast.js');

		showToast(messageText, {
			settings: {
				duration: 7000
			}
		});

		return { success: true }; // Return a response
	}
	else if (message.name === "status-toast") {
		await requireLib('/lib/toast.js');

		// Hide any existing status toast
		if (window.triliumStatusToast && window.triliumStatusToast.hide) {
			window.triliumStatusToast.hide();
		}

		// Store reference to the status toast so we can replace it
		window.triliumStatusToast = showToast(message.message, {
			settings: {
				duration: message.isProgress ? 60000 : 5000 // Long duration for progress, shorter for errors
			}
		});

		return { success: true }; // Return a response
	}
	else if (message.name === "update-status-toast") {
		await requireLib('/lib/toast.js');

		// Hide the previous status toast
		if (window.triliumStatusToast && window.triliumStatusToast.hide) {
			window.triliumStatusToast.hide();
		}

		// Show new toast with updated message
		window.triliumStatusToast = showToast(message.message, {
			settings: {
				duration: message.isProgress ? 60000 : 5000
			}
		});

		return { success: true }; // Return a response
	}
	else if (message.name === "trilium-save-selection") {
		// Initialize debug state early
		if (debugEnabled === null) {
			refreshDebugState();
		}
		debugInfo('=== Starting selection clipping process ===');

		const container = document.createElement('div');

		const selection = window.getSelection();
		debugInfo(`Processing selection with ${selection.rangeCount} ranges`);

		for (let i = 0; i < selection.rangeCount; i++) {
			const range = selection.getRangeAt(i);
			container.appendChild(range.cloneContents());
		}

		makeLinksAbsolute(container);

		const images = getImages(container);

		// Get user video preferences
		const videoPrefs = await getUserVideoPreferences();
		debugInfo('Using video preferences for selection:', videoPrefs);

		// Process embedded videos in selection with user preferences
		const videos = getEmbeddedVideos(container, videoPrefs);

		return {
			title: pageTitle(),
			content: container.innerHTML,
			images: images,
			videos: videos, // Include video metadata
			pageUrl: getPageLocationOrigin() + location.pathname + location.search + location.hash
		};

	}
	else if (message.name === 'trilium-get-rectangle-for-screenshot') {
		return getRectangleArea();
	}
	else if (message.name === "trilium-save-page") {
		// Initialize debug state early
		if (debugEnabled === null) {
			refreshDebugState();
		}
		debugInfo('=== Starting page clipping process ===');

		await requireLib("/lib/JSDOMParser.js");
		await requireLib("/lib/Readability.js");
		await requireLib("/lib/Readability-readerable.js");

		const {title, body} = getReadableDocument();
		debugInfo(`Got readable document: "${title}", body has ${body.children.length} children`);

		makeLinksAbsolute(body);

		const images = getImages(body);

		// Get user video preferences
		const videoPrefs = await getUserVideoPreferences();
		debugInfo('Using video preferences:', videoPrefs);

		// Process embedded videos with user preferences
		const videos = getEmbeddedVideos(body, videoPrefs);
		debugInfo(`Final result: ${videos.length} videos processed`);

        var labels = {};
		const dates = getDocumentDates();
		if (dates.publishedDate) {
			labels['publishedDate'] = dates.publishedDate.toISOString().substring(0, 10);
		}
		if (dates.modifiedDate) {
			labels['modifiedDate'] = dates.publishedDate.toISOString().substring(0, 10);
		}

		// Add video count as metadata if videos were found
		if (videos.length > 0) {
			labels['videoCount'] = videos.length.toString();
			labels['videoPlatforms'] = [...new Set(videos.map(v => v.platform))].join(', ');
		}

		return {
			title: title,
			content: body.innerHTML,
			images: images,
			videos: videos, // Include video metadata
			pageUrl: getPageLocationOrigin() + location.pathname + location.search,
			clipType: 'page',
			labels: labels
		};
	}
	else {
		throw new Error('Unknown command: ' + JSON.stringify(message));
	}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle async operations properly
    (async () => {
        try {
            const response = await prepareMessageResponse(message);
            sendResponse(response);
        } catch (error) {
            console.error('Error in message handler:', error);
            sendResponse({ error: error.message });
        }
    })();

    return true; // Important: indicates async response
});

const loadedLibs = [];

async function requireLib(libPath) {
	if (!loadedLibs.includes(libPath)) {
		loadedLibs.push(libPath);

		await chrome.runtime.sendMessage({name: 'load-script', file: libPath});
	}
}

// Initialize and test debug system when content script loads
console.log('[DEBUG] TRILIUM CONTENT SCRIPT LOADED');
console.log('[DEBUG] Chrome APIs available:', typeof chrome !== 'undefined');
console.log('[DEBUG] Location:', window.location.href);

// Test debug immediately
debugInfo('Content script loaded successfully');
console.log('[DEBUG] Debug test completed');
