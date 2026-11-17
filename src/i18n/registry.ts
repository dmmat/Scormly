import type { Language, LocaleTable } from './types'

// The tables translate() and useT() read: namespace -> language -> key -> text.
// In the app they fill up as src/i18n/load.ts brings in the chunks a view needs
// (one language at a time); tests and build scripts register the whole
// dictionary at once (src/i18n/dictionary.ts).
export const TABLES: Record<string, Partial<LocaleTable> | undefined> = {}

export function registerTables(tables: Record<string, LocaleTable>): void {
  for (const [ns, table] of Object.entries(tables)) TABLES[ns] = { ...TABLES[ns], ...table }
}

/** One language's strings for several namespaces. */
export function registerLanguage(lang: Language, tables: Record<string, Record<string, string>>): void {
  for (const [ns, strings] of Object.entries(tables)) TABLES[ns] = { ...TABLES[ns], [lang]: strings }
}
