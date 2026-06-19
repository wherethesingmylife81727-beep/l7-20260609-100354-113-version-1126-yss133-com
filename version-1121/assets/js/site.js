(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards(scope) {
        var root = scope || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var keywordInput = root.querySelector('[data-filter-keyword]');
        var categorySelect = root.querySelector('[data-filter-category]');
        var yearSelect = root.querySelector('[data-filter-year]');
        var typeSelect = root.querySelector('[data-filter-type]');
        var noResults = root.querySelector('[data-no-results]');
        var keyword = normalize(keywordInput && keywordInput.value);
        var category = normalize(categorySelect && categorySelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardCategory = normalize(card.getAttribute('data-category'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }

            if (category && cardCategory !== category) {
                matched = false;
            }

            if (year && cardYear !== year) {
                matched = false;
            }

            if (type && cardType !== type) {
                matched = false;
            }

            card.classList.toggle('hidden-card', !matched);

            if (matched) {
                visible += 1;
            }
        });

        if (noResults) {
            noResults.classList.toggle('is-visible', visible === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        Array.prototype.slice.call(scope.querySelectorAll('[data-filter-keyword], [data-filter-category], [data-filter-year], [data-filter-type]')).forEach(function (control) {
            control.addEventListener('input', function () {
                filterCards(scope);
            });

            control.addEventListener('change', function () {
                filterCards(scope);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var keywordInput = scope.querySelector('[data-filter-keyword]');

        if (q && keywordInput) {
            keywordInput.value = q;
        }

        filterCards(scope);
    });

    function playVideo(video, shell) {
        var stream = video.getAttribute('data-stream');

        if (!stream) {
            return;
        }

        if (video.getAttribute('data-ready') !== 'true') {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            video.setAttribute('data-ready', 'true');
        }

        shell.classList.add('is-playing');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-overlay');

        if (video && button) {
            button.addEventListener('click', function () {
                playVideo(video, shell);
            });

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
        }
    });
})();
