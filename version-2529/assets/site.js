
(function () {
  function qs(root, sel) { return root.querySelector(sel); }
  function qsa(root, sel) { return Array.from(root.querySelectorAll(sel)); }

  function setupNav() {
    const btn = document.querySelector('[data-nav-toggle]');
    const nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function normalize(s) {
    return (s || '').toString().toLowerCase();
  }

  function applyFilters(root) {
    const input = qs(root, '[data-search-input]');
    const select = qs(root, '[data-filter-select]');
    const cards = qsa(root, '[data-search-target] [data-card]');
    const count = qs(root, '[data-search-count]');
    if (!cards.length) return;

    function update() {
      const term = normalize(input && input.value);
      const type = normalize(select && select.value);
      let visible = 0;
      cards.forEach(card => {
        const hay = normalize(card.dataset.searchText || card.textContent);
        const cardType = normalize(card.dataset.type);
        const okTerm = !term || hay.includes(term);
        const okType = !type || cardType.includes(type);
        const show = okTerm && okType;
        card.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });
      if (count) count.textContent = visible + ' / ' + cards.length + ' 条可见';
    }

    if (input) input.addEventListener('input', update);
    if (select) select.addEventListener('change', update);
    update();
  }

  function setupSearch() {
    document.querySelectorAll('[data-search-root]').forEach(applyFilters);
  }

  function setupHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;
    const slides = qsa(slider, '[data-hero-slide]');
    const dotsWrap = qs(slider, '[data-hero-dots]');
    const prev = qs(slider, '[data-hero-prev]');
    const next = qs(slider, '[data-hero-next]');
    if (!slides.length) return;

    let index = 0;
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hero-dot' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', '第 ' + (i + 1) + ' 张');
      b.addEventListener('click', () => set(i));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    function set(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('active', n === index));
      dots.forEach((d, n) => d.classList.toggle('active', n === index));
    }

    if (prev) prev.addEventListener('click', () => set(index - 1));
    if (next) next.addEventListener('click', () => set(index + 1));
    setInterval(() => set(index + 1), 5000);
  }

  setupNav();
  setupSearch();
  setupHeroSlider();
})();
