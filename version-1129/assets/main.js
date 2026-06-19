(function () {
    var mobileButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('is-open');
            mobileButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('.hero-stage');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
        var next = document.querySelector('.hero-next');
        var prev = document.querySelector('.hero-prev');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        show(0);
        restart();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var activeChip = '';

    function applyFilter() {
        if (!cards.length) {
            return;
        }

        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = ((card.dataset.title || '') + ' ' + (card.dataset.meta || '')).toLowerCase();
            var matchText = !query || haystack.indexOf(query) !== -1;
            var matchChip = !activeChip || haystack.indexOf(activeChip.toLowerCase()) !== -1;
            var match = matchText && matchChip;
            card.classList.toggle('hidden-card', !match);
            if (match) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var value = chip.dataset.filterChip || '';
            activeChip = activeChip === value ? '' : value;
            chips.forEach(function (item) {
                item.classList.toggle('is-active', item === chip && activeChip);
            });
            applyFilter();
        });
    });

    var searchRoot = document.querySelector('[data-search-results]');

    if (searchRoot && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';
        var searchBox = document.querySelector('[data-search-page-input]');

        if (searchBox) {
            searchBox.value = queryValue;
        }

        function renderSearch(query) {
            var normalized = query.trim().toLowerCase();
            var results = window.SEARCH_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
                return !normalized || text.indexOf(normalized) !== -1;
            }).slice(0, 120);

            searchRoot.innerHTML = results.map(function (movie) {
                return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-meta="' + escapeHtml(movie.genre) + '">' +
                    '<a class="poster-link" href="./' + movie.file + '">' +
                    '<span class="poster-frame">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-shade"></span>' +
                    '<span class="play-chip">▶</span>' +
                    '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
                    '</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                    '<div class="card-tags"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
                    '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join('');

            var searchEmpty = document.querySelector('[data-search-empty]');
            if (searchEmpty) {
                searchEmpty.style.display = results.length ? 'none' : 'block';
            }
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }

        renderSearch(queryValue);

        if (searchBox) {
            searchBox.addEventListener('input', function () {
                renderSearch(searchBox.value);
            });
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-overlay');

        if (!video) {
            return;
        }

        var stream = video.getAttribute('data-stream');
        var hls = null;

        function prepare() {
            if (!stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.src) {
                    video.src = stream;
                }
            } else if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                }
            } else if (!video.src) {
                video.src = stream;
            }
        }

        function startPlayback() {
            prepare();
            player.classList.add('is-playing');
            video.controls = true;
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
    });
})();
