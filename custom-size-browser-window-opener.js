// Custom Size Browser Window Opener
// developed by Tawhidur Rahman Dear, https://www.tawhidurrahmandear.com
// Live Preview available at https://www.devilhunter.net/p/custom-size-browser-window-opener.html


(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  // Rough window-frame size, used only for the live estimate before a window exists.
  var FALLBACK_CHROME = { w: 16, h: 90 };
  var lastChrome = null; // measured after the first successful open

  function screenArea() {
    return {
      w: Math.floor(window.screen.availWidth),
      h: Math.floor(window.screen.availHeight)
    };
  }

  function getMode() {
    var r = document.querySelector('input[name="sizeMode"]:checked');
    return r ? r.value : 'size';
  }

  function getRatio() {
    var preset = $('ratioPreset').value;
    var rw, rh;
    if (preset === 'custom') {
      rw = parseFloat($('ratioW').value);
      rh = parseFloat($('ratioH').value);
    } else {
      var p = preset.split(':');
      rw = parseFloat(p[0]);
      rh = parseFloat(p[1]);
    }
    if (!(rw > 0) || !(rh > 0)) return null;
    return { w: rw, h: rh };
  }

  // Largest rectangle with the given ratio inside maxW x maxH, then scaled by pct.
  function fitRatio(ratio, maxW, maxH, pct) {
    var w = maxW;
    var h = w * ratio.h / ratio.w;
    if (h > maxH) {
      h = maxH;
      w = h * ratio.w / ratio.h;
    }
    var s = Math.min(Math.max(pct, 1), 100) / 100;
    return { w: Math.max(1, Math.floor(w * s)), h: Math.max(1, Math.floor(h * s)) };
  }

  function showError(msg) { $('errorMessage').textContent = msg || ''; }

  function normalizeUrl(raw) {
    var u = (raw || '').trim().replace(/^["']|["']$/g, ''); // strip quotes from "Copy as path"
    if (!u) return '';

    // Local files: file://..., C:\path, C:/path, \\server\share, /unix/path
    var isFileUrl = /^file:\/\//i.test(u);
    var isWinPath = /^[a-zA-Z]:[\\\/]/.test(u);
    var isUncPath = /^\\\\[^\\]/.test(u);
    var isUnixPath = /^\/(?!\/)/.test(u);

    if (isFileUrl || isWinPath || isUncPath || isUnixPath) {
      u = u.replace(/\\/g, '/');
      if (isUncPath) {
        u = 'file:' + u;                       // //server/share -> file://server/share
      } else if (!isFileUrl) {
        u = 'file:///' + u.replace(/^\/+/, ''); // C:/x -> file:///C:/x, /home/x -> file:///home/x
      }
      return u.replace(/ /g, '%20');
    }

    if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
    // Only allow web URLs otherwise.
    if (!/^https?:/i.test(u)) return '';
    return u;
  }

  /* ---------- UI ---------- */

  function refreshUI() {
    var mode = getMode();
    $('sizePanel').hidden = mode !== 'size';
    $('ratioPanel').hidden = mode !== 'ratio';
    $('customRatioRow').hidden = $('ratioPreset').value !== 'custom';
    $('scaleValue').textContent = $('scaleInput').value;

    var a = screenArea();
    $('screenInfo').textContent =
      'Your screen: ' + window.screen.width + ' \u00D7 ' + window.screen.height +
      ' (usable ' + a.w + ' \u00D7 ' + a.h + ')';

    var chrome = lastChrome || FALLBACK_CHROME;
    var maxW = a.w - chrome.w;
    var maxH = a.h - chrome.h;
    var text = '';

    if (mode === 'ratio') {
      var ratio = getRatio();
      if (ratio) {
        var f = fitRatio(ratio, maxW, maxH, parseFloat($('scaleInput').value));
        text = 'Window will open at about ' + f.w + ' \u00D7 ' + f.h + ' (page area)';
      }
    } else {
      text = 'Maximum page area on this screen: about ' + maxW + ' \u00D7 ' + maxH;
    }
    $('previewInfo').textContent = text;
  }

  /* ---------- Opening ---------- */

  function waitForViewport(win, tries, cb) {
    // Right after window.open some browsers report 0 for the inner size.
    if (win.closed) return cb(false);
    if (win.innerWidth > 0 && win.innerHeight > 0) return cb(true);
    if (tries <= 0) return cb(false);
    setTimeout(function () { waitForViewport(win, tries - 1, cb); }, 30);
  }

  function openWindow() {
    showError('');

    var url = normalizeUrl($('urlInput').value);
    if (!url) {
      showError('Please enter a valid web address (http/https) or local file path.');
      return;
    }

    var mode = getMode();
    var reqW, reqH, ratio, pct;

    if (mode === 'size') {
      reqW = parseInt($('widthInput').value, 10);
      reqH = parseInt($('heightInput').value, 10);
      if (!(reqW > 0) || !(reqH > 0)) {
        showError('Please enter a valid width and height.');
        return;
      }
    } else {
      ratio = getRatio();
      pct = parseFloat($('scaleInput').value);
      if (!ratio) {
        showError('Please enter a valid ratio (both numbers greater than 0).');
        return;
      }
    }

    var a = screenArea();

    // Open synchronously inside the click so pop-up blockers allow it.
    // A small blank window is opened first so the real frame size can be measured.
    var win = window.open('', '_blank', 'popup=yes,width=400,height=300,left=0,top=0');
    if (!win) {
      showError('The browser blocked the pop-up. Please allow pop-ups for this page and try again.');
      return;
    }

    var btn = $('openBtn');
    btn.disabled = true;

    waitForViewport(win, 20, function (ok) {
      try {
        var chrome = ok
          ? { w: win.outerWidth - win.innerWidth, h: win.outerHeight - win.innerHeight }
          : FALLBACK_CHROME;
        if (!(chrome.w >= 0) || !(chrome.h >= 0)) chrome = FALLBACK_CHROME;
        if (ok) lastChrome = chrome;

        var maxW = a.w - chrome.w;
        var maxH = a.h - chrome.h;
        var w, h;

        if (mode === 'size') {
          if (reqW > maxW || reqH > maxH) {
            win.close();
            showError('That size is larger than your screen allows. Maximum is ' +
              maxW + ' \u00D7 ' + maxH + '.');
            return;
          }
          w = reqW; h = reqH;
        } else {
          var f = fitRatio(ratio, maxW, maxH, pct);
          w = f.w; h = f.h;
        }

        var outerW = w + chrome.w;
        var outerH = h + chrome.h;
        var left = Math.max(0, Math.round((a.w - outerW) / 2)) + (window.screen.availLeft || 0);
        var top = Math.max(0, Math.round((a.h - outerH) / 2)) + (window.screen.availTop || 0);

        win.resizeTo(outerW, outerH);
        win.moveTo(left, top);

        // Detach from this page before navigating to the target site.
        try { win.opener = null; } catch (e) { /* ignore */ }
        win.location.href = url;
        win.focus();

        refreshUI();
      } catch (err) {
        showError('Could not set the window size: ' + err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---------- Init ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    var inputs = document.querySelectorAll(
      'input[name="sizeMode"], #ratioPreset, #ratioW, #ratioH, #scaleInput, #widthInput, #heightInput'
    );
    Array.prototype.forEach.call(inputs, function (el) {
      el.addEventListener('input', refreshUI);
      el.addEventListener('change', refreshUI);
    });
    window.addEventListener('resize', refreshUI);
    $('openBtn').addEventListener('click', openWindow);
    refreshUI();
  });

  // Kept for backward compatibility with the original inline onclick="openWindow()".
  window.openWindow = openWindow;
})();
