// Custom Size Browser Window Opener
// developed by Tawhidur Rahman Dear, https://www.tawhidurrahmandear.com
// Live Preview available at https://www.devilhunter.net/p/custom-size-browser-window-opener.html

      function openWindow() {
        let url = document.getElementById('urlInput').value;
        const width = parseInt(document.getElementById('widthInput').value, 10);
        const height = parseInt(document.getElementById('heightInput').value, 10);
        const errorMessage = document.getElementById('errorMessage');

        errorMessage.textContent = '';

        if (!url || isNaN(width) || isNaN(height)) {
            errorMessage.textContent = 'Please enter valid URL, width, and height.';
            return;
        }

        // Handle local files also by ensuring correct format
        if (url.startsWith('file://') || url.match(/^[a-zA-Z]:\\/)) {
            url = url.replace(/\\/g, '/');
            if (!url.startsWith('file://')) {
                url = 'file:///' + url;
            }
        }

        const borderWidth = 17;
        const titleBarHeight = 0;
        const totalWidth = width + borderWidth;
        const totalHeight = height + titleBarHeight;
        const left = (window.innerWidth / 2) - (totalWidth / 2);
        const top = (window.innerHeight / 2) - (totalHeight / 2);

        window.open(url, 'newWindow', `width=${totalWidth},height=${totalHeight},top=${top},left=${left}`);
    }
