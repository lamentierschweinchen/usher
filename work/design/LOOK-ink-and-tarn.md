# Look: A Sojourn of Some Weeks

*Art director, 2026-10-26. Units: viewBox 960×640.*

Ink on paper, staged as a toy theatre: Beardsley's bare paper and flat black bands, Gorey's blank-faced figures, silent-film intertitles. Above the waterline, ink on paper; below, a solid ink tarn where the house returns as pale line, a negative [u02]. **Red always means what really happened.** The black rises: clouds sink each chapter until, at the Trist, sky and tarn are one black.

## 1. The map

House in the middle, tarn the lower 40%, the right third of sky bare.

```svg
<!-- skeleton, viewBox 0 0 960 640 -->
<rect x="8"  y="8"  width="944" height="624" class="ln" style="stroke-width:1.5"/>   <!-- frame: double rule -->
<rect x="14" y="14" width="932" height="612" class="ln" style="stroke-width:.6"/>
<!-- sky 14–368: paper. Cloud band: fill #hatch-h, ragged lower edge at y 90, sinking 8 per chapter to 130 [u35] -->
<path class="mass" d="M280 176L300 118 320 176ZM640 176L660 118 680 176Z"/>  <!-- turret cones; shafts 280–320, 640–680 down to 340 -->
<path class="mass" d="M320 176L480 126 640 176Z"/>                           <!-- roof: solid ink gable -->
<rect class="wall" x="300" y="176" width="360" height="44"/>  <!-- gallery: portraits in pairs, one face painted out -->
<rect class="wall" x="300" y="220" width="140" height="60"/>  <!-- guest bedroom: bed, draperies -->
<rect class="wall" x="300" y="280" width="140" height="60"/>  <!-- hall: Gothic arch in the left wall, onto the causeway -->
<rect class="wall" x="440" y="220" width="80"  height="120"/> <!-- stair: two zigzag flights -->
<rect class="wall" x="520" y="220" width="140" height="120"/> <!-- studio: two storeys, three lancets at y 228–262, black draperies [u08] -->
<rect class="mass" x="280" y="340" width="400" height="28"/>  <!-- plinth: solid ink band -->
<rect class="wall" x="330" y="346" width="80"  height="18"/>  <!-- vault: paper slot in the plinth, under bedroom and hall [u29] -->
<!-- bank 16–130 × 330–368: ink mound, three white trunks, sedges [u02] · causeway 130–300 × 360–368: paper strip, plank ticks -->
<!-- tarn 14–946 × 368–624: solid ink · reflection 368–580 (section 2) · dialogue band 40–920 × 572–620 -->
```

Until the door opens, a closed façade (paper, black eye-like lancets) hides the cutaway; then it's flown out like a toy-theatre flat (`translateY(-560px)`, 1.4s). Labels on hover only.

## 2. The reflection

House and figures are drawn once in `<defs>`, used twice: upright in ink, flipped in paper, rippling and fading with depth.

**Truths don't ripple.** The truth layer shares the flip but skips filter and fade: sharp, in `--tarn-red` (4:1 on ink) or as a solid paper window. Draw them in house coordinates. They appear during a mini-game, unannounced. The water's fissure is whole from the start; above water, a hairline grows a segment per chapter.

```css
.stage{position:relative;container-type:inline-size;--u:calc(100cqw/960);
  --tarn-red:color-mix(in srgb,var(--red),var(--paper) 35%)}
.above{color:var(--ink);--ground:var(--paper)}
.below{color:var(--paper);--ground:transparent}
.ln{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}  /* contour */
.ln.fine{stroke-width:1.1}                                                                       /* detail */
.mass{fill:currentColor}
.wall{fill:var(--ground);stroke:currentColor;stroke-width:2}
.truth{fill:none;stroke:var(--tarn-red);stroke-width:2.4}
.truth .solid{fill:var(--paper)}
.truth>*{opacity:0;transition:opacity 2s}
.truth>.shown{opacity:1}
/* presentation attributes can't take var(): colour through classes or style="" */
```

```svg
<defs>
  <g id="house"><!-- classes .ln .fine .mass .wall only; no colours --></g>
  <g id="cast"><!-- figures, moved by transform; both uses follow live --></g>
  <filter id="ripple" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="turbulence" baseFrequency="0.006 0.09" numOctaves="2" seed="7" result="n">
      <animate attributeName="baseFrequency" dur="14s" repeatCount="indefinite"
               values="0.006 0.09;0.006 0.115;0.006 0.09"/>
    </feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".62"/>
    <stop offset="1" stop-color="#fff" stop-opacity=".12"/>
  </linearGradient>
  <mask id="depth" maskUnits="userSpaceOnUse" x="0" y="368" width="960" height="272">
    <rect x="0" y="368" width="960" height="256" fill="url(#deep)"/>
  </mask>
</defs>

<rect x="14" y="368" width="932" height="256" style="fill:var(--ink)"/>   <!-- the tarn -->
<use href="#house" class="above"/><use href="#cast" class="above"/>
<g class="below">
  <g mask="url(#depth)">
    <g transform="matrix(1 0 0 -.85 0 680.8)" filter="url(#ripple)">   <!-- y' = 368 − .85(y − 368) -->
      <use href="#house"/><use href="#cast"/>
    </g>
  </g>
  <g class="truth" transform="matrix(1 0 0 -.85 0 680.8)">
    <path class="shown" d="M486 130l-10 34 14 30-12 40 12 46-10 50 8 38"/>  <!-- fissure, roof to waterline -->
    <!-- <rect class="solid" …/> a lit window · <g>…Madeline on the stair…</g> · <path>…the lid ajar…</path> -->
  </g>
</g>
<!-- pause the ripple during mini-games and under reduced motion: mapSvg.pauseAnimations() -->
```

## 3. Line and texture

Contour 2, detail 1.1, hatching 0.8. Masses: flat ink, no gradients. Diagonal hatching in room corners only ("the remoter angles" [u08]); broken horizontal hatching for cloud. Grain: static noise.

```svg
<pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <line x1="0" y1="0" x2="0" y2="5" style="stroke:var(--ink);stroke-width:.8"/>
</pattern>
<pattern id="hatch-h" width="9" height="4" patternUnits="userSpaceOnUse">
  <path d="M0 2h6.5" style="stroke:var(--ink);stroke-width:.7;stroke-linecap:round"/>
</pattern>
<!-- cross-hatch (vault, deep shadow): one rect filled #hatch, the same rect again filled #hatch-h -->
<filter id="cutout" x="-10%" y="-10%" width="125%" height="125%">   <!-- toy-theatre depth for figures and game pieces -->
  <feOffset in="SourceAlpha" dx="2" dy="3" result="o"/>
  <feFlood flood-color="#cbc3b8"/><feComposite in2="o" operator="in" result="s"/>
  <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
```
```css
.stage::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.08;mix-blend-mode:multiply;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23g)'/%3E%3C/svg%3E")}
```

## 4. Type

IM Fell English, regular and italic only. Silent film: every sound is printed, never played.

```css
/* sizes in viewBox units; HTML overlays use calc(var(--u)*N) with the floors shown */
.t-title      {font-size:calc(var(--u)*64)}                             /* title cartouche */
.t-intertitle {font-size:calc(var(--u)*44);color:var(--paper)}          /* chapter card: paper on ink, double paper rule */
.t-chapter    {font-size:calc(var(--u)*14);text-transform:uppercase;letter-spacing:.14em}  /* CHAPTER THE SECOND */
.t-line       {font-size:max(16px,calc(var(--u)*22));color:var(--paper)} /* dialogue band in the tarn; under 600px wide it docks below the stage */
.t-line i     {font-style:italic}                                         /* stage lines */
.t-speaker    {font-size:max(11px,calc(var(--u)*13));text-transform:uppercase;letter-spacing:.14em;color:var(--rule)}
.t-label      {font-size:max(10px,calc(var(--u)*13));text-transform:uppercase;letter-spacing:.14em;color:var(--muted)} /* rooms, scores */
.t-sound      {font-style:italic}
/* sound-words are type in the drawing: lowercase with a full stop ("tap.") at 18, up to 64 caps for the
   loudest ("CLANGOUR."); placed where the sound is, tilted ≤4°; ink above water, --tarn-red in it */
```

## 5. Figures

Gorey silhouettes on toy-theatre sticks: ink bodies, blank paper faces, 40 tall, `#cutout` shadow. They slide with a 1.5 bob; no walk cycles. Valet: thin, forever on tiptoe. Physician: squat, bag, one sideways eye-dot. Roderick: tall, black gown, a floating cloud of hairline hair [u09]. Madeline: the only white figure, hairline edge, long train; faint above, the brightest thing in the tarn.

```svg
<g id="guest">   <!-- long coat, top hat, trailing scarf -->
  <path class="mass" d="M-4-26C-6-17-10-7-11 0H11C10-7 6-17 4-26Z"/>
  <path class="ln fine" d="M3-25C9-24 13-19 15-15"/>
  <ellipse cx="0" cy="-29.5" rx="3.6" ry="4.3" style="fill:var(--ground);stroke:currentColor;stroke-width:1.1"/>
  <path class="mass" d="M-3.2-33V-40H3.2V-33Z"/><path class="ln" d="M-5.5-33H5.5"/>
</g>
```

## 6. Motion

Walk 90/s; Madeline glides at 30/s. Ripple 14s. Clouds sink over 3s. Sound-words cut in, hold 0.9s, fade 0.6s. No shake, flash or bounce; no lightning (Poe has none [u35]).

Mini-game in and out: an ink-edged iris closes on the room (0.7s), the intertitle holds (tap or 1.8s), the iris opens (0.9s).

Reduced motion: ripple paused; figures fade between rooms; iris becomes a 250ms fade through ink; façade and clouds cut; sound-words stay until the next action.

```svg
<svg class="iris" viewBox="0 0 960 640" aria-hidden="true" style="position:absolute;inset:0;pointer-events:none">
  <filter id="bleed" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="3" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <mask id="hole" maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="640">
    <rect width="960" height="640" fill="#fff"/>
    <circle id="iris-c" cx="480" cy="320" r="820" fill="#000" filter="url(#bleed)"/>
  </mask>
  <rect width="960" height="640" style="fill:var(--ink)" mask="url(#hole)"/>
</svg>
```
```js
// close on a room: iris(x, y, 820, 0, 700) · open: iris(480, 320, 0, 820, 900)
function iris(cx, cy, from, to, ms) {
  const c = document.getElementById('iris-c');
  c.setAttribute('cx', cx); c.setAttribute('cy', cy);
  return new Promise(done => {
    const t0 = performance.now();
    requestAnimationFrame(function f(t) {
      const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2*k*k : 1 - (2 - 2*k) ** 2 / 2;
      c.setAttribute('r', from + (to - from) * e);
      k < 1 ? requestAnimationFrame(f) : done();
    });
  });
}
```

## 7. Mini-games: one book

1. The spine draws the frame; games keep 32 clear, on paper or ink.
2. Ink, paper, muted, rule, and one red thing: the game's truth.
3. One flat black mass anchors each screen (door: lintel; studio: draperies; Trist: floor).
4. Copy the shared defs and weights.
5. Pieces are paper cut-outs: slide, tilt, lift; never squash.
6. Truth lives low: a black band along the bottom, with `#ripple`.
7. One italic teaching line top left; score bottom right, caps.
8. Success: a sound-word or a blot. Failure: a 0.3s smudge. No confetti.
9. The Trist's 8-bit is a needlework sampler: 12 ink squares, 1 gaps; the dragon is the red.

## 8. Red, exactly

Only: the tarn's truths and its fissure; one truth per mini-game; the blood-red moon through the fissure [u50]; the confession's *say, rather:* corrections. Never UI, hovers, eyes, blood or the title.

## 9. Title and ending

**Letter:** a smaller sheet tilted −1.5° with `#cutout`; italic 24; ruled strikethroughs, one blot. Tap slides it off.

**Title:** the map at dusk, façade closed; *A Sojourn of Some Weeks* on a double-ruled paper cartouche at y 70. In the tarn the title floats flipped and rippling, one word changed in tarn-red (*A Burial of Some Weeks*? the storyteller's call). It teaches the game: look down.

**Ending:** no house; the red moon setting; the guest tiny on the causeway. The account lies on the tarn like the letter: ink entries, dotted leaders; each *say, rather:* writes itself beneath in red italic, the last stopping on a blot. **Last card:** the stage turns over (`scaleY` 1 → 0 → −1, 1.6s): the tarn's house on top, upright, every window lit; the two closing lines mirror, paper on ink above, ink on paper below. **Nevertheless.** bottom centre.
