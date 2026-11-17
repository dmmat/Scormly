// Answered by scripts/localeChunks.ts: one language's strings for a group of
// namespaces, as { namespace: { key: text } }.
declare module 'virtual:locale/*' {
  const tables: Record<string, Record<string, string>>
  export default tables
}
