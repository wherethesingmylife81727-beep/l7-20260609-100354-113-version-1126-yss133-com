(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
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

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          start();
        });
      });

      show(0);
      start();
    }

    var searchForm = document.querySelector('[data-site-search-form]');

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = searchForm.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var url = './search.html';

        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }

        window.location.href = url;
      });
    }

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
      var queryInput = searchPage.querySelector('[data-search-input]');
      var categorySelect = searchPage.querySelector('[data-search-category]');
      var typeSelect = searchPage.querySelector('[data-search-type]');
      var yearSelect = searchPage.querySelector('[data-search-year]');
      var cards = Array.prototype.slice.call(searchPage.querySelectorAll('[data-movie-card]'));
      var empty = searchPage.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';

      if (queryInput && initialQuery) {
        queryInput.value = initialQuery;
      }

      function includesText(source, query) {
        return source.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      }

      function filterCards() {
        var query = queryInput ? queryInput.value.trim() : '';
        var category = categorySelect ? categorySelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var title = card.getAttribute('data-title') || '';
          var cardCategory = card.getAttribute('data-category') || '';
          var cardType = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var textMatched = !query || includesText(title + ' ' + card.textContent, query);
          var categoryMatched = !category || cardCategory === category;
          var typeMatched = !type || cardType === type;
          var yearMatched = !year || cardYear === year;
          var matched = textMatched && categoryMatched && typeMatched && yearMatched;

          card.hidden = !matched;

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [queryInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', filterCards);
          control.addEventListener('change', filterCards);
        }
      });

      filterCards();
    }
  });
})();
