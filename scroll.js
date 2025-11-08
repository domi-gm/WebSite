document.addEventListener('scroll', () => {
  const wrapper = document.querySelector('.hero-wrapper');
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero-img');
  const heroContent = document.querySelector('.hero-content');
  // inner element that handles vertical animation so horizontal centering isn't overwritten
  const heroInner = document.querySelector('.greeting-inner');
  const lines = document.querySelectorAll('.line');
  const dataGrid = document.querySelector('.data-grid-container');

  if (!wrapper) return;

  const wrapperRect = wrapper.getBoundingClientRect();
  const total = wrapper.offsetHeight - window.innerHeight;

  // progress = scroll position through the hero animation (0 to 1)
  const progress = Math.min(1, Math.max(0, -wrapperRect.top / total));

  // Image shrink (slightly eased feel)
  // start from a slightly smaller base scale so the hero doesn't feel blown-up on load
  // match the CSS starting scale for a consistent feel
  const BASE_SCALE = 0.75;
  // small easing to slow down the visible change near the start
  const easeOut = (t) => 1 - Math.pow(1 - t, 1.3);
  const eased = easeOut(progress);
  if (heroImg) {
    const scale = Math.max(0.3, BASE_SCALE - eased * 0.4);
    heroImg.style.transform = `scale(${scale}) translateY(${eased * -8}vh)`;
  }

  // Fade + lift text
  // keep greeting visible until near the end of the hero animation
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const TEXT_FADE_START = 0.75; // fraction of progress when text starts to fade
  const textLocal = clamp((progress - TEXT_FADE_START) / (1 - TEXT_FADE_START));
  if (heroInner) {
    // animate the inner wrapper vertically while keeping the outer centered
    heroInner.style.opacity = `${1 - textLocal}`;
    heroInner.style.transform = `translateY(${(textLocal * -32).toFixed(2)}px)`;
  } else if (heroContent) {
    // fallback for older structure: apply transform on heroContent
    heroContent.style.opacity = `${1 - textLocal}`;
    heroContent.style.transform = `translateY(${(textLocal * -32).toFixed(2)}px)`;
  }

  // Lines fade in sequentially
  lines.forEach((line, i) => {
    const reveal = (progress - i * 0.15) * 3;
    line.style.opacity = Math.max(0, Math.min(reveal, 1));
    line.style.transform = `translateX(${(1 - Math.min(reveal, 1)) * -20}px)`;
  });

  // Drive the data grid container's entrance from scroll (gradual slide + fade)
  if (dataGrid) {
    const dgRect = dataGrid.getBoundingClientRect();

    // gridProgress: 0 when grid top is well below viewport, 1 when it's fully in view
    // larger denominator stretches the reveal across more scroll distance
    const gridProgress = clamp((window.innerHeight - dgRect.top) / (window.innerHeight * 1.4));

    // easing for container (gentle ease-out)
    const easeContainer = t => 1 - Math.pow(1 - t, 2.2);
    const easedGrid = easeContainer(gridProgress);

    // If the container is not in 'play' mode, scrub its visible state directly
    if (!dataGrid.classList.contains('play')) {
      dataGrid.style.opacity = `${easedGrid}`;
      dataGrid.style.transform = `translateY(${(1 - easedGrid) * 48}px)`;
      dataGrid.style.pointerEvents = easedGrid > 0.05 ? 'auto' : 'none';

      // Scrub per-card opacity/translate so they remain subtle while the container is entering
      const dataProgress = clamp((window.innerHeight - dgRect.top) / (window.innerHeight * 1.05));
      const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const cards = dataGrid.querySelectorAll('.data-card');
      cards.forEach((card, i) => {
        const stagger = i * 0.06; // subtle stagger
        const local = clamp((dataProgress - stagger) / 0.9);
        const easedLocal = easeInOutCubic(local);
        card.style.opacity = `${easedLocal * easedGrid}`;
        card.style.transform = `translateY(${(1 - easedLocal) * 20 + (1 - easedGrid) * 8}px)`;
      });
    }

    // Play-mode trigger: when the grid reaches a small progress threshold, start the "play" animation
    const PLAY_THRESHOLD = 0.14; // when gridProgress crosses this going down we trigger play
    const isPlaying = dataGrid.classList.contains('play');
    if (gridProgress >= PLAY_THRESHOLD && !isPlaying) {
      // clear inline styles so CSS animation runs cleanly
      dataGrid.style.opacity = '';
      dataGrid.style.transform = '';
      dataGrid.style.pointerEvents = 'auto';
      dataGrid.classList.add('play');
      // set per-card staggered animation delays via inline style for predictable timing
      const cards = dataGrid.querySelectorAll('.data-card');
      cards.forEach((card, i) => {
        const delay = (i * 0.06).toFixed(2) + 's';
        card.style.animationDelay = delay;
        // ensure animation name/duration/timing are present (CSS provides defaults)
        card.style.animationName = 'cardSlideIn';
        card.style.animationDuration = '0.9s';
        card.style.animationTimingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)';
        card.style.animationFillMode = 'both';
      });
    }

    // If the gridProgress drops below the play threshold (user scrolled back up), remove play
    // so the animation can be triggered again on a subsequent scroll down.
    else if (gridProgress < PLAY_THRESHOLD && isPlaying) {
      // remove play so it can replay when the user scrolls back down again
      dataGrid.classList.remove('play');
      const cards = dataGrid.querySelectorAll('.data-card');
      cards.forEach(card => {
        card.style.animationDelay = '';
        card.style.animationName = '';
        card.style.animationDuration = '';
        card.style.animationTimingFunction = '';
        card.style.animationFillMode = '';
        // reset inline visibility/transform so scrubbing restarts from the top
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        // also remove visible class so CSS .visible doesn't keep it shown
        card.classList.remove('visible');
      });
      // reset container so the scrub path will bring it back in
      dataGrid.style.opacity = '0';
      dataGrid.style.transform = 'translateY(16px)';
    }
  }
});

// Setup IntersectionObserver once to toggle data card visibility as they enter/leave viewport
(() => {
  const cards = document.querySelectorAll('.data-card');
  if (!cards || cards.length === 0) return;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Ignore cards inside the main data grid; that grid is controlled by scroll.js (scrub/play)
        if (entry.target.closest && entry.target.closest('.data-grid-container')) return;

        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          // remove visibility so cards fade out when scrolling back up/out
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.15 });
    cards.forEach(c => obs.observe(c));
  } else {
    // If no IntersectionObserver, default to visible when container is visible
    cards.forEach(c => c.classList.add('visible'));
  }
})();
