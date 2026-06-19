(function() {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (navToggle && mobilePanel) {
    navToggle.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-header-search]").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var target = "./search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(index + 1);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    window.setInterval(function() {
      showSlide(index + 1);
    }, 5600);
  }

  var filterArea = document.querySelector("[data-filter-area]");
  if (filterArea) {
    var input = filterArea.querySelector("[data-filter-input]");
    var yearSelect = filterArea.querySelector("[data-year-filter]");
    var typeSelect = filterArea.querySelector("[data-type-filter]");
    var categorySelect = filterArea.querySelector("[data-category-filter]");
    var resetButton = filterArea.querySelector("[data-filter-reset]");
    var countNode = filterArea.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var category = normalize(categorySelect ? categorySelect.value : "");
      var visible = 0;

      cards.forEach(function(card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }
    }

    [input, yearSelect, typeSelect, categorySelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", function() {
        if (input) {
          input.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        if (typeSelect) {
          typeSelect.value = "";
        }
        if (categorySelect) {
          categorySelect.value = "";
        }
        applyFilter();
      });
    }

    applyFilter();
  }
}());
