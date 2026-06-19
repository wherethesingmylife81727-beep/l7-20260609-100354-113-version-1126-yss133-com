(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value == null ? "" : value);
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = $(".menu-toggle");
    var menu = $(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = $(".hero");
    if (!hero) {
      return;
    }
    var slides = $all(".hero-slide", hero);
    var dots = $all(".hero-dot", hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  function initGridFilters() {
    var bars = $all("[data-filter-bar]");
    bars.forEach(function (bar) {
      var scope = document;
      var input = $("[data-filter-input]", bar);
      var region = $("[data-filter-region]", bar);
      var year = $("[data-filter-year]", bar);
      var grid = $("[data-filter-grid]");
      var empty = $("[data-filter-empty]");
      if (!grid) {
        return;
      }
      var cards = $all(".movie-card", grid);

      function matches(card) {
        var q = input ? input.value.trim().toLowerCase() : "";
        var r = region ? region.value : "";
        var y = year ? year.value : "";
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var okQ = !q || haystack.indexOf(q) !== -1;
        var okR = !r || card.getAttribute("data-region") === r;
        var okY = !y || card.getAttribute("data-year") === y;
        return okQ && okR && okY;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, region, year].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initSearchPage() {
    var panel = $("[data-search-panel]");
    var grid = $("[data-search-results]");
    if (!panel || !grid || !window.MOVIES_INDEX) {
      return;
    }

    var q = $("[data-search-q]", panel);
    var region = $("[data-search-region]", panel);
    var year = $("[data-search-year]", panel);
    var category = $("[data-search-category]", panel);
    var params = new URLSearchParams(window.location.search);
    var initialQ = params.get("q") || "";
    if (q) {
      q.value = initialQ;
    }

    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="card-cover" href="./' + escapeHtml(movie.file) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-chip">播放</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a class="card-title" href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a>',
        '    <p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
        '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
        '    <p class="card-tags">' + escapeHtml(movie.categoryName) + '</p>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function run() {
      var term = q ? q.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var y = year ? year.value : "";
      var c = category ? category.value : "";
      var results = window.MOVIES_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.categoryName].join(" ").toLowerCase();
        return (!term || haystack.indexOf(term) !== -1) &&
          (!r || movie.region === r) &&
          (!y || movie.year === y) &&
          (!c || movie.categorySlug === c);
      }).slice(0, 240);

      if (!results.length) {
        grid.innerHTML = '<div class="filter-empty show">没有找到匹配影片</div>';
        return;
      }
      grid.innerHTML = results.map(card).join("");
    }

    [q, region, year, category].forEach(function (el) {
      if (el) {
        el.addEventListener("input", run);
        el.addEventListener("change", run);
      }
    });
    run();
  }

  function initMoviePlayer(videoId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById("playerOverlay");
    var button = document.getElementById("playerButton");
    var started = false;
    var hls = null;
    if (!video) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }
      started = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initGridFilters();
    initSearchPage();
  });
})();
