#!/usr/bin/env node
// Scormly MCP server (stdio). Lets AI clients author a Scormly course by
// working on a project folder: scormly-mcp --project /path/to/folder
// (or SCORMLY_PROJECT=/path/to/folder). Without one, the client can call
// open_project / create_project.

import path from 'node:path'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { type Context, ToolError, isProjectDir, serialized } from './project'
import { TOOLS, agentGuideText } from './tools'

function projectArg(argv: string[]): string | undefined {
  const i = argv.findIndex((a) => a === '--project' || a === '-p')
  if (i !== -1) return argv[i + 1]
  const eq = argv.find((a) => a.startsWith('--project='))
  return eq ? eq.slice('--project='.length) : process.env.SCORMLY_PROJECT
}

async function main() {
  const dir = projectArg(process.argv.slice(2))
  const ctx: Context = { projectDir: dir ? path.resolve(dir) : null }
  // stdout is the MCP channel; diagnostics go to stderr.
  if (ctx.projectDir && !isProjectDir(ctx.projectDir)) {
    console.error(
      `[scormly-mcp] ${ctx.projectDir} has no project.json yet — call create_project to start one there.`,
    )
  }

  const server = new McpServer({ name: 'scormly', version: '0.1.0' })

  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.input },
      async (args: unknown) => {
        try {
          const result = await serialized(() => tool.handler(ctx, args))
          const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          return { content: [{ type: 'text' as const, text }] }
        } catch (err) {
          const message = err instanceof ToolError ? err.message : `Error: ${(err as Error).message}`
          return { content: [{ type: 'text' as const, text: message }], isError: true }
        }
      },
    )
  }

  server.registerResource(
    'agent-guide',
    'scormly://agent-guide',
    {
      title: 'Scormly agent guide',
      description: 'The project.json data model and every block type (the AGENTS.md written into projects).',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: 'text/markdown', text: await agentGuideText(ctx) }],
    }),
  )

  await server.connect(new StdioServerTransport())
}

main().catch((err) => {
  console.error('[scormly-mcp]', err)
  process.exit(1)
})
