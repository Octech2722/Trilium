# Demo script for testing the Web Video Embedding feature
# PowerShell version for Windows users

Write-Host "🎬 Trilium Web Clipper - Video Embedding Feature Demo" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 This demo will help you test the new video embedding functionality:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. 🌐 Test Page Setup" -ForegroundColor Green
Write-Host "   - Open test-video-page.html in your browser"
Write-Host "   - This page contains various video embeds and links"
Write-Host ""

Write-Host "2. 🔧 Extension Setup" -ForegroundColor Green
Write-Host "   - Load the updated web clipper extension"
Write-Host "   - Check that video settings appear in popup"
Write-Host "   - Verify different processing modes work"
Write-Host ""

Write-Host "3. 🧪 Testing Scenarios" -ForegroundColor Green
Write-Host "   a) Full Page Clipping:"
Write-Host "      - Click 'Save whole page' on the test page"
Write-Host "      - Verify videos are processed according to selected mode"
Write-Host "      - Check that video metadata appears in note labels"
Write-Host ""
Write-Host "   b) Selection Clipping:"
Write-Host "      - Select content with embedded videos"
Write-Host "      - Use Ctrl+Shift+S or context menu to clip"
Write-Host "      - Confirm videos are processed in selection"
Write-Host ""
Write-Host "   c) Settings Testing:"
Write-Host "      - Try different video processing modes"
Write-Host "      - Toggle privacy mode on/off"
Write-Host "      - Verify settings persist across browser sessions"
Write-Host ""

Write-Host "4. 🔍 Verification Steps" -ForegroundColor Green
Write-Host "   - YouTube videos use youtube-nocookie.com in privacy mode"
Write-Host "   - Vimeo embeds include dnt=1 parameter when privacy enabled"
Write-Host "   - Video links get enhanced with 📹 emoji"
Write-Host "   - Note labels include video count and platform information"
Write-Host ""

Write-Host "5. 🐛 Troubleshooting" -ForegroundColor Green
Write-Host "   - Check browser console for any error messages"
Write-Host "   - Verify Chrome storage permissions are granted"
Write-Host "   - Test with different video platforms and URL formats"
Write-Host ""

Write-Host "📚 Supported Video Platforms:" -ForegroundColor Magenta
Write-Host "   ✅ YouTube (youtube.com, youtu.be, youtube-nocookie.com)"
Write-Host "   ✅ Vimeo (vimeo.com)"
Write-Host "   ✅ DailyMotion (dailymotion.com)"
Write-Host "   ✅ Twitch (twitch.tv)"
Write-Host "   ✅ Archive.org and Wikimedia"
Write-Host ""

Write-Host "🔧 Available Processing Modes:" -ForegroundColor Magenta
Write-Host "   • Hybrid (default): Embeds + fallback links"
Write-Host "   • Embed Only: Clean embeds without links"
Write-Host "   • Links Only: Convert videos to text links"
Write-Host "   • Preserve Original: Keep original iframes"
Write-Host ""

Write-Host "💡 Pro Tips:" -ForegroundColor Yellow
Write-Host "   - Use 'Hybrid' mode for best compatibility"
Write-Host "   - Enable privacy mode for enhanced user privacy"
Write-Host "   - Check note labels for video processing summary"
Write-Host "   - Test with real video-heavy websites like blogs or news sites"
Write-Host ""

Write-Host "🎯 Expected Results:" -ForegroundColor Yellow
Write-Host "   - Videos are preserved during clipping"
Write-Host "   - Embeds use privacy-enhanced URLs when enabled"
Write-Host "   - Video links are clearly marked and accessible"
Write-Host "   - Processing statistics appear in note metadata"
Write-Host ""

Write-Host "Demo setup complete! Start testing by opening the test page and trying different clipping scenarios." -ForegroundColor Green
Write-Host ""
Write-Host "For detailed documentation, see VIDEO_EMBEDDING_FEATURE.md" -ForegroundColor Cyan

# Optional: Open the test page in default browser
$response = Read-Host "Would you like to open the test page now? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    $testPagePath = Join-Path $PSScriptRoot "test-video-page.html"
    if (Test-Path $testPagePath) {
        Start-Process $testPagePath
        Write-Host "Test page opened in your default browser!" -ForegroundColor Green
    } else {
        Write-Host "Test page not found. Make sure test-video-page.html exists in the current directory." -ForegroundColor Red
    }
}