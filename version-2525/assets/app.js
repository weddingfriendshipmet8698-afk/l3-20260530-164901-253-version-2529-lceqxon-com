(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function formatCount(value) {
    var number = Number(value) || 0;
    if (number >= 10000) {
      return (number / 10000).toFixed(1) + '万';
    }
    return String(number);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getRootPrefix() {
    var path = window.location.pathname;
    if (path.indexOf('/movie/') !== -1 || path.indexOf('/category/') !== -1 || path.indexOf('/archive/') !== -1) {
      return '../';
    }
    return './';
  }

  function initHeader() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var links = document.querySelector('[data-nav-links]');

    function onScroll() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('is-open');
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  function initPageFilter() {
    var inputs = document.querySelectorAll('.js-page-filter');
    inputs.forEach(function (input) {
      var container = input.closest('section');
      var cards = container ? Array.prototype.slice.call(container.querySelectorAll('.movie-card')) : [];
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          card.hidden = query && text.indexOf(query) === -1;
        });
      });
    });
  }

  function createMovieCard(movie) {
    var prefix = getRootPrefix();
    var detailUrl = prefix + movie.detailUrl;
    var coverUrl = prefix + movie.cover;
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card movie-card--compact">' +
      '  <a class="movie-card__media" href="' + escapeHtml(detailUrl) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
      '    <img src="' + escapeHtml(coverUrl) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '    <span class="movie-card__duration">' + escapeHtml(movie.duration) + '</span>' +
      '    <span class="movie-card__play" aria-hidden="true">▶</span>' +
      '  </a>' +
      '  <div class="movie-card__body">' +
      '    <div class="movie-card__meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '    <h3><a href="' + escapeHtml(detailUrl) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '    <p>' + escapeHtml(movie.oneLine || movie.summary || '') + '</p>' +
      '    <div class="movie-card__tags">' + tags + '</div>' +
      '    <div class="movie-card__stats"><span>👁 ' + formatCount(movie.views) + '</span><span>❤ ' + formatCount(movie.likes) + '</span><span>★ ' + escapeHtml(movie.rating) + '</span></div>' +
      '  </div>' +
      '</article>';
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page || !window.MOVIES) {
      return;
    }

    var input = page.querySelector('[data-search-input]');
    var typeFilter = page.querySelector('[data-type-filter]');
    var regionFilter = page.querySelector('[data-region-filter]');
    var genreFilter = page.querySelector('[data-genre-filter]');
    var results = page.querySelector('[data-search-results]');
    var summary = page.querySelector('[data-search-summary]');
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function filterMovies() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var type = typeFilter ? typeFilter.value : '';
      var region = regionFilter ? regionFilter.value : '';
      var genre = genreFilter ? genreFilter.value : '';

      var matched = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(','),
          (movie.genreTokens || []).join(',')
        ].join(' ').toLowerCase();

        var queryMatched = !query || haystack.indexOf(query) !== -1;
        var typeMatched = !type || movie.type === type;
        var regionMatched = !region || movie.region === region;
        var genreMatched = !genre || (movie.genre || '').indexOf(genre) !== -1 || (movie.genreTokens || []).indexOf(genre) !== -1;
        return queryMatched && typeMatched && regionMatched && genreMatched;
      });

      var visible = matched.slice(0, 120);
      results.innerHTML = visible.map(createMovieCard).join('');
      summary.textContent = '找到 ' + matched.length + ' 部，当前展示前 ' + visible.length + ' 部。';
    }

    [input, typeFilter, regionFilter, genreFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterMovies);
        control.addEventListener('change', filterMovies);
      }
    });

    filterMovies();
  }

  function initRankingTabs() {
    var root = document.querySelector('[data-ranking-tabs]');
    if (!root) {
      return;
    }

    var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-ranking-tab]'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-ranking-panel]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var target = button.getAttribute('data-ranking-tab');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-ranking-panel') === target);
        });
      });
    });
  }

  function initPlayer() {
    var playerCard = document.querySelector('[data-player]');
    var video = document.getElementById('movie-player');
    var startButton = document.querySelector('[data-player-start]');
    var message = document.querySelector('[data-player-message]');

    if (!playerCard || !video || !startButton) {
      return;
    }

    var source = playerCard.getAttribute('data-video-url');
    var hlsInstance = null;
    var initialized = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function initializeSource() {
      if (initialized) {
        return Promise.resolve();
      }

      if (!source) {
        setMessage('当前条目没有可用播放地址。');
        return Promise.reject(new Error('Missing video source'));
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setMessage('播放源加载失败，请刷新页面或稍后再试。');
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      video.src = source;
      setMessage('浏览器不支持 HLS 时会尝试使用原生视频播放。');
      return Promise.resolve();
    }

    function playVideo() {
      initializeSource()
        .then(function () {
          return video.play();
        })
        .then(function () {
          playerCard.classList.add('is-playing');
          setMessage('');
        })
        .catch(function () {
          setMessage('浏览器阻止了自动播放，请再次点击播放器或使用原生控件播放。');
        });
    }

    startButton.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      playerCard.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        playerCard.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initActions() {
    var like = document.querySelector('.js-like-button');
    var share = document.querySelector('.js-share-button');

    if (like) {
      like.addEventListener('click', function () {
        like.textContent = '已点赞';
        like.disabled = true;
      });
    }

    if (share) {
      share.addEventListener('click', function () {
        if (navigator.share) {
          navigator.share({
            title: document.title,
            url: window.location.href
          }).catch(function () {});
          return;
        }

        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(function () {
            share.textContent = '链接已复制';
          });
        }
      });
    }
  }

  ready(function () {
    initHeader();
    initHero();
    initPageFilter();
    initSearchPage();
    initRankingTabs();
    initPlayer();
    initActions();
  });
})();
