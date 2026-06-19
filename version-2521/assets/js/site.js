document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var navigation = document.querySelector(".main-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", function () {
      navigation.classList.toggle("open");
    });
  }

  var slides = Array.from(document.querySelectorAll(".hero-slide"));
  var dots = Array.from(document.querySelectorAll(".hero-dot"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-go")) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var filterInputs = Array.from(document.querySelectorAll(".page-filter"));

  function applyFilter(input) {
    var query = input.value.trim().toLowerCase();
    var cards = Array.from(document.querySelectorAll(".movie-card, .rank-card, .ranking-row"));

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.textContent
      ].join(" ").toLowerCase();

      card.classList.toggle("hidden-by-filter", query && haystack.indexOf(query) === -1);
    });
  }

  filterInputs.forEach(function (input) {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("q");

    if (preset && input.classList.contains("auto-query")) {
      input.value = preset;
    }

    input.addEventListener("input", function () {
      applyFilter(input);
    });

    if (input.value) {
      applyFilter(input);
    }
  });

  var player = document.getElementById("moviePlayer");
  var playLayer = document.querySelector(".play-layer");

  if (player && playLayer) {
    var videoUrl = player.getAttribute("data-video-url");
    var loaded = false;
    var hlsInstance = null;

    function loadVideo() {
      if (loaded || !videoUrl) {
        return Promise.resolve();
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          maxBufferLength: 90
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(player);
        return Promise.resolve();
      }

      if (player.canPlayType("application/vnd.apple.mpegurl")) {
        player.src = videoUrl;
        return Promise.resolve();
      }

      return Promise.reject(new Error("unsupported"));
    }

    function startVideo() {
      loadVideo().then(function () {
        return player.play();
      }).then(function () {
        playLayer.classList.add("hidden");
      }).catch(function () {
        playLayer.innerHTML = "<span>!</span>";
      });
    }

    playLayer.addEventListener("click", startVideo);
    player.addEventListener("play", function () {
      playLayer.classList.add("hidden");
    });
    player.addEventListener("pause", function () {
      if (!player.ended) {
        playLayer.classList.remove("hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
});
