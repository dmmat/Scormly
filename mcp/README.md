# Scormly MCP server

A local [Model Context Protocol](https://modelcontextprotocol.io) server that
lets AI clients (Claude Desktop, Claude Code, Cursor, …) author **Scormly**
courses. It works directly on a Scormly project folder (`project.json` +
`assets/`) and can build SCORM 1.2 / 2004 and cmi5 packages, the same ones the
builder exports.

Everything stays local: the server talks to the client over stdio and only
reads and writes the project folder you point it at (plus the export zip).

## Install and build

The server lives in the Scormly repository and reuses the app's own code
(`src/export/*` manifests and packaging, `src/export/courseCheck.ts`,
`src/lib/agentGuide.ts`) and player (`public/scorm-player/`), so run it from a
checkout:

```bash
git clone https://github.com/dmmat/Scormly.git
cd Scormly/mcp
npm install
npm run build        # type check + bundle to dist/index.js
npm test             # tool handler tests (vitest)
```

Run it (it waits for an MCP client on stdin/stdout):

```bash
node dist/index.js --project /path/to/my-course
# or: SCORMLY_PROJECT=/path/to/my-course node dist/index.js
# or: npm link, then: scormly-mcp --project /path/to/my-course
```

The project folder is optional at startup: without one (or if it has no
`project.json` yet), the client can call `create_project` or `open_project`.

## Client configuration

Use absolute paths.

**Claude Desktop** — `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "scormly": {
      "command": "node",
      "args": [
        "/path/to/Scormly/mcp/dist/index.js",
        "--project",
        "/path/to/my-course"
      ]
    }
  }
}
```

**Claude Code**:

```bash
claude mcp add scormly -- node /path/to/Scormly/mcp/dist/index.js --project /path/to/my-course
```

**Cursor** — `.cursor/mcp.json` uses the same `mcpServers` shape as Claude
Desktop.

## Tools

| Tool | What it does |
| --- | --- |
| `open_project` | Switch to an existing project folder. |
| `create_project` | Create a project (`project.json` + `AGENTS.md`) in a new or empty folder and switch to it. |
| `get_course` | The full `project.json`, or an outline with `summary: true`. |
| `list_lessons` / `get_lesson` | Lesson ids, titles, status; one lesson with all block data. |
| `add_lesson` / `update_lesson` / `delete_lesson` / `move_lesson` | Manage lessons (title, status, order). |
| `add_block` | Add a block of any type to a lesson. `data` is validated against the block type; missing fields get defaults and nested ids (quiz options, tabs, scenario nodes…) are generated. Unknown types or fields are rejected. |
| `update_block` | Shallow-merge `data` (arrays are replaced) and `settings`, then re-validate. |
| `delete_block` / `move_block` | Remove a block; move it within or across lessons. |
| `update_course` | Title, description, cover image, theme, and completion / scoring / navigation / player settings. |
| `check_course` | The builder's pre-export checks, in plain English. |
| `add_asset` | Copy a local image / video / audio file into `assets/…` and return the path to put in a block. |
| `export_package` | Build a `scorm2004` (default), `scorm12` or `cmi5` zip — next to the project folder, or at `outputPath` (a `.zip` path or a folder). |

Resource: `scormly://agent-guide` — the project guide (the `AGENTS.md` written
into projects) documenting `project.json` and every block type.

## How it behaves

- Every tool call re-reads `project.json`, and calls run one at a time, so edits
  made in the builder meanwhile are kept.
- Writes are atomic (temp file + rename), formatted as 2-space JSON like the app.
- `.scormly-history.json` (the builder's undo history) is never touched.
- `add_asset` copies files as-is; unlike uploads in the builder, large images are
  not downscaled.

## Working alongside the builder

You can keep the project open in the Scormly builder while an AI client edits
it: the builder watches `project.json` and **reloads external changes**
automatically (the reload is undoable with Ctrl/Cmd+Z). If you have unsaved
edits at that moment, it shows a toast offering **Reload from disk** instead.
