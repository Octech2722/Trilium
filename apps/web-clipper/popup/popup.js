async function sendMessage(message) {
    try {
        return await chrome.runtime.sendMessage(message);
    }
    catch (e) {
        console.log("Calling browser runtime failed:", e);

        alert("Calling browser runtime failed. Refreshing page might help.");
    }
}

const $showOptionsButton = $("#show-options-button");
const $saveCroppedScreenShotButton = $("#save-cropped-screenshot-button");
const $saveWholeScreenShotButton = $("#save-whole-screenshot-button");
const $saveWholePageButton = $("#save-whole-page-button");
const $saveTabsButton = $("#save-tabs-button");

// View switching functionality
function showView(viewId) {
    // Hide all views
    $('.view').hide();
    // Show the requested view
    $('#' + viewId).show();
}

function showMainView() {
    showView('main-view');
}

function showSettingsView() {
    showView('settings-view');
    loadSettingsData();
}

// Settings data loading
async function loadSettingsData() {
    try {
        // Load video settings
        const videoResult = await chrome.storage.sync.get([
            'trilium_video_processing_mode',
            'trilium_video_privacy_mode'
        ]);

        const savedMode = videoResult.trilium_video_processing_mode || 'HYBRID';
        const savedPrivacy = videoResult.trilium_video_privacy_mode !== false;

        $('input[name="video-mode"][value="' + savedMode + '"]').prop('checked', true);
        $('#privacy-mode').prop('checked', savedPrivacy);

        // Load debug settings
        const debugResult = await chrome.storage.sync.get('trilium_debug_config');
        const debugConfig = debugResult.trilium_debug_config || { enabled: false };

        $('#debug-enabled').prop('checked', debugConfig.enabled);
    } catch (error) {
        console.warn('Failed to load settings:', error);
    }
}

// Settings form handlers
async function saveVideoSettings(e) {
    e.preventDefault();

    try {
        const selectedMode = $('input[name="video-mode"]:checked').val();
        const privacyMode = $('#privacy-mode').is(':checked');

        await chrome.storage.sync.set({
            'trilium_video_processing_mode': selectedMode,
            'trilium_video_privacy_mode': privacyMode
        });

        // Show success feedback
        const button = $(e.target).find('.save-button');
        const originalText = button.text();
        button.text('Saved!').css('background', '#27ae60');
        setTimeout(() => {
            button.text(originalText).css('background', '');
        }, 1500);
    } catch (error) {
        console.warn('Failed to save video settings:', error);
    }
}

async function saveDebugSettings(e) {
    e.preventDefault();

    try {
        const debugConfig = {
            enabled: $('#debug-enabled').is(':checked'),
            modules: {
                'content': true,
                'video-processor': true,
                'background': true,
                'toast': true,
                'readability': true,
                'images': true,
                'all': true
            }
        };

        await chrome.storage.sync.set({ trilium_debug_config: debugConfig });

        // Show success feedback
        const button = $(e.target).find('.save-button');
        const originalText = button.text();
        button.text('Saved!').css('background', '#27ae60');
        setTimeout(() => {
            button.text(originalText).css('background', '');
        }, 1500);
    } catch (error) {
        console.warn('Failed to save debug settings:', error);
    }
}

// Event listeners
$showOptionsButton.on("click", showSettingsView);
$("#back-to-main").on("click", showMainView);
$("#video-settings-form").on("submit", saveVideoSettings);
$("#debug-settings-form").on("submit", saveDebugSettings);

$saveCroppedScreenShotButton.on("click", () => {
    sendMessage({name: 'save-cropped-screenshot'});

    window.close();
});

$saveWholeScreenShotButton.on("click", () => {
    sendMessage({name: 'save-whole-screenshot'});

    window.close();
});

$saveWholePageButton.on("click", () => sendMessage({name: 'save-whole-page'}));

$saveTabsButton.on("click", () => sendMessage({name: 'save-tabs'}));

const $saveLinkWithNoteWrapper = $("#save-link-with-note-wrapper");
const $textNote = $("#save-link-with-note-textarea");
const $keepTitle = $("#keep-title-checkbox");

$textNote.on('keypress', function (event) {
    if ((event.which === 10 || event.which === 13) && event.ctrlKey) {
        saveLinkWithNote();
        return false;
    }

    return true;
});

$("#save-link-with-note-button").on("click", () => {
    $saveLinkWithNoteWrapper.show();

    $textNote[0].focus();
});

$("#cancel-button").on("click", () => {
    $saveLinkWithNoteWrapper.hide();
    $textNote.val("");

    window.close();
});

async function saveLinkWithNote() {
    const textNoteVal = $textNote.val().trim();
    let title, content;

    if (!textNoteVal) {
        title = '';
        content = '';
    }
    else if ($keepTitle[0].checked){
        title = '';
        content = textNoteVal;
    }
    else {
        const match = /^(.*?)([.?!]\s|\n)/.exec(textNoteVal);

        if (match) {
            title = match[0].trim();
            content = textNoteVal.substr(title.length).trim();
        }
        else {
            title = textNoteVal;
            content = '';
        }
    }

    content = escapeHtml(content);

    const result = await sendMessage({name: 'save-link-with-note', title, content});

    if (result) {
        $textNote.val('');

        window.close();
    }
}

$("#save-button").on("click", saveLinkWithNote);

$("#show-help-button").on("click", () => {
    window.open("https://github.com/zadam/trilium/wiki/Web-clipper", '_blank');
});

function escapeHtml(string) {
    const pre = document.createElement('pre');
    const text = document.createTextNode(string);
    pre.appendChild(text);

    const htmlWithPars = pre.innerHTML.replace(/\n/g, "</p><p>");

    return '<p>' + htmlWithPars + '</p>';
}

const $connectionStatus = $("#connection-status");
const $needsConnection = $(".needs-connection");
const $alreadyVisited = $("#already-visited");

chrome.runtime.onMessage.addListener(request => {
    if (request.name === 'trilium-search-status') {
        const {triliumSearch} = request;

        let statusText = triliumSearch.status;
        let isConnected;

        if (triliumSearch.status === 'not-found') {
            statusText = `<span style="color: red">Not found</span>`;
            isConnected = false;
        }
        else if (triliumSearch.status === 'version-mismatch') {
            const whatToUpgrade = triliumSearch.extensionMajor > triliumSearch.triliumMajor ? "Trilium Notes" : "this extension";

            statusText = `<span style="color: orange">Trilium instance found, but it is not compatible with this extension version. Please update ${whatToUpgrade} to the latest version.</span>`;
            isConnected = true;
        }
        else if (triliumSearch.status === 'found-desktop') {
            statusText = `<span style="color: green">Connected on port ${triliumSearch.port}</span>`;
            isConnected = true;
        }
        else if (triliumSearch.status === 'found-server') {
            statusText = `<span style="color: green" title="Connected to ${triliumSearch.url}">Connected to the server</span>`;
            isConnected = true;
        }

        $connectionStatus.html(statusText);

        if (isConnected) {
            $needsConnection.removeAttr("disabled");
            $needsConnection.removeAttr("title");
            chrome.runtime.sendMessage({name: "trigger-trilium-search-note-url"});
        }
        else {
            $needsConnection.attr("disabled", "disabled");
            $needsConnection.attr("title", "This action can't be performed without active connection to Trilium.");
        }
    }
    else if (request.name == "trilium-previously-visited"){
        const {searchNote} = request;
        if (searchNote.status === 'found'){
            const a = createLink({name: 'openNoteInTrilium', noteId: searchNote.noteId},
            "Open in Trilium.")
            noteFound = `Already visited website!`;
            $alreadyVisited.html(noteFound);
            $alreadyVisited[0].appendChild(a);
        }else{
            $alreadyVisited.html('');
        }


    }
});

// Connection handling

const $checkConnectionButton = $("#check-connection-button");

$checkConnectionButton.on("click", () => {
    chrome.runtime.sendMessage({
        name: "trigger-trilium-search"
    })
});

// Theme toggle functionality
async function loadThemePreference() {
    try {
        const result = await chrome.storage.sync.get('trilium_theme_mode');
        const isDarkMode = result.trilium_theme_mode === 'dark';

        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            $('.sun-icon').hide();
            $('.moon-icon').show();
        } else {
            document.body.classList.remove('dark-mode');
            $('.sun-icon').show();
            $('.moon-icon').hide();
        }
    } catch (error) {
        console.warn('Failed to load theme preference:', error);
    }
}

async function toggleTheme() {
    try {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newTheme = isDarkMode ? 'light' : 'dark';

        // Toggle the theme
        if (newTheme === 'dark') {
            document.body.classList.add('dark-mode');
            $('.sun-icon').hide();
            $('.moon-icon').show();
        } else {
            document.body.classList.remove('dark-mode');
            $('.sun-icon').show();
            $('.moon-icon').hide();
        }

        // Save the preference
        await chrome.storage.sync.set({
            'trilium_theme_mode': newTheme
        });
    } catch (error) {
        console.warn('Failed to toggle theme:', error);
    }
}

// Theme toggle event listener
$("#theme-toggle-button").on("click", toggleTheme);

$(() => {
    chrome.runtime.sendMessage({name: "send-trilium-search-status"});
    loadThemePreference();
});
