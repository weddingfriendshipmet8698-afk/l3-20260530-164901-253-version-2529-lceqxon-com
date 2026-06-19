(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        var isOpen = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!isOpen));
        mobileMenu.hidden = isOpen;
      });
    }

    setupHero();
    setupFilters();
  });

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-card-grid]');
    if (!panel || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    var keywordInput = panel.querySelector('[data-filter="keyword"]');
    var yearSelect = panel.querySelector('[data-filter="year"]');
    var typeSelect = panel.querySelector('[data-filter="type"]');
    var categorySelect = panel.querySelector('[data-filter="category"]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && keywordInput) {
      keywordInput.value = q;
    }

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = valueOf(keywordInput);
      var year = valueOf(yearSelect);
      var type = valueOf(typeSelect);
      var category = valueOf(categorySelect);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || (card.dataset.year || '').toLowerCase() === year;
        var matchType = !type || (card.dataset.type || '').toLowerCase() === type;
        var matchCategory = !category || (card.dataset.category || '').toLowerCase() === category;
        var matched = matchKeyword && matchYear && matchType && matchCategory;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }
})();

function initMoviePlayer(source, videoId, buttonId, shellId) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var shell = document.getElementById(shellId);
  var hls = null;
  var attached = false;

  if (!video || !button || !shell) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }
    video.src = source;
  }

  function startPlayback() {
    attachSource();
    shell.classList.add('is-playing');
    video.controls = true;
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  }

  button.addEventListener('click', function (event) {
    event.preventDefault();
    startPlayback();
  });

  shell.addEventListener('click', function (event) {
    if (event.target === video && !video.paused) {
      return;
    }
    if (event.target === button || button.contains(event.target) || video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      shell.classList.remove('is-playing');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
