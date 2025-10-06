const $triliumServerUrl = $("#trilium-server-url");
const $triliumServerPassword = $("#trilium-server-password");

const $errorMessage = $("#error-message");
const $successMessage = $("#success-message");

function showError(message) {
    $errorMessage.html(message).show();
    $successMessage.hide();
}

function showSuccess(message) {
    $successMessage.html(message).show();
    $errorMessage.hide();
}

async function saveTriliumServerSetup(e) {
    e.preventDefault();

    if ($triliumServerUrl.val().trim().length === 0
        || $triliumServerPassword.val().trim().length === 0) {
        showError("One or more mandatory inputs are missing. Please fill in server URL and password.");

        return;
    }

    let resp;

    try {
        resp = await fetch($triliumServerUrl.val() + '/api/login/token', {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: $triliumServerPassword.val()
            })
        });
    }
    catch (e) {
        showError("Unknown error: " + e.message);
        return;
    }

    if (resp.status === 401) {
        showError("Incorrect credentials.");
    }
    else if (resp.status !== 200) {
        showError("Unrecognised response with status code " + resp.status);
    }
    else {
        const json = await resp.json();

        showSuccess("Authentication against Trilium server has been successful.");

        $triliumServerPassword.val('');

        chrome.storage.sync.set({
            triliumServerUrl: $triliumServerUrl.val(),
            authToken: json.token
        });

        await restoreOptions();
    }
}

const $triliumServerSetupForm = $("#trilium-server-setup-form");
const $triliumServerConfiguredDiv = $("#trilium-server-configured");
const $triliumServerLink = $("#trilium-server-link");
const $resetTriliumServerSetupLink = $("#reset-trilium-server-setup");

$resetTriliumServerSetupLink.on("click", e => {
    e.preventDefault();

    chrome.storage.sync.set({
        triliumServerUrl: '',
        authToken: ''
    });

    restoreOptions();
});

$triliumServerSetupForm.on("submit", saveTriliumServerSetup);

const $triliumDesktopPort = $("#trilium-desktop-port");
const $triilumDesktopSetupForm = $("#trilium-desktop-setup-form");

$triilumDesktopSetupForm.on("submit", e => {
    e.preventDefault();

    const port = $triliumDesktopPort.val().trim();
    const portNum = parseInt(port);

    if (port && (isNaN(portNum) || portNum <= 0 || portNum >= 65536)) {
        showError(`Please enter valid port number.`);
        return;
    }

    chrome.storage.sync.set({
        triliumDesktopPort: port
    });

    showSuccess(`Port number has been saved.`);
});

async function restoreOptions() {
    const {triliumServerUrl} = await chrome.storage.sync.get("triliumServerUrl");
    const {authToken} = await chrome.storage.sync.get("authToken");

    $errorMessage.hide();
    $successMessage.hide();

    $triliumServerUrl.val('');
    $triliumServerPassword.val('');

    if (triliumServerUrl && authToken) {
        $triliumServerSetupForm.hide();
        $triliumServerConfiguredDiv.show();

        $triliumServerLink
            .attr("href", triliumServerUrl)
            .text(triliumServerUrl);
    }
    else {
        $triliumServerSetupForm.show();
        $triliumServerConfiguredDiv.hide();
    }

    const {triliumDesktopPort} = await chrome.storage.sync.get("triliumDesktopPort");

    $triliumDesktopPort.val(triliumDesktopPort);

    // Load debug settings
    await loadDebugSettings();
    // Load video settings
    await loadVideoSettings();
}

// Debug Settings Functions
async function loadDebugSettings() {
    const result = await chrome.storage.sync.get('trilium_debug_config');
    const debugConfig = result.trilium_debug_config || {
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

    $('#debug-enabled').prop('checked', debugConfig.enabled);
    $('#debug-all').prop('checked', debugConfig.modules.all);
    $('#debug-content').prop('checked', debugConfig.modules.content);
    $('#debug-video-processor').prop('checked', debugConfig.modules['video-processor']);
    $('#debug-background').prop('checked', debugConfig.modules.background);
    $('#debug-toast').prop('checked', debugConfig.modules.toast);
    $('#debug-readability').prop('checked', debugConfig.modules.readability);
    $('#debug-images').prop('checked', debugConfig.modules.images);

    // Show/hide debug modules based on enabled state
    if (debugConfig.enabled) {
        $('#debug-modules').show();
    }
}

async function saveDebugSettings(e) {
    e.preventDefault();

    const debugConfig = {
        enabled: $('#debug-enabled').is(':checked'),
        modules: {
            'content': $('#debug-content').is(':checked'),
            'video-processor': $('#debug-video-processor').is(':checked'),
            'background': $('#debug-background').is(':checked'),
            'toast': $('#debug-toast').is(':checked'),
            'readability': $('#debug-readability').is(':checked'),
            'images': $('#debug-images').is(':checked'),
            'all': $('#debug-all').is(':checked')
        }
    };

    await chrome.storage.sync.set({ trilium_debug_config: debugConfig });
    showSuccess('Debug settings saved successfully!');
}

// Event listeners for debug settings
$('#debug-enabled').on('change', function() {
    if ($(this).is(':checked')) {
        $('#debug-modules').show();
    } else {
        $('#debug-modules').hide();
    }
});

$('#debug-all').on('change', function() {
    const isChecked = $(this).is(':checked');
    $('#debug-modules input[type="checkbox"]:not(#debug-all)').prop('checked', isChecked);
});

$('#debug-settings-form').on('submit', saveDebugSettings);

// Video settings handling
async function loadVideoSettings() {
    try {
        const result = await chrome.storage.sync.get([
            'trilium_video_processing_mode',
            'trilium_video_privacy_mode',
            'trilium_video_debug_mode'
        ]);

        const savedMode = result.trilium_video_processing_mode || 'HYBRID';
        const savedPrivacy = result.trilium_video_privacy_mode !== false; // Default true
        const savedDebug = result.trilium_video_debug_mode === true; // Default false

        $('input[name="video-mode"][value="' + savedMode + '"]').prop('checked', true);
        $('#privacy-mode').prop('checked', savedPrivacy);
        $('#video-debug-mode').prop('checked', savedDebug);
    } catch (error) {
        console.warn('Failed to load video preferences:', error);
    }
}

async function saveVideoSettings(e) {
    e.preventDefault();

    try {
        const selectedMode = $('input[name="video-mode"]:checked').val();
        const privacyMode = $('#privacy-mode').is(':checked');
        const debugMode = $('#video-debug-mode').is(':checked');

        await chrome.storage.sync.set({
            'trilium_video_processing_mode': selectedMode,
            'trilium_video_privacy_mode': privacyMode,
            'trilium_video_debug_mode': debugMode
        });

        showSuccess('Video settings saved successfully!');
    } catch (error) {
        showError('Failed to save video settings: ' + error.message);
    }
}

// Event listeners for video settings
$('#video-settings-form').on('submit', saveVideoSettings);

// Back to extension functionality
$('#back-to-extension').on('click', function() {
    // Try to open the extension popup by opening the extension's popup URL
    // Since we can't directly trigger the popup, we'll close this tab
    // and the user can click the extension icon
    window.close();
});

// Theme functionality for options page
async function loadThemePreference() {
    try {
        const result = await chrome.storage.sync.get('trilium_theme_mode');
        const isDarkMode = result.trilium_theme_mode === 'dark';

        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    } catch (error) {
        console.warn('Failed to load theme preference:', error);
    }
}

$(async function() {
    await loadThemePreference();
    restoreOptions();
});
