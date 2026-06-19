(function () {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    const navSearch = document.querySelector(".nav-search");

    if (navToggle && navLinks && navSearch) {
        navToggle.addEventListener("click", function () {
            const expanded = navToggle.getAttribute("aria-expanded") === "true";
            navToggle.setAttribute("aria-expanded", String(!expanded));
            navLinks.classList.toggle("is-open");
            navSearch.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));

    if (slides.length > 1) {
        let activeIndex = 0;

        const showSlide = function (nextIndex) {
            activeIndex = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("is-active", index === activeIndex);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle("is-active", index === activeIndex);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    const filterInput = document.querySelector("[data-filter-input]");
    const yearSelect = document.querySelector("[data-filter-year]");
    const regionSelect = document.querySelector("[data-filter-region]");
    const filterCards = Array.from(document.querySelectorAll("[data-search]"));
    const emptyBox = document.querySelector(".filter-empty");

    const normalize = function (value) {
        return String(value || "").trim().toLowerCase();
    };

    const applyFilters = function () {
        if (!filterCards.length) {
            return;
        }

        const query = normalize(filterInput ? filterInput.value : "");
        const year = yearSelect ? yearSelect.value : "";
        const region = regionSelect ? regionSelect.value : "";
        let visible = 0;

        filterCards.forEach(function (card) {
            const text = normalize(card.getAttribute("data-search"));
            const cardYear = card.getAttribute("data-year") || "";
            const cardRegion = card.getAttribute("data-region") || "";
            const matchesQuery = !query || text.indexOf(query) !== -1;
            const matchesYear = !year || cardYear === year;
            const matchesRegion = !region || cardRegion === region;
            const shouldShow = matchesQuery && matchesYear && matchesRegion;
            card.classList.toggle("hidden-by-filter", !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyBox) {
            emptyBox.classList.toggle("is-visible", visible === 0);
        }
    };

    if (filterInput) {
        filterInput.addEventListener("input", applyFilters);
    }

    if (yearSelect) {
        yearSelect.addEventListener("change", applyFilters);
    }

    if (regionSelect) {
        regionSelect.addEventListener("change", applyFilters);
    }

    const searchPageInput = document.querySelector("[data-search-page-input]");

    if (searchPageInput) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q") || "";
        searchPageInput.value = query;
        if (filterInput) {
            filterInput.value = query;
        }
        applyFilters();
    } else {
        applyFilters();
    }
})();
