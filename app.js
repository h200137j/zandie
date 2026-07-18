/* a small museum of zandile — three small behaviours, nothing more */

document.documentElement.classList.add('js');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1. turning the photographs over ───────────────────────── */

const cards = document.querySelectorAll('.snap__card');

// One class, applied immediately. CSS does the rest. There is no timer and no
// 3D context involved, so there is nothing here that can fire late, get
// throttled, or fail to be composited on a particular phone.
function setFace(card, showBack) {
  card.setAttribute('aria-expanded', String(showBack));
  card.classList.toggle('is-back', showBack);
}

cards.forEach((card) => {
  card.addEventListener('click', () => {
    const open = card.getAttribute('aria-expanded') === 'true';

    // only one photo face-down at a time — it reads like a real desk
    if (!open) {
      cards.forEach((other) => {
        if (other !== card) setFace(other, false);
      });
    }

    setFace(card, !open);
  });
});

// esc puts them all back
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cards.forEach((card) => setFace(card, false));
  }
});

/* ── 2. the page arriving, a piece at a time ───────────────── */

const reveals = document.querySelectorAll(
  '.snap, .aside, .divider, .scrawl, .letter__paper, .cover__photo'
);

if ('IntersectionObserver' in window && !reduced) {
  reveals.forEach((el) => el.classList.add('reveal'));

  const seen = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        seen.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );

  reveals.forEach((el) => seen.observe(el));
}

/* ── 3. the tape deck ──────────────────────────────────────── */

const deck = document.querySelector('[data-tapedeck]');
const audio = document.querySelector('[data-audio]');
const play = document.querySelector('[data-play]');
const state = document.querySelector('[data-song-state]');

if (deck && audio && play && state) {
  // no song in the repo yet? then no button at all. never a broken control.
  deck.hidden = true;

  fetch(audio.getAttribute('src'), { method: 'HEAD' })
    .then((res) => {
      if (res.ok) deck.hidden = false;
    })
    .catch(() => {});

  audio.addEventListener('error', () => {
    deck.hidden = true;
  });

  play.addEventListener('click', async () => {
    if (audio.paused) {
      try {
        await audio.play();
        play.setAttribute('aria-pressed', 'true');
        state.textContent = 'playing';
      } catch {
        deck.hidden = true;
      }
    } else {
      audio.pause();
      play.setAttribute('aria-pressed', 'false');
      state.textContent = 'paused';
    }
  });

  audio.addEventListener('ended', () => {
    play.setAttribute('aria-pressed', 'false');
    state.textContent = 'press play';
  });
}
