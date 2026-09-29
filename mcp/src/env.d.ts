// The shared app code (../src/export/packageCommon.ts) reads Vite's
// import.meta.env in its browser-only fetchPlayerFile, which the MCP server
// never calls. Declare just enough for it to type-check without Vite.
interface ImportMeta {
  readonly env: { readonly BASE_URL: string }
}
