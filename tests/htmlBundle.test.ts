// Custom HTML blocks: .html / .zip uploads, path resolution and export of the
// whole site folder (src/lib/htmlBundle.ts, src/export/packageCommon.ts).

import { describe, test, expect, beforeEach } from 'vitest'
import JSZip from 'jszip'
import { htmlBundleDir, pickEntry, resolveRef, saveHtmlUpload, HtmlUploadError } from '../src/lib/htmlBundle'
import { addAssets } from '../src/export/packageCommon'
import { clearMemoryAssets, getMemoryAsset, memoryAssetPaths } from '../src/lib/assets'
import { buildAgentGuide, HTML_BLOCK_GUIDE } from '../src/lib/agentGuide'
import type { Course } from '../src/types/course'

async function zipFile(files: Record<string, string>, name = 'site.zip'): Promise<File> {
  const zip = new JSZip()
  for (const [p, c] of Object.entries(files)) zip.file(p, c)
  return new File([await zip.generateAsync({ type: 'arraybuffer' })], name)
}

const courseWith = (src: string) => ({
  id: 'c', title: 'C', description: '', theme: 'rose',
  lessons: [{ id: 'l', title: 'L', status: 'draft', blocks: [
    { id: 'b', type: 'html', settings: {}, data: { source: 'file', code: '', src, title: 'Widget' } },
  ] }],
}) as unknown as Course

describe('paths', () => {
  test('bundle folder of an entry page', () => {
    expect(htmlBundleDir('assets/html/html-1/index.html')).toBe('assets/html/html-1/')
    expect(htmlBundleDir('assets/html/html-1/pages/a.html')).toBe('assets/html/html-1/')
    expect(htmlBundleDir('assets/images/a.png')).toBeNull()
  })

  test('entry: index.html nearest the root, else the shallowest page', () => {
    expect(pickEntry(['a/index.html', 'index.html', 'about.html'])).toBe('index.html')
    expect(pickEntry(['about.html', 'zeta.html', 'x/index.html'])).toBe('about.html')
    expect(pickEntry(['style.css'])).toBeUndefined()
  })

  test('relative references resolve inside the bundle', () => {
    expect(resolveRef('pages/a.html', '../css/s.css?v=2')).toBe('css/s.css')
    expect(resolveRef('index.html', './img/my%20pic.png')).toBe('img/my pic.png')
    expect(resolveRef('pages/a.html', '/data.json')).toBe('data.json')
    expect(resolveRef('index.html', 'https://cdn.example.com/x.js')).toBeNull()
    expect(resolveRef('index.html', 'data:image/png;base64,AA')).toBeNull()
    expect(resolveRef('index.html', '#top')).toBeNull()
  })
})

describe('uploads (no project folder: kept in memory)', () => {
  beforeEach(() => clearMemoryAssets())

  test('a single page becomes index.html of its own folder', async () => {
    const src = await saveHtmlUpload(new File(['<p>Hi</p>'], 'widget.html'))
    expect(src).toMatch(/^assets\/html\/[^/]+\/index\.html$/)
    expect(await getMemoryAsset(src)!.text()).toBe('<p>Hi</p>')
  })

  test('a zip is unpacked, dropping a single top folder and OS clutter', async () => {
    const src = await saveHtmlUpload(await zipFile({
      'site/index.html': '<script src="js/app.js"></script>',
      'site/js/app.js': 'void 0',
      'site/.DS_Store': '',
      '__MACOSX/site/._index.html': '',
    }))
    const dir = htmlBundleDir(src)!
    expect(src).toBe(`${dir}index.html`)
    expect(memoryAssetPaths().sort()).toEqual([`${dir}index.html`, `${dir}js/app.js`])
  })

  test('rejects other files and zips without a page', async () => {
    await expect(saveHtmlUpload(new File(['x'], 'notes.txt'))).rejects.toBeInstanceOf(HtmlUploadError)
    await expect(saveHtmlUpload(await zipFile({ 'a.css': '' }))).rejects.toMatchObject({ reason: 'noHtml' })
  })

  test('export ships the whole site folder, not other uploads', async () => {
    const src = await saveHtmlUpload(await zipFile({ 'index.html': '', 'img/a.png': 'png', 'data/q.json': '{}' }))
    await saveHtmlUpload(new File(['other'], 'other.html'))
    const dir = htmlBundleDir(src)!
    const added = await addAssets(new JSZip(), null, courseWith(src))
    expect(added.sort()).toEqual([`${dir}data/q.json`, `${dir}img/a.png`, `${dir}index.html`])
  })
})

describe('AI guide', () => {
  test('AGENTS.md documents the block and how to write its page', () => {
    const md = buildAgentGuide(courseWith(''))
    expect(md).toContain('#### `html`')
    expect(md).toContain('## Custom HTML blocks')
    expect(md).toContain(HTML_BLOCK_GUIDE)
    expect(HTML_BLOCK_GUIDE).toContain('relative')
  })
})
