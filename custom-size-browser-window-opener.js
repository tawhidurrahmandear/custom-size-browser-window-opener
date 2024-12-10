// Custom Size Browser Window Opener
// developed by Tawhidur Rahman Dear, https://www.tawhidurrahmandear.com
// Live Preview available at https://www.devilhunter.net/p/custom-size-browser-window-opener.html

    function openWindow() {
        const url = document.getElementById('urlInput').value;
        const width = parseInt(document.getElementById('widthInput').value, 10);
        const height = parseInt(document.getElementById('heightInput').value, 10);
        const errorMessage = document.getElementById('errorMessage');

        errorMessage.textContent = '';

        if (!url || isNaN(width) || isNaN(height)) {
            errorMessage.textContent = 'Please enter valid URL, width, and height.';
            return;
        }

        // Estimate the size of the window decorations
        const borderWidth = 17; // Default value for most browsers
        const titleBarHeight = 0; // Default height for the title bar in most browsers

        const totalWidth = width + borderWidth;
        const totalHeight = height + titleBarHeight;

        const left = (window.innerWidth / 2) - (totalWidth / 2);
        const top = (window.innerHeight / 2) - (totalHeight / 2);

        window.open(url, 'newWindow', `width=${totalWidth},height=${totalHeight},top=${top},left=${left}`);
    }