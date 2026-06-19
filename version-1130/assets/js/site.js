(function () {
  const body = document.body;
  const base = body ? body.getAttribute('data-base') || './' : './';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function joinBase(path) {
    return base + path;
  }

  function initMobileNav() {
    const button = qs('[data-mobile-menu]');
    const nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    const root = qs('[data-hero]');
    if (!root) {
      return;
    }
    const slides = qsa('[data-hero-slide]', root);
    const dots = qsa('[data-hero-dot]', root);
    const prev = qs('[data-hero-prev]', root);
    const next = qs('[data-hero-next]', root);
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    const panel = qs('[data-search-panel]');
    const input = qs('[data-global-search]');
    const results = qs('[data-search-results]');
    const openers = qsa('[data-open-search]');
    const closer = qs('[data-close-search]');
    if (!panel || !input || !results) {
      return;
    }

    function openPanel() {
      panel.classList.add('is-open');
      window.setTimeout(function () {
        input.focus();
      }, 30);
    }

    function closePanel() {
      panel.classList.remove('is-open');
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = '';
        return;
      }
      results.innerHTML = items.slice(0, 18).map(function (item) {
        return [
          '<a class="search-result-item" href="' + joinBase(item.url) + '">',
          '<img src="' + joinBase(item.cover) + '" alt="' + escapeHtml(item.title) + '">',
          '<div>',
          '<h3>' + escapeHtml(item.title) + '</h3>',
          '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.category) + '</p>',
          '</div>',
          '</a>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    input.addEventListener('input', function () {
      const keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        render([]);
        return;
      }
      const source = window.MOVIE_INDEX || [];
      const matched = source.filter(function (item) {
        return [item.title, item.year, item.region, item.type, item.genre, item.oneLine, item.category]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) !== -1;
      });
      render(matched);
    });

    openers.forEach(function (button) {
      button.addEventListener('click', openPanel);
    });

    if (closer) {
      closer.addEventListener('click', closePanel);
    }

    panel.addEventListener('click', function (event) {
      if (event.target === panel) {
        closePanel();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closePanel();
      }
    });
  }

  function initFilters() {
    const list = qs('[data-filter-list]');
    if (!list) {
      return;
    }
    const textInput = qs('[data-filter-text]');
    const yearSelect = qs('[data-filter-year]');
    const typeSelect = qs('[data-filter-type]');
    const cards = qsa('.movie-card', list);

    function apply() {
      const text = textInput ? textInput.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      cards.forEach(function (card) {
        const haystack = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.type, card.dataset.year]
          .join(' ')
          .toLowerCase();
        const textOk = !text || haystack.indexOf(text) !== -1;
        const yearOk = !year || card.dataset.year === year;
        const typeOk = !type || card.dataset.type === type;
        card.classList.toggle('is-filter-hidden', !(textOk && yearOk && typeOk));
      });
    }

    [textInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      const video = qs('video', player);
      const button = qs('[data-play-button]', player);
      if (!video || !button) {
        return;
      }

      function prepare() {
        const url = video.getAttribute('data-hls');
        if (!url || video.dataset.ready === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          player.hls = hls;
        } else {
          video.src = url;
        }
        video.dataset.ready = '1';
      }

      function play() {
        prepare();
        button.classList.add('is-hidden');
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initSearch();
    initFilters();
    initPlayers();
  });
})();
