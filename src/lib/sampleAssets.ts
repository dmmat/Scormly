import { getMemoryAsset, putMemoryAsset } from './assets'
import { libraryUrl } from './library'

// Library pictures the built-in sample course uses. The sample is not tied to
// a project folder, so they are copied into the in-memory media when it opens;
// previews and exports then treat them like any uploaded picture.

const pose = (name: string, emotion: string) => `assets/images/sample-${name}-${emotion}.webp`

export const SAMPLE_ASSETS = {
  ksiuScene: {
    neutral: pose('ksiu-scene', 'neutral'),
    happy: pose('ksiu-scene', 'happy'),
    concerned: pose('ksiu-scene', 'concerned'),
  },
  dmytroBust: {
    neutral: pose('dmytro', 'neutral'),
    happy: pose('dmytro', 'happy'),
    concerned: pose('dmytro', 'concerned'),
  },
  background: 'assets/images/sample-meeting-room.webp',
  learner: 'assets/images/sample-learner.webp',
}

// Where each sample path comes from inside public/library/.
const SOURCES: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(SAMPLE_ASSETS.ksiuScene).map(([e, p]) => [p, `characters/ksiu/scene-${e}.webp`]),
  ),
  ...Object.fromEntries(
    Object.entries(SAMPLE_ASSETS.dmytroBust).map(([e, p]) => [p, `characters/dmytro/${e}.webp`]),
  ),
  [SAMPLE_ASSETS.background]: 'backgrounds/meeting-room.webp',
  [SAMPLE_ASSETS.learner]: 'avatars/learner-06.webp',
}

export const SAMPLE_ASSET_SOURCES = SOURCES

/** Puts the sample's pictures into the in-memory media. Ones already there are
 *  kept: replacing a picture revokes the URL a mounted preview still shows
 *  (the sample is opened again when the language changes). A picture that
 *  fails to load is skipped (the sample just shows without it). */
export async function preloadSampleAssets(): Promise<void> {
  await Promise.all(
    Object.entries(SOURCES).map(async ([path, source]) => {
      if (getMemoryAsset(path)) return
      try {
        const res = await fetch(libraryUrl(source))
        // Checked again after the wait: a parallel call (React StrictMode runs
        // effects twice in dev) may have stored it, and a picture already on
        // screen must keep its URL.
        if (res.ok) {
          const blob = await res.blob()
          if (!getMemoryAsset(path)) putMemoryAsset(path, blob)
        }
      } catch {
        // offline or missing: keep going
      }
    }),
  )
}
