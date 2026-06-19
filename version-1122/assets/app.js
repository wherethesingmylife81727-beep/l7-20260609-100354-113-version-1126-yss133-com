(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");

  if (header && toggle) {
    toggle.addEventListener("click", function () {
      var opened = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-to") || 0));
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll("[data-filter]").forEach(function (panel) {
    var section = panel.closest(".content-section") || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
    var search = panel.querySelector(".js-search");
    var region = panel.querySelector(".js-filter-region");
    var type = panel.querySelector(".js-filter-type");
    var year = panel.querySelector(".js-filter-year");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && search) {
      search.value = query;
    }

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function apply() {
      var keyword = valueOf(search);
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }

        if (regionValue && (card.getAttribute("data-region") || "").toLowerCase() !== regionValue) {
          ok = false;
        }

        if (typeValue && (card.getAttribute("data-type") || "").toLowerCase() !== typeValue) {
          ok = false;
        }

        if (yearValue && (card.getAttribute("data-year") || "") !== yearValue) {
          ok = false;
        }

        card.classList.toggle("is-hidden", !ok);
      });
    }

    [search, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });

    apply();
  });

  document.querySelectorAll("video.movie-player").forEach(function (video) {
    var stream = video.getAttribute("data-stream");
    var box = video.closest(".player-box");
    var cover = box ? box.querySelector(".play-cover") : null;
    var prepared = false;
    var hlsInstance = null;

    function attach() {
      if (prepared || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      prepared = true;
    }

    function begin() {
      attach();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (cover && !video.ended) {
        cover.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  });
})();
