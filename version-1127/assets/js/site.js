(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.textContent = open ? '×' : '☰';
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          play();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          play();
        });
      });

      show(0);
      play();
    }

    var filters = Array.prototype.slice.call(document.querySelectorAll('.page-filter'));
    filters.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-filter-year]');
      var grid = document.querySelector('[data-filter-grid]');
      if (!grid) {
        return;
      }
      var items = Array.prototype.slice.call(grid.children);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (input && query) {
        input.value = query;
      }

      function matchYear(item, selected) {
        if (!selected) {
          return true;
        }
        var itemYear = Number(item.getAttribute('data-year')) || 0;
        if (selected === '2021') {
          return itemYear <= 2021;
        }
        return String(itemYear) === selected;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selected = year ? year.value : '';
        items.forEach(function (item) {
          var haystack = [
            item.getAttribute('data-title'),
            item.getAttribute('data-genre'),
            item.getAttribute('data-type'),
            item.getAttribute('data-region')
          ].join(' ').toLowerCase();
          var visible = (!keyword || haystack.indexOf(keyword) !== -1) && matchYear(item, selected);
          item.classList.toggle('is-hidden', !visible);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      apply();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.play-overlay');
      var stream = box.getAttribute('data-stream') || '';
      var attached = false;
      var hlsInstance = null;

      function attach() {
        if (attached || !video || !stream) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          attached = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          attached = true;
          return;
        }
        video.src = stream;
        attached = true;
      }

      function start() {
        attach();
        box.classList.add('is-playing');
        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener('play', function () {
          box.classList.add('is-playing');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
