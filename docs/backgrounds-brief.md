# Brief: background library for Scormly dialogue scenarios

> Version 0.1 · Draft · complements [character-brief.md](./character-brief.md)
> The document is in English; the model prompts are in English as well.

---

## 1. Goal

The "Scenario" block currently shows a character as a small circle (24–64 px)
on white. For more "alive" dialogues we need ready-made **location
backgrounds** (office, meeting room, by the whiteboard, reception, shop…)
that the author picks with one click instead of searching the internet.

A background is the **circumstances of the conversation**, not a separate
illustration: it must not distract from the text or from the character. So
the main requirements are **muted contrast, blurred depth, room for the
character and the text**.

The images end up in SCORM packages → the weight limit is strict (see 3.2).

---

## 2. Dependencies and open questions

This is **not** just "a picture behind an avatar". The current display (a
24–64 px circle) does not use a background. So a scene with a background is
a **second scenario type** (next to the existing dialogue trainer): a wide
16:9 scene with the character in close-up, the line at the bottom in a
bubble/panel, and the answer options under the scene. The classic and chat
modes stay unchanged and without a background.

A separate decision: whether this is a new `layout` value (`'scene'`) in the
same "Scenario" block (cheaper: shared nodes, branches, dialogue editor), or
a separate block type. Recommendation — **a `layout` value**, because the
dialogue logic is the same and only the presentation differs.

Decisions to make **before** generation:

1. **How to show the character on the background — DECISION: (B).** The
   existing frames are 1:1 bust portraits, the shoulders run past the sides
   of the square, so on a wide background they would have shoulders "cut off
   vertically". Therefore a **separate set of scene poses** is drawn for
   each character (waist-up, with natural shoulders and hands, transparent
   background) — specification in **section 9**. That is +3 frames per
   character on top of the 3 avatar ones (the medallion (A) was rejected).
2. **Light/dark theme.** The player is light for now → backgrounds come in
   one, "daytime" variant. Night versions — not now.
3. **Whether to tie the background to the Scormly theme.** No: backgrounds
   are neutral and do not change with the accent (see 4.2). Accent elements
   are only in the UI.

---

## 3. Deliverables

### 3.1 List

| # | What | Quantity |
|---|---|---|
| A | Background scenes (16:9) | **10 required** + up to 4 optional |
| B | Thumbnails for the picker | 1 per background |
| C | Character scene poses (section 9): `neutral`, `happy`, `concerned` | **3 per character** (6 × 3 = 18; with Jisu and Layla — 24) |
| D | "Character × background" previews (check, not for production) | 6 × 3 minimum |
| E | Source files (PSD / Figma / master PNG) | all |

### 3.2 Formats and sizes

| File | Format | Size | Weight | Purpose |
|---|---|---|---|---|
| Master | PNG, sRGB | **3200 × 1800** | — | source, does not go into the product |
| Production | **WebP**, quality ≈ 80 | **1600 × 900** (2× of 800) | target **≤ 80 KB**, hard limit **≤ 120 KB** | library and SCORM |
| Thumbnail | WebP | **320 × 180** | ≤ 15 KB | picker in the editor |

No transparency (the background is solid). No metadata, sRGB. Budget:
10 × ~80 KB = ~0.8 MB per library; only the chosen background is copied into
a course.

Because of the weight — **flat fills and soft blurred depth**, no fine
noise, texture or film grain (they break compression). Gradients are allowed
only if soft and broad.

### 3.3 File structure

```
library/
├── backgrounds/
│   ├── office-open-space.webp
│   ├── office-open-space.thumb.webp
│   ├── meeting-room.webp
│   └── …
├── characters/<id>/scene-neutral.webp      # scene poses (section 9)
├── characters/<id>/scene-happy.webp
├── characters/<id>/scene-concerned.webp
└── manifest.json            # the "backgrounds" array is added
source/backgrounds/<id>@3200.png
source/characters/<id>/scene-<emotion>@1536.png
```

IDs — `kebab-case`, Latin letters.

---

## 4. Art direction

### 4.1 Style

- **The same style as the characters:** flat / semi-flat, soft rounded
  shapes, clean fills, 1–2 levels of soft shadow. This is an **illustration,
  not a photo and not 3D**.
- **Blurred depth (blur):** the foreground is simplified, the background is
  deliberately defocused into large blobs of color (a "bokeh" effect in
  illustration), so that the background reads as a place but does not
  compete with the face.
- **Camera at the eye level of a seated/standing person**, horizon at about
  **40–45% of the frame height** — this matches the characters' eye line
  (42%), and the character "stands" in the room naturally.
- **No people** in the backgrounds: the author adds the characters.

### 4.2 Palette and contrast

- The base palette is the same muted one as in character-brief 4.2: navy
  `#27364F`, slate `#64748B`, warm grey `#A8A29E`, cream `#F5EFE6`, camel
  `#C19A6B`, very sparingly burgundy `#7F3B4A` / mustard `#C9A227`.
- Additionally allowed for backgrounds: **light walls and floors**
  (`#F3F4F6`, `#E5E7EB`, `#EDE7DC`) and **natural green foliage** (a
  houseplant — muted, small).
- **No saturated** pink, blue, green, orange over large areas (as in 4.2 for
  characters) — they would conflict with the theme accent.
- **Text contrast:** the UI puts a bubble/panel on the scene, but the
  background must still be **medium-light and low-contrast**. Target average
  lightness 55–80% (HSL L), no sharp light spots >90% and no black spots
  <15%. Sharp, small, high-contrast details (blinds, checks, brick) — only
  in the blurred background.

### 4.3 Composition (safe zones)

A 16:9 scene with three vertical zones:

```
┌──────────────┬─────────────────────┬──────────────┐
│ CHARACTER    │   "live" center     │   small      │
│ ZONE (0–40%) │   (40–100%)         │   interior   │
│ simplified,  │   — the line and    │              │
│ light patch  │   interior; calm    │              │
└──────────────┴─────────────────────┴──────────────┘
   bottom 30% — calm (under the text panel)
```

- **Left third** — simplified and lighter: the character is placed there (as
  in the classic layout — character on the left, "turned" toward the text).
- **Bottom 30% of the height** — calm floor/table, no details (under the
  bubble).
- The background must **look good mirrored** (the author may put the
  character on the right): no important asymmetric details and no text.
- Everything important within the central 90%; the edges may be cropped on
  mobile (rendering with `object-fit: cover`).

### 4.4 What to avoid

- Text, letters, digits, logos, brands on boards, posters, screens,
  calendars. **A board/screen only with abstract "squiggles"**, shapes,
  arrows, columns without readable words.
- Real people, famous interiors, recognizable branded furniture.
- Religious, political, sports symbols.
- Photorealism, 3D, gloss, cyberpunk, "Corporate Memphis".
- Fine patterns and noise (weight + "mush" when blurred).
- Sharp dramatic perspective and strong shadows.

---

## 5. List of scenes

### Required (10)

| ID | Scene | Suitable for |
|---|---|---|
| `office-open-space` | Spacious open-space, rows of desks, large windows, blurred background | general work dialogues |
| `meeting-room` | Meeting room: long table, chairs, screen, large windows | meetings, evaluations, difficult conversations |
| `whiteboard` | By a marker whiteboard with "squiggle" diagrams (no words) | teaching, explaining, briefing |
| `manager-office` | Manager's office: desk, cabinet, plant, window | conversation with a manager, feedback |
| `reception-desk` | Reception/counter, light lobby | clients, visitors, front desk |
| `retail-floor` | Retail floor: shelves in the blurred background, calm colors (no brands) | retail, service |
| `call-center` | Call center: a row of workstations with headsets, blurred | support, complaints |
| `it-corner` | IT corner: two monitors with abstract code blobs, cables, laptop | cybersecurity, IT |
| `break-room` | Office kitchen/café: kettle, table, small sofa | informal conversations, onboarding |
| `home-office` | Home work desk: laptop, lamp, window, plant | remote work |

### Optional (up to 4)

| ID | Scene |
|---|---|
| `warehouse-office` | Warehouse / production seen from the office area (clean, no machinery) |
| `street-entrance` | Office entrance / street by the door (for client scenarios: "came in from the street") |
| `abstract-light` | Neutral light gradient + a few soft shapes (universal "no location") |
| `abstract-dark` | The same, dark version (for the future) |

> If there are children's courses (see the cast discussion) — additionally
> `classroom`, `playground`, `library`. A separate style is not needed, only
> a brighter color range within 4.2.

---

## 6. Prompts (English, ready to paste)

### 6.1 Master style prompt

```
Flat semi-flat vector illustration of an interior scene, 16:9 landscape,
camera at eye level, horizon at about 42% of the image height, clean solid
color fills with one or two levels of soft cel shading, no gradients except
very soft broad ones, no texture, soft rounded shapes. Foreground simplified,
background intentionally defocused into large soft color shapes (illustrated
bokeh), calm and uncluttered. Muted palette: navy #27364F, slate #64748B, warm
grey #A8A29E, cream #F5EFE6, camel #C19A6B, tiny touches of muted burgundy
#7F3B4A, light walls and floors (#F3F4F6, #EDE7DC), small muted plant. Left
third of the image is simplified and slightly lighter, lower 30% is a calm
empty floor or table area, composition looks fine when mirrored. Medium-light,
low-contrast overall, no pure white or pure black areas. No people.
```

### 6.2 Scene template

```
{MASTER STYLE PROMPT}
Scene: {SCENE}.
```

**{SCENE}** (by ID):

| ID | Text |
|---|---|
| office-open-space | `bright open-plan office with rows of desks, large windows, defocused desks in the distance, a few plants` |
| meeting-room | `meeting room with a long table and chairs, a wall screen showing abstract shapes, large windows with soft daylight` |
| whiteboard | `a marker whiteboard on the wall covered with abstract diagrams, arrows and boxes with no readable words, a table at the side` |
| manager-office | `a calm manager's office, wooden desk, bookshelf with plain colored books, a window, a plant` |
| reception-desk | `a bright reception lobby with a rounded reception counter, a sofa, a plant, large windows` |
| retail-floor | `a retail store floor with defocused shelves of plain unbranded goods in muted colors, a counter at the side` |
| call-center | `call center with a row of desks with monitors and headsets, defocused, calm lighting` |
| it-corner | `IT corner with two monitors showing abstract blurred code shapes (no readable text), a laptop, tidy cables, a lamp` |
| break-room | `office kitchen / break room with a small table, kettle, mugs, a compact sofa, a window` |
| home-office | `a home desk with a laptop, a lamp, a notebook, a window with soft daylight, a houseplant` |

### 6.3 Negative prompt

```
people, person, characters, faces, text, letters, words, numbers, watermark,
signature, logo, brand, readable screen text, photorealistic, photo, 3d
render, glossy, plastic, gradient mesh, anime, childish, cartoon exaggerated,
dramatic perspective, strong shadows, busy pattern, texture noise, film grain,
saturated pink, saturated blue, bright green, bright orange, neon, dark
night scene, clutter
```

### 6.4 Tips

1. Generate in 16:9, then **compress and check the weight**. If > 120 KB —
   simplify the background (fewer small details) rather than lowering the
   quality below 70.
2. Make all 10 scenes in **one session**, with the same palette and blur
   level, otherwise the set will fall apart.
3. Check the "background + character" pairing right away (checklist below) —
   on one character from each gender/skin-tone pair (so that hair and
   clothing do not blend in).

---

## 7. Acceptance checklist

**Technical**
- [ ] WebP 1600 × 900, ≤ 120 KB (target ≤ 80); thumbnail 320 × 180, ≤ 15 KB.
- [ ] No metadata, sRGB, no transparency.
- [ ] File names — per 3.3.

**Composition**
- [ ] Left third simplified and lighter; bottom 30% calm.
- [ ] Horizon at 40–45% of the height.
- [ ] The mirrored version looks natural.

**Legibility**
- [ ] Average lightness 55–80%; no spots >90% / <15%.
- [ ] A white/light panel with 16 px text **and** dark text on the scene are
      legible (check on the left and bottom zones).
- [ ] Each character's scene pose (6–8) **does not blend** with any of the
      10 backgrounds: outline, hair and clothing stand apart.
- [ ] Scene poses: checked against the section 9 checklist.

**Content and style**
- [ ] One style across the whole set, consistent with the character style.
- [ ] No text, logos, people, religious/political symbols.
- [ ] Large areas do not match the theme accents.

**Rights**
- [ ] Source files handed over; rights compatible with MIT and with
      distribution in users' SCORM packages without attribution (for
      generated ones — the model's terms allow it).

---

## 8. Technical integration (plan, not implemented)

1. **Data model:** `ScenarioData.background?: string` (relative path) + a
   new scenario type `layout: 'classic' | 'chat' | 'scene'` (see section 2).
   Only fields are added — old projects do not break; `repairCourse`
   ignores a missing background. The `background` field only makes sense for
   `scene`.
2. **Files:** `public/library/backgrounds/*` + a `backgrounds` section in
   `manifest.json` (`id`, `name: { en, uk }`, `tags`). Choosing **copies**
   the file into the project's `assets/images/` (as for characters), so that
   export and offline work without depending on `public/`.
3. **Background picker** in `ScenarioBlock.tsx`: a grid of thumbnails, "no
   background", "own image" (upload your own).
4. **Three render places:** editor, preview, `player.js` + `player.css`
   (see CLAUDE.md "Learner rendering in three places"). The scene is
   `object-fit: cover`, the text panel has a semi-transparent white backing,
   so that legibility does not depend on the background.
5. **i18n:** namespace `scenario`, EN + UK; background names — from the
   manifest.
6. **`BLOCK_DOCS`** in `agentGuide.ts` — update the scenario description (new
   field, new layout).
7. **Pre-export check:** if a background is set but the file is missing.

---

## 9. Character scene poses (for the "scene" type)

The same characters as in character-brief (face, hairstyle, clothing,
palette identical to the approved sheets), but a **waist-up frame** for the
wide scene. The 512 × 512 avatar busts (character-brief 4.4) are not used
here.

### 9.1 Format

| File | Format | Size | Weight |
|---|---|---|---|
| Master | PNG-32 (RGBA), sRGB | **1536 × 2048** (3:4) | — |
| Production | **WebP with alpha**, quality ≈ 85 | **768 × 1024** | target **≤ 70 KB**, hard limit **≤ 100 KB** |

Display: the character's height ≈ 60–75% of the scene height (in an
800 × 450 scene that is ~300–340 px tall; on Retina 2× a smaller margin is
enough).

### 9.2 Framing (coordinates for 768 × 1024)

```
  0 ┌────────────────────────┐
 50 │      top of hair       │   top of head: 4–6% (≈ 40–60 px)
    │                        │
205 │   ● eye line ●         │   EYE LINE: 20% ± 1% (≈ 205 px)
    │                        │
300 │         chin           │   chin: 28–31%
    │   ╭── shoulders ──╮    │   shoulders fully in frame
    │   │ torso         │    │   ≥ 4% free margin on the sides
1024└───┴───────────┴────────┘   cropped at the waist (straight line at the bottom)
```

- **Transparent background**, no floor, shadows, panels.
- **Horizontal center** of the torso 50% ± 2%. **Shoulders and arms do not
  touch the side edges** (≥ 4% margin) — this is the main difference from
  the avatar busts: the silhouette must be whole.
- **Bottom edge** — a straight crop at the waist; in the scene it is placed
  flush with the bottom edge of the frame, so nothing "hangs in the air".
- **Head height** (crown without hairstyle → chin) — 22–26% of the frame,
  the same for everyone (deviation ± 1.5%).
- **Angle:** body turned 15–25° to the viewer's right, gaze at the viewer.
  All characters look in the same direction (toward the text).
- **Hands are allowed but identical across all emotions:** hanging freely
  along the torso or clasped in front at waist level, within the frame. A
  gesture (e.g. an open palm) — only as an optional separate variant, not in
  the required emotions, so that the frames do not "drift".

### 9.3 What changes between emotions

Only the face (eyebrows, eyes, mouth), head tilt ≤ 5° around the point
between the eyes, shoulder raise ≤ 1.5% of the height. **Body, clothing,
hands, hairstyle silhouette — one shared layer.** The expression rules — the
"emotion formula" table in character-brief, section 5.

### 9.4 Prompt

```
Flat semi-flat vector illustration of a friendly adult office professional,
waist-up portrait, full silhouette of shoulders and arms inside the frame
with at least 4 percent margin on the sides, vertical 3:4 canvas, centered,
body turned 20 degrees to the viewer's right, eyes looking directly at the
viewer, hands relaxed in front at waist level (identical in every emotion).
Clean solid color fills, one or two levels of soft cel shading, no gradients,
no texture, soft rounded shapes, simple oval eyes with a small white
highlight. Eye line at 20 percent of image height, top of hair at 5 percent,
chin at 29 percent, cropped straight at the waist. Muted clothing palette
(navy #27364F, slate #64748B, warm grey #A8A29E, cream #F5EFE6, camel
#C19A6B). Transparent background (or plain flat #FFFFFF if transparency is
not supported), no floor shadow, no frame.
Character: {CHARACTER DESCRIPTION from character-brief 9.2}.
Expression: {EMOTION DESCRIPTION from character-brief 9.2}.
Same character, outfit, hairstyle, body and hand position as the approved
reference; only the facial expression changes.
```

The negative prompt is the same as in character-brief 9.5, plus `cropped
shoulders, arms cut off at the sides, floating hands, different hand
positions`.

### 9.5 How to get consistency

1. Take the **approved sheet and the avatar `neutral`** of the same character
   as the reference: the face and clothing must match.
2. First `scene-neutral`, then `happy`/`concerned` image-to-image (strength
   0.6–0.75), fixed seed.
3. Align the frames by the eye line (20%) and the axis (50%) — a mandatory
   50% transparency overlay, tolerance ≤ 1% of the frame.
4. The best result — redraw in vector with one body/hands layer and separate
   face layers.

### 9.6 Acceptance checklist (scene poses)

- [ ] WebP 768 × 1024, ≤ 100 KB (target ≤ 70), sRGB, no metadata, alpha
      without a halo (check on black and on the scene's background color).
- [ ] Shoulders and arms fully in frame, ≥ 4% margin on the sides, straight
      crop at the waist.
- [ ] Eye line 20% ± 1% for all characters; the emotion overlays match
      (body, hands, clothing, hairstyle).
- [ ] Face and clothing identical to the avatar frames of the same character.
- [ ] On each of the 10 backgrounds the scene looks cohesive: the character
      stands flush with the bottom edge, does not blend into the background.
