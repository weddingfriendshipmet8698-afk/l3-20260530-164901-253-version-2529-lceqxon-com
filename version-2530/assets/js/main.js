(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-empty');
      });
    });

    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;
    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === heroIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === heroIndex);
      });
    }
    if (slides.length) {
      showHero(0);
      var heroTimer = window.setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
      document.querySelectorAll('[data-hero-next]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          window.clearInterval(heroTimer);
          showHero(heroIndex + 1);
        });
      });
      document.querySelectorAll('[data-hero-prev]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          window.clearInterval(heroTimer);
          showHero(heroIndex - 1);
        });
      });
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          window.clearInterval(heroTimer);
          showHero(i);
        });
      });
    }

    var grid = document.querySelector('[data-movie-grid]');
    var search = document.querySelector('[data-search]');
    var region = document.querySelector('[data-region-filter]');
    var type = document.querySelector('[data-type-filter]');
    var sort = document.querySelector('[data-sort]');
    var empty = document.querySelector('[data-empty]');

    function filterCards() {
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.type].join(' ').toLowerCase();
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (regionValue && card.dataset.region !== regionValue) {
          ok = false;
        }
        if (typeValue && card.dataset.type !== typeValue) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    function sortCards() {
      if (!grid || !sort) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var mode = sort.value;
      cards.sort(function (a, b) {
        if (mode === 'year-asc') {
          return Number(a.dataset.year) - Number(b.dataset.year);
        }
        if (mode === 'title') {
          return a.dataset.title.localeCompare(b.dataset.title, 'zh-Hans-CN');
        }
        return Number(b.dataset.year) - Number(a.dataset.year);
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      filterCards();
    }

    [search, region, type].forEach(function (input) {
      if (input) {
        input.addEventListener('input', filterCards);
        input.addEventListener('change', filterCards);
      }
    });
    if (sort) {
      sort.addEventListener('change', sortCards);
    }
    filterCards();

    var video = document.querySelector('[data-player]');
    var overlay = document.querySelector('[data-player-overlay]');
    var start = document.querySelector('[data-player-start]');
    var status = document.querySelector('[data-player-status]');
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachVideo() {
      if (!video) {
        return Promise.resolve();
      }
      var src = video.dataset.src || '';
      if (!src) {
        setStatus('播放源准备中');
        return Promise.resolve();
      }
      if (video.dataset.attached === '1') {
        return Promise.resolve();
      }
      video.dataset.attached = '1';
      setStatus('正在加载播放源');
      return new Promise(function (resolve) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪');
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            setStatus('正在尝试继续播放');
            resolve();
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源已就绪');
            resolve();
          }, { once: true });
          window.setTimeout(resolve, 600);
        } else {
          video.src = src;
          setStatus('浏览器正在加载视频');
          window.setTimeout(resolve, 600);
        }
      });
    }

    function playVideo() {
      if (!video) {
        return;
      }
      attachVideo().then(function () {
        var p = video.play();
        if (p && typeof p.then === 'function') {
          p.then(function () {
            if (overlay) {
              overlay.classList.add('is-hidden');
            }
            setStatus('正在播放');
          }).catch(function () {
            setStatus('点击播放按钮开始播放');
          });
        }
      });
    }

    if (start) {
      start.addEventListener('click', playVideo);
    }
    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('pause', function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
        setStatus('已暂停');
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }
  });
})();
