import type { LocaleTable } from '../types.ts'

// Copy for the landing's auto-playing chat demo. The scenarios themselves live
// in src/components/landing/demos/chatScenarios.ts as inline { en, uk }
// strings; only the replay button label is shared UI.
const demo: LocaleTable = {
  en: {
    chatReplay: 'Replay',
  },
  uk: {
    chatReplay: 'Спочатку',
  },
}

export default demo
