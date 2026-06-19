(function () {
  var site = {};

  function normalise(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function setSelectValue(select, value) {
    if (!select || !value) {
      return;
    }
    Array.prototype.forEach.call(select.options, function (option) {
      if (option.value === value) {
        select.value = value;
      }
    });
  }

  function filterCards(scope) {
    var root = scope || document;
    var input = root.querySelector('[data-filter-input]');
    var genre = root.querySelector('[data-filter-genre]');
    var region = root.querySelector('[data-filter-region]');
    var type = root.querySelector('[data-filter-type]');
    var year = root.querySelector('[data-filter-year]');
    var cards = root.querySelectorAll('[data-search]');
    var empty = root.querySelector('[data-no-results]');
    var query = normalise(input ? input.value : '');
    var genreValue = normalise(genre ? genre.value : '');
    var regionValue = normalise(region ? region.value : '');
    var typeValue = normalise(type ? type.value : '');
    var yearValue = normalise(year ? year.value : '');
    var visible = 0;

    Array.prototype.forEach.call(cards, function (card) {
      var text = normalise(card.getAttribute('data-search'));
      var cardGenre = normalise(card.getAttribute('data-genre'));
      var cardRegion = normalise(card.getAttribute('data-region'));
      var cardType = normalise(card.getAttribute('data-type'));
      var cardYear = normalise(card.getAttribute('data-year'));
      var show = true;

      if (query && text.indexOf(query) === -1) {
        show = false;
      }
      if (genreValue && cardGenre.indexOf(genreValue) === -1) {
        show = false;
      }
      if (regionValue && cardRegion !== regionValue) {
        show = false;
      }
      if (typeValue && cardType !== typeValue) {
        show = false;
      }
      if (yearValue && cardYear !== yearValue) {
        show = false;
      }

      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  function initFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');
    Array.prototype.forEach.call(panels, function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var genre = panel.querySelector('[data-filter-genre]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var q = getQuery('q');
      var genreQuery = getQuery('genre');
      var regionQuery = getQuery('region');
      var typeQuery = getQuery('type');
      var yearQuery = getQuery('year');

      if (input && q) {
        input.value = q;
      }
      setSelectValue(genre, genreQuery);
      setSelectValue(region, regionQuery);
      setSelectValue(type, typeQuery);
      setSelectValue(year, yearQuery);

      [input, genre, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', function () {
            filterCards(panel);
          });
          control.addEventListener('change', function () {
            filterCards(panel);
          });
        }
      });

      filterCards(panel);
    });
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = hero.querySelectorAll('[data-hero-slide]');
    var dots = hero.querySelectorAll('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var index = 0;

    function activate(next) {
      index = next;
      Array.prototype.forEach.call(slides, function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      Array.prototype.forEach.call(dots, function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    Array.prototype.forEach.call(dots, function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });

    window.setInterval(function () {
      activate((index + 1) % slides.length);
    }, 5200);
  }

  site.attachPlayer = function (sourceUrl, videoId, buttonId, overlayId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var started = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
      return;
    }

    function bindSource() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      bindSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', play);
      overlay.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          play();
        }
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  window.StaticMovieSite = site;

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
