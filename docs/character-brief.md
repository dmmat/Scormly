# Brief: character library and spot illustrations for Scormly

> Version 1.0 · Status: ready to hand over to an illustrator / for generation
> The document is in English. Prompts for image generation models are in
> English (section 9) and can be copied as is.

---

## 1. Goal

Scormly has a **"Scenario" block (dialogue trainer)**: the author defines a
character, their lines and the learner's answer options. Right now the author
has to find and upload the character's photo in three emotions on their own.
This is the slowest step of building a scenario, and the result often looks
inconsistent.

We need to create a **built-in library of illustrated office characters**
(8 heroes x 3 required emotions + optional ones), a **set of learner avatars**
for chat mode and **3-4 spot illustrations** for the landing page and the
editor's empty states. All of it in one recognizable style that suits all four
Scormly themes.

The images **end up inside SCORM packages**, so file weight is a hard
requirement, not a wish.

---

## 2. Where the images are shown (measured in the code)

Data model (`src/types/course.ts`, `ScenarioData`):

- `characterImages: { neutral?, happy?, concerned? }` - one image per emotion;
  each dialogue node has its own emotion, and the image is **swapped on the
  fly** when moving between lines.
- `userAvatar?` - the learner's avatar, chat mode only.
- `layout: 'classic' | 'chat'`.

**All current display spots are a square frame with `object-fit: cover`,
cropped to a circle (`border-radius: 9999px`).** That is, the corners of the
square image are never visible.

| Place | File | Size (CSS px) | Crop | Background under the image |
|---|---|---|---|---|
| Classic scenario - avatar next to the line | `ScenarioPreview.tsx`, `player.css` `.scenario-avatar` | **64 x 64** | circle | white `#FFFFFF` |
| Chat - "messenger" header (always the `neutral` emotion) | `.chat-avatar`, `ScenarioPreview.tsx` | **36 x 36** | circle + 2px white ring (40% opacity) | **theme accent color** (`#EC4899` / `#0EA5E9` / `#16A34A` / `#F97316`) |
| Chat - avatar next to each character message (the node's emotion) | `.chat-msg-avatar` | **24 x 24** | circle | light grey `#F9FAFB` |
| Chat - learner avatar next to their answer | `.chat-msg-avatar` (`userAvatar`) | **24 x 24** | circle | `#F9FAFB`, with an accent-colored bubble next to it |
| Editor - thumbnail next to the upload field | `ScenarioBlock.tsx` `CharacterThumb` | **32 x 32** | square with 4px rounding | white |

Design conclusions:

1. **The largest current display is 64 px**, which is 128 physical pixels on
   Retina. We deliver 512 x 512 - with headroom for future larger layouts
   (e.g. "character on half the screen") without reordering.
2. **The smallest display is 24 px.** The face then takes up ~12 px. The
   emotion must read by the **silhouette of the mouth and brows**, not by
   small details.
3. **The circle eats the corners.** Everything important goes inside the
   inscribed circle (see 5.2).
4. **The transparent background must look good on white, on `#F9FAFB` and on
   the saturated color of each of the 4 themes** (chat header). So clothes and
   hair must not blend into pink, blue, green or orange.
5. There is no dark theme in the player yet, but the character outline must
   not get lost on a dark `#1F2937` background either (a "for the future"
   check).

The product's visual language (landing page, `ChatDemo.tsx`): soft rounded
shapes, a "phone" chat with bubbles, an accent gradient in the header, lots of
air, a friendly but businesslike tone. The names **Ksiu, Anna, Nazar, Max,
Ivan, Dmytro, Betty** already "live" on the landing page - we take some of
them into the cast so the landing page and the library tell one story.

---

## 3. Deliverables

### 3.1 List

| # | What | Quantity |
|---|---|---|
| A | Character sheet (reference sheet) per character: front/3/4 view, 3 emotions, palette | 8 sheets |
| B | Characters, required emotions `neutral`, `happy`, `concerned` | 8 x 3 = **24** (the first 6 are ready; Jisu and Layla are the second wave) |
| C | Characters, optional emotions `surprised`, `frustrated`, `thinking` | up to 8 x 3 = 24 |
| D | Learner avatars | **6** (minimum 4) |
| E | Spot illustrations | **4** (minimum 3) |
| F | Group portrait of all 8 characters (for the landing page / README) | 1 |
| G | Source files (Figma / AI / SVG with layers, or PSD) | everything above |

### 3.2 Formats and sizes

**Characters and learner avatars (B, C, D):**

| File | Format | Size | Weight limit | Purpose |
|---|---|---|---|---|
| Master | PNG-32 (RGBA), sRGB | **1024 x 1024** | - | source file, does not go into the product |
| Production | **WebP with alpha channel**, quality ~85 | **512 x 512** (2x of 256) | **<= 40 KB** target, **<= 60 KB** hard | goes into the library and SCORM packages |
| Fallback (optional) | PNG-32, quantized (pngquant) | 256 x 256 | <= 50 KB | for very old LMS browsers |
| Vector (optional, preferred) | SVG, `viewBox="0 0 512 512"` | - | <= 30 KB | if the style is fully vector |

**Spot illustrations (E):**

| File | Format | Size | Weight limit |
|---|---|---|---|
| Main | **SVG** (preferred), `viewBox="0 0 800 600"` | 4:3 | <= 40 KB |
| Raster | WebP with alpha | **1600 x 1200** (2x of 800 x 600) | <= 150 KB |

**SVG requirements:** no embedded rasters, no text/fonts, no `<script>`, no
external links, strokes outlined (outline strokes), minimum number of nodes
(run through SVGO). Accent elements - see 4.3.

Budget: 18 required WebP x ~40 KB ~ 0.7 MB for the whole library. Only the
files of the chosen character (~120 KB) are copied into a course - this is
acceptable for SCORM.

Color profile - **sRGB**, no embedded ICC profiles and no metadata (strip
EXIF/XMP). Alpha - **without a white/dark halo** along the edge (premultiplied
edge clean-up).

### 3.3 File structure and naming

Identifiers are in Latin letters, `kebab-case`, no spaces. Emotions - exactly
as in the code.

```
library/
├── manifest.json
├── characters/
│   ├── ksiu/
│   │   ├── neutral.webp
│   │   ├── happy.webp
│   │   ├── concerned.webp
│   │   ├── surprised.webp      # optional
│   │   ├── frustrated.webp     # optional
│   │   └── thinking.webp       # optional
│   ├── nazar/ …
│   ├── max/ …
│   ├── anna/ …
│   ├── sergio/ …
│   ├── dmytro/ …
│   ├── jisu/ …
│   └── layla/ …
├── avatars/
│   ├── learner-01.webp … learner-06.webp
├── illustrations/
│   ├── empty-lesson.svg      (+ .webp)
│   ├── course-complete.svg   (+ .webp)
│   ├── welcome.svg           (+ .webp)
│   └── unsupported.svg       (+ .webp)
└── group/cast.webp

source/                      # masters and source files, not in the production bundle
├── characters/<id>/<emotion>@1024.png
├── characters/<id>/sheet.png
└── <id>.fig / .ai / .psd
```

---

## 4. Art direction

### 4.1 Style

- **Flat / semi-flat vector illustration**: clean fills, 1-2 levels of soft
  shadow (cel-shading without gradient "plastic" highlights), no textures or
  only very light noise (<= 3%).
- **Soft, rounded shapes** - echoing Scormly's rounded buttons and bubbles. No
  sharp corners in the silhouette.
- **Outline:** either no stroke, or a thin dark stroke of uniform width
  (~1.5% of the frame width, color - a darker shade of the adjacent fill, not
  black). Pick one option for the **whole** set.
- **Proportions:** slightly stylized (head a bit bigger than realistic,
  ~1 : 5.5 for full height), expressive brows and mouth, simple eyes (oval +
  highlight). Friendly but **grown-up** - not a children's cartoon, not anime,
  not "corporate Memphis" with purple people.
- **No photorealism** and no 3D rendering: the image must honestly look like
  an illustration, with no "uncanny valley".

### 4.2 Palette

Characters stand on 4 different accent backgrounds, so **clothes are neutral
and muted**, and large patches of color must not coincide with the theme
accents.

| Role | HEX | Use |
|---|---|---|
| Ink (darkest) | `#1F2937` | outline, pupils, darkest hair |
| Navy | `#27364F` | blazers, sweaters |
| Slate | `#64748B` | clothes, clothing shadows |
| Warm grey | `#A8A29E` | clothes, accessories |
| Cream | `#F5EFE6` | shirts, blouses |
| Camel | `#C19A6B` | cardigans, coats |
| Burgundy (muted) | `#7F3B4A` | spot clothing accent |
| Mustard (muted) | `#C9A227` | spot clothing accent (small!) |
| White | `#FFFFFF` | eye highlights, teeth |

Skin and hair - a natural range (from `#F6D7C3` to `#6B4430` for skin; hair
from blond to black, grey). **Forbidden** in large areas: saturated pink,
blue, green, orange (≈ `#EC4899`, `#0EA5E9`, `#16A34A`, `#F97316` ± 20° hue at
saturation > 50%). Small details (an earring, a lanyard ribbon) are allowed.

### 4.3 Accent color in spot illustrations

In spot illustrations **one** "brand" element (a folder, a flag, a checkmark,
a cursor) must adapt to the theme. In SVG, draw such elements with
`fill="currentColor"` (or the class `accent`), and the rest with the fixed
palette 4.2. In raster versions the accent is pink `#EC4899` (the default Rose
theme). The second, lighter shade of the accent - via `fill-opacity` of the
same `currentColor`, not as a separate color.

### 4.4 Framing of characters (the most important)

So that **nothing "jumps"** when the emotion changes, the geometry is the same
for all frames and all characters. Coordinates are for the 1024 x 1024 master:

```
 0 ┌──────────────────────────┐
   │  ░ corners - "dead zone" │   ░ = cut off by the circle
130│      ┌── top of hair     │   top of head/hairstyle: 12-16% (≈ 130-165 px)
   │      │                   │
430│ ─ ─ ─ ● ─ ─ ● ─ ─ ─ ─ ─ ─│   EYE LINE: 42% (430 px) ± 1%
   │                          │
640│      └── chin            │   chin: 60-64%
   │    ╱  shoulders  ╲       │   shoulders extend past the frame edges
1024└──────────────────────────┘   frame cropped at mid-chest
```

- **Shot:** bust (head + shoulders + upper chest). **Do not show hands** in the
  required emotions (the circle will crop them, and when the emotion changes
  the frame would "float").
- **Face center** - horizontally 50% ± 2%.
- **Head height** (crown without hairstyle → chin) - **42-46%** of the frame
  height, the same for all characters (permitted deviation ± 2% for different
  height/hairstyle).
- **Angle:** the torso is turned 10-20° **to the viewer's right** (in the
  classic layout the avatar is to the left of the text - the character "turns"
  toward their line), the gaze is **straight at the viewer**.
- **Safe zone:** the face, hairstyle and shoulders down to the collarbones -
  inside a central circle with a diameter of **80%** of the frame (820 px).
  Nothing meaningful in the corners.
- **Only these change between emotions:** brows, eyes, mouth, a slight head
  tilt (<= 5°, **around the point between the eyes** so the eye line does not
  shift), shoulder raise (<= 2% of the height). The silhouette of the
  hairstyle and clothes is identical.
- Recommended approach: **one base layer of body/clothes/hairstyle + a swapped
  face layer** - this guarantees stability.

### 4.5 Background

- **Transparent** (alpha channel) for characters and spot illustrations.
- No "floor" shadows, no plates, circles, frames, vignettes.
- Outline contrast: the character must separate clearly from **white** and
  from each of the 4 accents (check at 36 px; see the checklist).
- **Exception - learner avatars** (section 7): they have **their own filled
  background** over the whole square.

### 4.6 Diversity and inclusivity

- Different ages (20-60+), genders, skin tones, body types and hair types; at
  least one character with glasses; at least one with a visible but not
  "main" trait (hearing aid, grey hair, freckles).
- Roles are **not tied to gender or age stereotypically** (e.g. IT support is
  not necessarily a young guy in a hoodie; a manager is not necessarily a
  middle-aged man).
- Clothing - neutral business / smart-casual, suitable for any industry
  (office, retail, bank, production-office). No symbols of religion, politics,
  sports clubs, national costumes - the character must fit a course of any
  company.
- The `concerned` emotion - **worry, not fear and not aggression**; the
  character stays likeable.

### 4.7 What to avoid

- Any **text**, letters, digits, logos, badges with inscriptions.
- Resemblance to real people, celebrities, well-known mascots or the styles of
  specific brands (Duolingo, Headspace, Notion, Slack, "Corporate Memphis" /
  Alegria).
- Photorealism, 3D, glossy highlights, cyberpunk, anime eyes.
- Hyperbolized emotions (tears, red faces, "steam from the ears").
- Sexualization, caricature features that stereotype groups of people.
- Small details that turn into "noise" at 24 px (fabric patterns, small
  jewelry, textures).
- Frame violations: a cropped crown, hands entering the frame (in the required
  emotions), a different head scale between emotions.

---

## 5. Character cast

For each: ID (file path) · name Ukrainian / neutral English · role · age ·
appearance · clothing · personality. Then - a description of the emotions.

The general "formula" of emotions (the same for all, so the set is
consistent):

| Emotion | Brows | Eyes | Mouth | Head/shoulders |
|---|---|---|---|---|
| `neutral` | level, relaxed | open, soft gaze | closed, a barely-there smile (corners level) | straight, shoulders relaxed |
| `happy` | slightly raised | "smiling" (lower lid raised, slight squint) | wide smile, may show teeth | head tilt 3-5° |
| `concerned` | inner ends raised and drawn together ("little house") | slightly wider, gaze straight | closed, corners down or lips pressed | head tilt 3-5° the other way, shoulders 1-2% higher |
| `surprised` (opt.) | raised high | wide open | small "o" | head slightly back (without shifting the eye line) |
| `frustrated` (opt.) | drawn together, inner ends lowered | narrowed | pressed lips / crooked mouth | shoulders higher, a slight exhale |
| `thinking` (opt.) | one brow higher | gaze up and to the side | lips to the side | a hand near the chin is **allowed** within the safe zone |

### 5.1 Ksenia ("Ksiu", Ксюша) — `ksiu` · HR / onboarding mentor

- **Age:** 28-32. The main "face" of Scormly (first on the landing page).
- **Appearance:** fair skin with a warm undertone, freckles; light-brown
  shoulder-length hair, soft waves, tucked behind one ear; round face, a
  friendly gaze.
- **Clothing:** a cream blouse (`#F5EFE6`) + a camel cardigan (`#C19A6B`);
  small stud earrings.
- **Personality:** warm, attentive, explains simply, encourages newcomers.
- `neutral` - a welcoming half-smile, like on a video call "Hi, I'm Ksiu".
- `happy` - a wide sincere smile, "bracket" eyes, a slight head tilt.
- `concerned` - brows in a "little house", lips pressed - "oh, there's a
  nuance here, let's go through it", sympathetic, without anxiety.

### 5.2 Nazar (Назар) — `nazar` · team lead

- **Age:** 38-45.
- **Appearance:** medium skin tone, a short neat haircut, dark hair with grey
  at the temples, a short groomed beard; a rectangular face; glasses in a thin
  dark frame.
- **Clothing:** a navy blazer (`#27364F`) over a plain light T-shirt or a shirt
  without a tie.
- **Personality:** calm, honest, demanding but fair.
- `neutral` - a composed, attentive gaze, the mouth level.
- `happy` - a restrained but warm smile ("good job"), narrowed eyes.
- `concerned` - brows drawn together, a slight crease on the forehead, lips
  pressed - "we need to talk about the deadline".

### 5.3 Max (Макс) — `max` · new employee

- **Age:** 22-26.
- **Appearance:** fair skin, dark-blond unruly hair, a bit longer on top; a
  slim build; an open face.
- **Clothing:** a slate sweatshirt (`#64748B`) over a collared shirt
  (`#F5EFE6`); a badge lanyard **without text** (muted burgundy).
- **Personality:** an enthusiast, a bit unsure, asks a lot of questions. Often
  the learner's "alter ego".
- `neutral` - an interested, slightly tense gaze, a barely noticeable smile.
- `happy` - an open smile with teeth, brows up - "Oh, got it!".
- `concerned` - uncertainty: brows in a "little house", the mouth slightly to
  the side - "did I break something?".

### 5.4 Anna (Аня) — `anna` · colleague

- **Age:** 30-36.
- **Appearance:** dark skin (the `#6B4430` range), voluminous curly black hair
  gathered in a low bun (a compact silhouette - so it fits in the circle);
  expressive brows.
- **Clothing:** a mustard (muted, small area) turtleneck + a grey blazer
  (`#A8A29E`).
- **Personality:** friendly, straightforward, with humor; the one people go to
  for advice.
- `neutral` - a relaxed smile at the corners of the lips, a confident gaze.
- `happy` - laughter (open mouth, eyes almost closed from smiling).
- `concerned` - "hmm, something's off": one brow slightly lower, lips pressed
  to the side, an empathetic gaze.

### 5.5 Sergio (Серджіо) — `sergio` · customer

- **Age:** 55-65.
- **Appearance:** fair skin with rosy cheeks, short grey hair, receding
  hairline, a moustache; a hearing aid in the left ear (natural, without
  emphasis on it).
- **Clothing:** a camel coat or trench over a burgundy (`#7F3B4A`) sweater -
  "came in from the street" into the office/shop.
- **Personality:** a demanding but polite customer; ideal for "handling
  objections" and "difficult customer" trainers.
- `neutral` - business restraint, a slight skepticism in the gaze.
- `happy` - a satisfied, slightly surprised smile - "now that's service".
- `concerned` - displeasure without aggression: brows drawn together, mouth
  corners down, chin slightly tucked in.
- For Sergio `frustrated` is **especially desirable** (complaint scenarios).

### 5.6 Dmytro ("Dima", Дмитро) — `dmytro` · IT support

- **Age:** 27-34.
- **Appearance:** swarthy / olive skin, short black hair with a fade, neat
  stubble; a calm face; a headset earpiece on one ear (a simple silhouette,
  without logos).
- **Clothing:** a dark-grey zip hoodie (`#27364F`) over a light T-shirt.
- **Personality:** patient, methodical, slightly ironic; explains
  "cybersecurity in human language".
- `neutral` - a level, attentive gaze, a barely noticeable "let's figure it
  out" smile.
- `happy` - a satisfied smile, brows up - "it works!".
- `concerned` - wary: brows drawn together, lips in a line - "this email looks
  like phishing".

### 5.7 Jisu (Дзісу) — `jisu` · marketing / design *(second wave)*

- **Age:** 26-32.
- **Appearance:** East Asian, light skin with a warm undertone; a stylish bob
  with bangs and a slight asymmetric cut, thick black hair; thin-frame glasses
  (optional); expressive but restrained brows.
- **Clothing:** an oversized warm grey blazer (`#A8A29E`) over a cream top
  (`#F5EFE6`); one small fashionable detail (a minimalist earring).
- **Personality:** quick, with good taste, loves efficiency and clear briefs.
- `neutral` - a calm confident half-smile, a straight gaze.
- `happy` - a bright smile, "bracket" eyes, a slight head tilt - "this is
  exactly it".
- `concerned` - brows in a "little house", lips pressed - "hmm, this doesn't
  match the brief", kindly.

### 5.8 Layla (Лейла) — `layla` · lawyer / compliance *(second wave)*

- **Age:** 35-42.
- **Appearance:** a woman of Arab descent (Middle East / North Africa), tan
  skin with a warm undertone; thick dark wavy shoulder-length hair **with no
  head covering**; expressive eyes, a confident gaze.
- **Clothing:** a slate (`#64748B`) blouse with a collar under a navy blazer
  (`#27364F`); small gold earrings.
- **Personality:** precise, thorough, fair; explains the complex simply.
- `neutral` - composed, attentive, a barely noticeable smile.
- `happy` - a warm smile, brows slightly up - "exactly, that matches the
  policy".
- `concerned` - brows drawn together, lips in a line - "there's a risk here,
  let's clarify", without sternness.

> The names Betty and others from the landing page demo can be added in later
> waves of the library under the same specification. For child characters (if
> there are any) a separate note applies: neutral clothing, `concerned`
> without fear, no sexualization.

---

## 6. Optional emotions

`surprised`, `frustrated`, `thinking` - per the table in section 5.
**Important:** the current data model supports only 3 emotions; the optional
ones will be used after `ScenarioEmotion` is extended (see section 11). That
is why they are drawn **in the same geometry**, so they can be swapped in
later without jumps.

---

## 7. Learner avatars (`avatars/learner-0X`)

Shown **only at 24 x 24 px** next to the learner's answers, beside the
accent-colored bubble. Therefore they are deliberately **simpler** than the
characters:

- The same style, but simplified: head + shoulders, minimum of facial detail
  (dot eyes, a light smile), **no pronounced emotions** (always
  neutral-friendly).
- **Filled background over the whole square** (the circle will crop it): soft
  neutral tones that do not compete with the accent - `#E5E7EB`, `#E7E1D7`,
  `#DDE3EA`, `#E9E4EE`, `#E3E8E1`, `#EFE6DF`.
- Centering: the face in the center, the head takes ~50% of the height, the
  shoulders cropped at the bottom.

| ID | Description |
|---|---|
| `learner-01` | short dark hair, medium skin tone |
| `learner-02` | long light hair, fair skin |
| `learner-03` | curly hair, dark skin |
| `learner-04` | greying hair, glasses |
| `learner-05` | short haircut, no head covering, olive skin (we do not use religious attributes, see 4.6) |
| `learner-06` | **gender-neutral** abstract silhouette (circle head + shoulders, no facial features) - the default variant |

Format: 512 x 512 WebP (no transparency), <= 25 KB.

---

## 8. Spot illustrations (`illustrations/`)

In general: 4:3 (800 x 600), transparent background, the composition centered
with >= 15% free margin on all sides, 1 character from the catalog **in full
or 3/4 height** (this is not an avatar - the framing of 4.4 does not apply
here), one `currentColor` accent element (see 4.3). No text - captions are
added by the UI via i18n.

1. **`empty-lesson` - empty lesson** (the "Nothing here yet" state in the
   editor's workspace).
   Ksiu stands next to a large empty "sheet" card with a dashed border and
   holds a building-block brick (accent color) in her hand, as if about to
   place it first. Mood: an invitation to start. Displayed at ~320 x 240 px -
   the details are large.

2. **`course-complete` - course completed.**
   Max (the newcomer) with a raised hand/fist of joy; next to him a large
   circle with a checkmark (accent) and a few confetti shapes (circles,
   rounded squares - palette 4.2 + accent). No trophies or medals with
   inscriptions.

3. **`welcome` - welcome screen (open / create a project in a folder).**
   Nazar and Anna next to a large open folder (accent) from which simple
   lesson cards "grow". Emphasizes "everything is stored in your folder,
   locally". A horizontal composition, characters at the edges, the folder in
   the center.

4. **`unsupported` - unsupported browser / 404.**
   Dmytro (IT) looks understandingly at a simplified browser window with a
   "torn" cable-plug or a missing puzzle piece (accent). The emotion - a calm
   "it happens, I'll help you in a moment", **not** panic. It must work both
   as a 404 and as "your browser does not support the File System Access API".

---

## 9. Generation prompts (English, ready to paste)

### 9.1 Master style prompt

```
Flat semi-flat vector illustration of a friendly adult office professional,
bust portrait (head, shoulders and upper chest), centered, square 1:1 canvas,
body turned 15 degrees to the viewer's right, eyes looking directly at the
viewer. Clean solid color fills, one or two levels of soft cel shading, no
gradients, no texture, soft rounded shapes, simple oval eyes with a small
white highlight, expressive eyebrows and mouth. Slightly stylized proportions,
approachable but grown-up, modern corporate e-learning style.
Muted neutral clothing palette: navy #27364F, slate #64748B, warm grey #A8A29E,
cream #F5EFE6, camel #C19A6B, small accents of muted burgundy #7F3B4A.
Eye line exactly at 42% of image height, top of hair at 14% from the top,
chin at 62%, shoulders extend past the left and right edges, cropped at
mid-chest. Face and hair fully inside a centered circle of 80% diameter.
Transparent background (or plain flat #FFFFFF background if transparency is
not supported), no shadow on the ground, no frame.
```

### 9.2 "Character x emotion" template

```
{MASTER STYLE PROMPT}
Character: {CHARACTER DESCRIPTION}.
Expression: {EMOTION DESCRIPTION}.
Same character, same outfit, same hairstyle, same head size and position
as the reference image; only the facial expression changes.
```

**{CHARACTER DESCRIPTION}:**

| ID | Text |
|---|---|
| ksiu | `a woman around 30, fair skin with warm undertone and light freckles, shoulder-length light-brown wavy hair tucked behind one ear, round face, cream blouse under a camel cardigan, tiny stud earrings, warm and encouraging onboarding mentor` |
| nazar | `a man around 42, medium skin tone, short neat dark hair with grey temples, short trimmed beard, thin dark rectangular glasses, navy blazer over a plain light t-shirt, no tie, calm fair team manager` |
| max | `a young man around 24, fair skin, slightly messy dark-blond hair longer on top, slim build, slate-grey sweatshirt over a cream collared shirt, plain muted-burgundy lanyard with no text, eager new employee` |
| anna | `a woman around 33, dark brown skin, voluminous black curly hair in a compact low bun, defined eyebrows, small-area muted mustard turtleneck under a warm-grey blazer, friendly witty colleague` |
| sergio | `a man around 60, fair skin with rosy cheeks, short grey receding hair, grey moustache, small discreet hearing aid in his left ear, camel trench coat over a muted burgundy sweater, polite but demanding customer` |
| dmytro | `a man around 30, olive skin, short black hair with a fade, neat stubble, simple single-ear headset without logos, dark navy zip hoodie over a light t-shirt, patient IT support specialist` |
| jisu | `a woman around 29, East Asian, light skin with warm undertone, stylish asymmetric black bob with bangs, thin-frame glasses, oversized warm-grey blazer over a cream top, one small minimalist earring, quick-minded marketing designer with good taste` |
| layla | `a woman around 38, Middle Eastern, tan skin with warm undertone, thick dark wavy hair to the shoulders with no head covering, expressive eyes, slate blouse with a collar under a navy blazer, small gold stud earrings, precise fair legal and compliance specialist` |

**{EMOTION DESCRIPTION}:**

| Emotion | Text |
|---|---|
| neutral | `neutral friendly expression, relaxed eyebrows, soft gaze, closed mouth with a very slight smile, head straight` |
| happy | `genuinely happy, wide smile showing teeth, smiling eyes with raised lower lids, eyebrows slightly raised, head tilted 4 degrees` |
| concerned | `concerned and empathetic, inner eyebrows raised and drawn together, lips pressed together with corners slightly down, head tilted 4 degrees the other way, shoulders slightly raised, still likeable, not scared` |
| surprised | `pleasantly surprised, eyebrows high, eyes wide open, small round open mouth` |
| frustrated | `mildly frustrated, eyebrows drawn together and lowered, eyes slightly narrowed, lips pressed into a crooked line, shoulders slightly raised, not aggressive` |
| thinking | `thoughtful, one eyebrow raised, eyes looking up and to the side, mouth pulled to one side, one hand touching the chin, hand kept inside the central area` |

### 9.3 Learner avatar prompt

```
Minimal flat vector avatar, head and shoulders, centered, square 1:1,
very simple face (dot eyes, small gentle smile), soft rounded shapes, no
outline or thin outline, solid pastel neutral background filling the whole
square ({BACKGROUND HEX}), {LOOK}. Readable at 24 pixels. No text.
```

### 9.4 Spot illustration prompt

```
Flat semi-flat vector spot illustration, 4:3, centered composition with
generous empty space around, transparent background, same character style as
the reference sheet, muted neutral palette (navy, slate, warm grey, cream,
camel) with exactly ONE accent element in pink #EC4899. {SCENE}. No text, no
letters, no logos, no UI labels.
```

`{SCENE}`: see the descriptions from section 8, translated into English, e.g.
`A young woman stands next to a large empty card with a dashed border, holding a single rounded building block in the accent color, inviting to start.`

### 9.5 Negative prompt

```
text, letters, words, numbers, watermark, signature, logo, brand, badge text,
photorealistic, photo, 3d render, glossy, plastic, gradient mesh, anime,
chibi, childish, caricature, exaggerated features, uncanny, creepy,
celebrity likeness, corporate memphis, purple skin, extra fingers, deformed
hands, cropped head, hands in frame, busy background, pattern, texture noise,
drop shadow on floor, frame, border, vignette, saturated pink clothes,
saturated blue clothes, bright green clothes, bright orange clothes
```

### 9.6 Consistency tips

1. **Character sheet first**, then the emotions. Approve each character's
   sheet (neutral front view + 3/4 + palette) before generating the rest.
2. Use the approved `neutral` as the **reference image / image-to-image**
   (influence strength 0.6-0.75) or the model's "character reference"
   feature; fix the **seed** within one character.
3. Generate in a 1024 x 1024 square, with a **solid white** background if the
   model cannot do transparency; then remove the background (with halo
   clean-up).
4. After generation, **align all frames to the eye line and scale** in an
   editor (guides at 42% of the height and 50% of the width) - this is a
   mandatory step, models do not hold the geometry on their own.
5. Best result: generate the base, then **redraw it in vector**
   (Figma/Illustrator) with a shared body layer and separate face layers - so
   stability is guaranteed, and the SVG becomes a free bonus.
6. One person / one session for the whole set; compare new frames with the
   group portrait (F) so the style does not "drift".

---

## 10. Acceptance checklist

**Technical**
- [ ] All files are named per scheme 3.3; IDs and emotions - exactly as in the
      list.
- [ ] Production WebP is exactly 512 x 512, sRGB, no metadata.
- [ ] Weight: character <= 60 KB (target <= 40), avatar <= 25 KB, spot SVG
      <= 40 KB, spot WebP <= 150 KB.
- [ ] Transparent background for characters and spots; no white/grey halo on
      the edges (check on black and on `#EC4899`).
- [ ] SVG: no text, rasters, scripts or external links; the accent is
      `currentColor`.

**Geometry**
- [ ] Overlay of all emotions of one character (50% opacity) - the eye line,
      the outline of the hairstyle and shoulders coincide (tolerance <= 1% of
      the frame).
- [ ] Eye line at 42% ± 1% in **all** 8 characters; head height within
      42-46%.
- [ ] Face and hairstyle inside the 80% circle; with a circular crop nothing
      important is lost.

**Legibility**
- [ ] Checked in a **64 px** circle on white - the character and the emotion
      are recognizable.
- [ ] Checked in a **36 px** circle on each of the 4 accents (`#EC4899`,
      `#0EA5E9`, `#16A34A`, `#F97316`) with a 40% white ring - the silhouette
      does not blend in.
- [ ] Checked in a **24 px** circle on `#F9FAFB` - `neutral` / `happy` /
      `concerned` are distinguishable without a hint.
- [ ] Learner avatars are distinguishable from each other at 24 px.

**Content and style**
- [ ] One style across the whole set (outline, shadows, proportions,
      palette).
- [ ] No text, logos, resemblance to real people/brands.
- [ ] Diversity of age, gender, skin tone is observed; `concerned` is
      sympathetic, not scary.
- [ ] Large areas of clothing do not coincide with the theme accent colors.

**Rights**
- [ ] Source files (G) and **exclusive or free rights** compatible with the
      repository's MIT license are handed over (permission to distribute in an
      open-source project and in SCORM packages created by users, without
      attribution in the package). For generated images - confirmation that
      the terms of the model used allow this.

---

## 11. Technical integration (plan, not implemented)

Below is how the library will be connected later; no code is changed within
the scope of this brief.

1. **Location.** Files from `library/` go into `public/library/` and are
   loaded via `import.meta.env.BASE_URL` (works on GitHub Pages with a base
   path too).
2. **Manifest** `public/library/manifest.json`:
   ```json
   {
     "version": 1,
     "characters": [
       {
         "id": "ksiu",
         "name": { "en": "Ksenia", "uk": "Ксюша" },
         "role": { "en": "HR / onboarding", "uk": "HR / онбординг" },
         "emotions": ["neutral", "happy", "concerned"]
       }
     ],
     "avatars": ["learner-01", "learner-02"]
   }
   ```
3. **Picker in the "Scenario" block editor** (`ScenarioBlock.tsx`): next to
   the emotion upload fields - a "Choose from library" button → a grid of
   characters (a round `neutral` thumbnail, name, role) → the choice
   **copies** the emotion files into the project's `assets/images/` through
   the existing pipeline `src/lib/assets.ts` and writes the relative paths
   into `characterImages`; if the character's name is empty - it fills in the
   localized name from the manifest. Copying (rather than linking to
   `public/`) guarantees that the project is self-contained, and the SCORM
   export and offline viewing work unchanged.
4. **A similar picker for `userAvatar`** in chat mode.
5. All new UI strings - via i18n (namespace `scenario`, EN + UK).
6. **Optional emotions** will become available after the `ScenarioEmotion`
   type (`src/types/course.ts`), the node emotion selector, the preview and
   `player.js` are extended; the files will already be in the library in
   compatible geometry.
7. Spot illustrations are inlined as SVG components (so that `currentColor`
   picks up `text-brand` of the active theme) in the workspace empty state,
   on the welcome screen, on the unsupported-browser screen and on the
   landing page.
