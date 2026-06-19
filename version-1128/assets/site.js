(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };

        var run = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                run();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                run();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                run();
            });
        });
        show(0);
        run();
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = searchPage.querySelector('[data-search-input]');
        var label = searchPage.querySelector('[data-search-label]');
        var cards = Array.prototype.slice.call(searchPage.querySelectorAll('[data-search-card]'));
        var empty = searchPage.querySelector('[data-empty-state]');

        var normalize = function (value) {
            return (value || '').toString().trim().toLowerCase();
        };

        var apply = function (value) {
            var needle = normalize(value);
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-keywords'));
                var visible = !needle || haystack.indexOf(needle) !== -1;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });
            if (label) {
                label.textContent = needle ? '“' + value + '” 的搜索结果' : '全部片库';
            }
            if (empty) {
                empty.classList.toggle('is-visible', shown === 0);
            }
        };

        if (input) {
            input.value = query;
            input.addEventListener('input', function () {
                apply(input.value);
            });
        }
        apply(query);
    }
})();
