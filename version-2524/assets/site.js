(function () {
  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var links = document.querySelector('.nav-links');
    if (!button || !links) {
      return;
    }
    button.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('.movie-list'));
    if (!lists.length) {
      return;
    }
    var search = document.querySelector('.movie-search');
    var year = document.querySelector('.year-filter');
    var genre = document.querySelector('.genre-filter');
    var sort = document.querySelector('.sort-filter');

    function text(item) {
      return [
        item.getAttribute('data-title') || '',
        item.getAttribute('data-genre') || '',
        item.getAttribute('data-tags') || '',
        item.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
    }

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedGenre = genre ? genre.value : '';
      lists.forEach(function (list) {
        var items = Array.prototype.slice.call(list.querySelectorAll('.movie-item'));
        items.forEach(function (item) {
          var okQuery = !query || text(item).indexOf(query) !== -1;
          var okYear = !selectedYear || item.getAttribute('data-year') === selectedYear;
          var okGenre = !selectedGenre || (item.getAttribute('data-genre') || '').indexOf(selectedGenre) !== -1;
          item.classList.toggle('is-hidden', !(okQuery && okYear && okGenre));
        });
        if (sort) {
          var mode = sort.value;
          items.sort(function (a, b) {
            if (mode === 'year-asc') {
              return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
            }
            if (mode === 'title-asc') {
              return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
            }
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }).forEach(function (item) {
            list.appendChild(item);
          });
        }
      });
    }

    [search, year, genre, sort].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-video-src');
    if (!video || !source) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsPlayer) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsPlayer = hls;
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = source;
      }
    } else if (!video.src) {
      video.src = source;
    }
    shell.classList.add('is-playing');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
      var overlay = shell.querySelector('.player-overlay');
      var video = shell.querySelector('video');
      if (overlay) {
        overlay.addEventListener('click', function () {
          startPlayer(shell);
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!shell.classList.contains('is-playing')) {
            startPlayer(shell);
          }
        });
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
