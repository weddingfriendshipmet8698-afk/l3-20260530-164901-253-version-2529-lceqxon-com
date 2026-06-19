(function () {
  var body = document.body;
  var menuButton = document.querySelector(".menu-toggle");

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      var opened = body.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle("active", itemIndex === heroIndex);
    });

    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle("active", itemIndex === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
      startHero();
    });
  });

  startHero();

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilter(panel) {
    var scope = panel.closest(".section-block") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var input = panel.querySelector(".filter-input");
    var category = panel.querySelector(".filter-category");
    var year = panel.querySelector(".filter-year");
    var empty = scope.querySelector(".empty-result");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && input && !input.value) {
      input.value = query;
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var selectedCategory = normalize(category && category.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-category"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okCategory = !selectedCategory || normalize(card.getAttribute("data-category")) === selectedCategory;
        var okYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
        var matched = okKeyword && okCategory && okYear;

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, category, year].forEach(function (field) {
      if (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      }
    });

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(setupFilter);

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var start = player.querySelector(".player-start");
    var message = player.querySelector(".player-message");
    var source = video ? video.getAttribute("data-video") : "";
    var attached = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function setMessage(text) {
      if (!message) {
        return;
      }

      message.textContent = text || "";
      player.classList.toggle("has-message", Boolean(text));
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("播放异常，请刷新后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        setMessage("视频暂时无法播放，请稍后再试");
      }
    }

    function playVideo() {
      attachSource();
      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          setMessage("点击视频区域继续播放");
        });
      }
    }

    if (start) {
      start.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
      setMessage("");
    });

    video.addEventListener("pause", function () {
      player.classList.remove("is-playing");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".js-player")).forEach(setupPlayer);
})();
