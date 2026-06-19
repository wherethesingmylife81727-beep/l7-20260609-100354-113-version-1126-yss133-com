(function() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobile = document.querySelector("[data-mobile-nav]");
  if (toggle && mobile) {
    toggle.addEventListener("click", function() {
      mobile.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
      });
    });

    show(0);
    window.setInterval(function() {
      show(current + 1);
    }, 5000);
  }

  var searchInput = document.querySelector("[data-search-input]");
  var yearSelect = document.querySelector("[data-year-filter]");
  var categorySelect = document.querySelector("[data-category-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "";
    var category = categorySelect ? categorySelect.value : "";

    cards.forEach(function(card) {
      var title = card.getAttribute("data-title") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var cardCategory = card.getAttribute("data-category") || "";
      var matched = true;

      if (query && title.indexOf(query) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      card.classList.toggle("hidden-card", !matched);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", applyFilters);
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", applyFilters);
  }
})();
