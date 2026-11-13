import type { LocaleTable } from '../types.ts'

// Copy for the landing's auto-playing chat demo. The scenarios themselves live
// in src/components/landing/demos/chatScenarios.ts as inline per-language
// strings; only the replay button label is shared UI.
const demo: LocaleTable = {
  en: {
    chatReplay: 'Replay',
  },
  uk: {
    chatReplay: 'Спочатку',
  },
  fr: {
    chatReplay: 'Rejouer',
  },
  es: {
    chatReplay: 'Repetir',
  },
  de: {
    chatReplay: 'Wiederholen',
  },
}

export default demo
