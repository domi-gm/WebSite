document.addEventListener('scroll', () => {
  const wrapper = document.querySelector('.hero-wrapper');
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero-img');
  const heroContent = document.querySelector('.hero-content');
  const lines = document.querySelectorAll('.line');
  const dataGrid = document.querySelector('.data-grid-container');

  if (!wrapper) return;

  const wrapperRect = wrapper.getBoundingClientRect();
  const total = wrapper.offsetHeight - window.innerHeight;

  // progress = scroll position through the hero animation (0 to 1)
  const progress = Math.min(1, Math.max(0, -wrapperRect.top / total));

  // Image shrink (slightly eased feel)
  // start from a slightly smaller base scale so the hero doesn't feel blown-up on load
  const BASE_SCALE = 0.97;
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
  if (heroContent) {
    heroContent.style.opacity = `${1 - textLocal}`;
    heroContent.style.transform = `translateY(${textLocal * -40}px)`;
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
        card.style.transform = `translateY(${(1 - easedLocal) * 24 + (1 - easedGrid) * 8}px)`;
      });
    }

    // Play-mode trigger: when the grid reaches a small progress threshold, start the "play" animation
    const PLAY_THRESHOLD = 0.12; // tune this value (0.12 works well for a visible trigger)
    const RESET_THRESHOLD = 0.02; // below this we remove the play class so it can replay
    const isPlaying = dataGrid.classList.contains('play');
    if (gridProgress >= PLAY_THRESHOLD && !isPlaying) {
      // clear inline styles so CSS animation runs cleanly
      dataGrid.style.opacity = '';
      dataGrid.style.transform = '';
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
    } else if (gridProgress <= RESET_THRESHOLD && isPlaying) {
      // remove play so it can replay when the user scrolls back down again
      dataGrid.classList.remove('play');
      const cards = dataGrid.querySelectorAll('.data-card');
      cards.forEach(card => {
        card.style.animationDelay = '';
        card.style.animationName = '';
        card.style.animationDuration = '';
        card.style.animationTimingFunction = '';
        card.style.animationFillMode = '';
      });
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
