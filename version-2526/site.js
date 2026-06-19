(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initHeader() {
        var header = document.querySelector('[data-header]');
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-nav-links]');
        if (header) {
            var onScroll = function () {
                header.classList.toggle('is-scrolled', window.scrollY > 42);
            };
            onScroll();
            window.addEventListener('scroll', onScroll, { passive: true });
        }
        if (button && nav) {
            button.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
            nav.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', function () {
                    nav.classList.remove('is-open');
                });
            });
        }
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var previous = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var input = document.querySelector('[data-search-input]');
        var category = document.querySelector('[data-category-filter]');
        var type = document.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-empty-state]');
        if (!cards.length || (!input && !category && !type)) {
            return;
        }
        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }
        function apply() {
            var keyword = normalize(input ? input.value : '');
            var categoryValue = category ? category.value : '';
            var typeValue = type ? type.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
                var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
                var ok = matchKeyword && matchCategory && matchType;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }
        [input, category, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var message = player.querySelector('[data-player-message]');
            var src = player.getAttribute('data-src');
            var loaded = false;
            var hls = null;
            if (!video || !src) {
                return;
            }
            function showError() {
                if (message) {
                    message.textContent = '播放暂时不可用，请稍后重试。';
                    message.classList.add('is-visible');
                }
            }
            function attach() {
                if (loaded) {
                    return Promise.resolve();
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    return new Promise(function (resolve, reject) {
                        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hls.loadSource(src);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                reject(data);
                            }
                        });
                    });
                }
                video.src = src;
                return Promise.resolve();
            }
            function play() {
                if (button) {
                    button.classList.add('is-hidden');
                }
                attach().then(function () {
                    return video.play();
                }).catch(function () {
                    showError();
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    play();
                });
            }
            player.addEventListener('click', function (event) {
                if (event.target === player) {
                    play();
                }
            });
            video.addEventListener('click', function () {
                if (!loaded) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    ready(function () {
        initHeader();
        initHero();
        initFilters();
        initPlayers();
    });
})();
