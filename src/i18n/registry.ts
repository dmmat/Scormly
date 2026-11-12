import type { LocaleTable } from './types'
import landing from './locales/landing'
import demo from './locales/demo'

// The tables translate() and useT() read. The landing page needs only its own
// two namespaces, so those are here from the start; the full dictionary
// (./dictionary, ~200 kB of strings) registers itself when the builder or a
// learner-block demo loads it.
export const TABLES: Record<string, LocaleTable | undefined> = { landing, demo }

export function registerTables(tables: Record<string, LocaleTable>): void {
  Object.assign(TABLES, tables)
}
