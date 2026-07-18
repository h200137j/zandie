# a small museum of zandile

A one-page scrapbook site. Static HTML, CSS and JS — no build step, no dependencies.

```
index.html          the whole page, including every caption and note
styles.css          all styling
app.js              three behaviours: flip a photo, reveal on scroll, play the song
assets/photos/      web-sized photos (1600px long edge)
assets/thumbs/      600px versions, currently unused — kept for future use
assets/song.mp3     Limit Nala — Ama Buffalo (96kbps, 3.4MB)
originals/          the untouched files you gave me
```

## Publishing it

```bash
git init
git add .
git commit -m "a small museum of zandile"
git branch -M main
git remote add origin git@github.com:<your-username>/zandie.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
It goes live at `https://<your-username>.github.io/zandie/` within a minute or two.

To keep it private until you're ready to send it, make the repo private first — Pages
on a private repo needs a paid plan, so the simpler route is to keep the repo local
until the day you want her to see it, then push.

## Changing the words

Every caption and every hidden note lives in `index.html` as plain text. Search for the
line you want and type over it. The structure of one photo:

```html
<span class="snap__cap">shown under the photo</span>
...
<span class="snap__note">written on the back, revealed on tap</span>
```

The long letter near the bottom is in `<section class="letter">`. The signature is the
last line of it.

**The notes I wrote are placeholders in your voice.** They describe what is actually in
each photo, but they don't know your history — replace them with the real thing where
you can. The ones worth rewriting first: the note on the hoodie photo, the Roosters
captions, and the letter.

## Swapping the song

Replace `assets/song.mp3` and update the title in `index.html`. Re-encode anything
large first — `ffmpeg -i new-song.mp3 -c:a libmp3lame -b:a 96k assets/song.mp3` — since
the file is only fetched when someone taps play, and that tap is often on mobile data:

```html
<span class="tapedeck__title" data-song-title>ama buffalo</span>
```

If the file is missing the play button hides itself, so the page never shows a dead control.

## Adding a photo

1. Size it: `magick your-photo.jpg -auto-orient -resize "1600x1600>" -quality 82 -strip assets/photos/p12.jpg`
2. Copy any `<figure class="snap">` block in `index.html`, point it at the new file, and
   update `width`/`height` to the new dimensions.
3. Change `--tilt` in the `style` attribute so it doesn't sit at the same angle as its neighbour.

Portrait photos should be 3:4. Anything landscape gets `class="snap snap--wide"` (3:2).

## Notes on how it's built

- Mobile-first: one column with the photos taped down the page, two columns at 46rem,
  three at 68rem. No horizontal overflow at any width from 320px up.
- The palette is taken from the photographs — the lilac door frame in the mirror selfie,
  the marigold hedge, the green on the t-shirt, the red of the Coca-Cola bottle in the
  1st-birthday photo.
- Each photo is two separate cards — the picture and the note — and exactly one is in
  the layout at a time. There is no 3D flip, no timer and no animation deciding which
  one you can see; the hidden card is simply not rendered. Earlier versions used a
  `rotateY` flip, which failed on phones: mobile browsers flatten the 3D context, and
  once flat the reverse face is never presented.
- Both cards are `<button>` elements, so they swap with Enter or Space and show a focus
  ring. Focus follows the swap. Escape puts every note away.
- `prefers-reduced-motion` disables the scroll reveals, the flip animation and the
  spinning reel.
- `img { height: auto }` in `styles.css` is load-bearing. Without it the `width`/`height`
  attributes beat `aspect-ratio` and every photo renders at full intrinsic height.
