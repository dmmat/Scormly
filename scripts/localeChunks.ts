import type { Plugin } from 'vite'
import { DICTIONARY } from '../src/i18n/dictionary.ts'
import { LOCALE_GROUPS, type LocaleGroup } from '../src/i18n/groups.ts'
import type { Language } from '../src/i18n/types.ts'

// The interface strings live in src/i18n/locales/<namespace>.ts, each with
// every language side by side (easy to translate and to test). A visitor needs
// one language, so the app does not import those files: it imports
// `virtual:locale/<group>/<lang>`, which this plugin answers with just that
// language's strings for the group's namespaces (see src/i18n/load.ts).
//
// In a build that is a plain object, so each group x language becomes its own
// small chunk. In dev it re-exports from the real files, so editing a string
// updates the page as usual.
const PREFIX = 'virtual:locale/'
// The resolved id ends in a file-like name: the bundler names the chunk after it.
const resolved = (group: string, lang: string) => `\0locale-${group}-${lang}.js`

export function localeChunks(): Plugin {
  let build = false
  return {
    name: 'scormly-locale-chunks',
    configResolved(config) {
      build = config.command === 'build'
    },
    resolveId(id) {
      if (!id.startsWith(PREFIX)) return null
      const [group, lang] = id.slice(PREFIX.length).split('/')
      return resolved(group, lang)
    },
    load(id) {
      const m = /^\0locale-([a-z]+)-([a-z]+)\.js$/.exec(id)
      if (!m) return null
      const namespaces = LOCALE_GROUPS[m[1] as LocaleGroup]
      const lang = m[2] as Language
      if (!namespaces) throw new Error(`localeChunks: unknown group "${m[1]}"`)
      if (build) {
        const tables = Object.fromEntries(namespaces.map((ns) => [ns, DICTIONARY[ns][lang]]))
        return `export default ${JSON.stringify(tables)}`
      }
      return [
        ...namespaces.map((ns, i) => `import t${i} from '/src/i18n/locales/${ns}.ts'`),
        `export default { ${namespaces.map((ns, i) => `${JSON.stringify(ns)}: t${i}[${JSON.stringify(lang)}]`).join(', ')} }`,
      ].join('\n')
    },
  }
}
