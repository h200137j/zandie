/* a small museum of zandile — three small behaviours, nothing more */

document.documentElement.classList.add('js');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1. turning the photographs over ───────────────────────── */

// Each photo is two separate cards — the picture and the note — and exactly
// one of them is in the layout at a time. Swapping them is a single attribute
// change with nothing animated, composited or timed in the way of it.
const snaps = [...document.querySelectorAll('.snap')]
  .map((snap) => ({
    photo: snap.querySelector('.snap__card--photo'),
    note: snap.querySelector('.snap__card--note'),
  }))
  .filter((s) => s.photo && s.note);

function show(snap, note, moveFocus) {
  // measure the outgoing card first, so the incoming one takes up exactly the
  // same room and nothing below it moves. The photo card is a little taller
  // than the note — it carries a caption — so the ratio alone is not enough.
  if (note && !snap.photo.hidden) {
    snap.note.style.minHeight = snap.photo.getBoundingClientRect().height + 'px';
  }

  snap.photo.hidden = note;
  snap.note.hidden = !note;
  snap.photo.setAttribute('aria-expanded', String(note));

  // the button that was just pressed is now gone; hand focus to the one that
  // replaced it, or keyboard users are dropped back to the top of the document
  if (moveFocus) {
    (note ? snap.note : snap.photo).focus({ preventScroll: true });
  }
}

snaps.forEach((snap) => {
  // only one note out at a time — it reads like a real desk
  snap.photo.addEventListener('click', () => {
    snaps.forEach((other) => {
      if (other !== snap) show(other, false, false);
    });
    show(snap, true, true);
  });

  snap.note.addEventListener('click', () => show(snap, false, true));
});

// esc puts them all back
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = snaps.find((s) => !s.note.hidden);
  snaps.forEach((s) => show(s, false, false));
  if (open) open.photo.focus({ preventScroll: true });
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
