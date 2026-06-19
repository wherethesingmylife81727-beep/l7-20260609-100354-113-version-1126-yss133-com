(function () {
    var source = window.__PLAYER_SOURCE__ || '';
    var video = document.querySelector('[data-player-video]');
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-player-trigger]'));
    var overlay = document.querySelector('[data-player-overlay]');
    var hlsInstance = null;

    var attach = function () {
        if (!video || !source) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.getAttribute('src') !== source) {
                video.setAttribute('src', source);
            }
        } else if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            }
        } else if (video.getAttribute('src') !== source) {
            video.setAttribute('src', source);
        }
    };

    var start = function () {
        attach();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        if (video) {
            var play = video.play();
            if (play && typeof play.catch === 'function') {
                play.catch(function () {});
            }
        }
    };

    triggers.forEach(function (trigger) {
        trigger.addEventListener('click', start);
    });

    if (video) {
        video.addEventListener('click', function () {
            if (!video.getAttribute('src') && !hlsInstance) {
                start();
            }
        });
    }
})();
