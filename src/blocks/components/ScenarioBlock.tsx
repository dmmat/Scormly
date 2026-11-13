import { useState, type ChangeEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type {
  BlockOfType,
  ScenarioChoice,
  ScenarioEmotion,
  ScenarioNode,
} from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { uid } from '../../lib/id'
import { useT, translate } from '../../i18n/I18nProvider'
import { saveAsset, toastUploadError } from '../../lib/assets'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import { useLang } from '../../i18n/I18nProvider'
import { importAvatar, importBackground, importCharacter, loadLibrary } from '../../lib/library'
import LibraryPickerDialog from '../../components/scenario/LibraryPickerDialog'
import ScenarioPreview from '../../preview/components/ScenarioPreview'
import ScenarioWizard from '../../components/scenario/ScenarioWizard'
import type { LibraryKind } from '../../components/scenario/LibraryGrid'

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'

// labelKey — translation key for the emotion name (resolved via t() in the component).
const EMOTIONS: { value: ScenarioEmotion; emoji: string; labelKey: string }[] = [
  { value: 'neutral', emoji: '😐', labelKey: 'emotionNeutral' },
  { value: 'happy', emoji: '🙂', labelKey: 'emotionHappy' },
  { value: 'concerned', emoji: '😟', labelKey: 'emotionConcerned' },
]

export default function ScenarioBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'scenario'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('scenario')
  const { lang } = useLang()
  const [picker, setPicker] = useState<LibraryKind | null>(null)
  const [wizard, setWizard] = useState(false)
  const { characterName, characterImages, startNodeId, nodes, layout = 'classic', userAvatar, sceneImages, background } = block.data

  // Short label for a node by its id (for transition dropdowns).
  function nodeLabel(id: string | null): string {
    if (id == null) return t('finish')
    const i = nodes.findIndex((n) => n.id === id)
    return i === -1 ? t('unknownNode') : t('nodeN', { n: i + 1 })
  }

  function setNodes(next: ScenarioNode[], coalesceKey?: string) {
    update(lessonId, block.id, { nodes: next }, coalesceKey)
  }

  function setCharacterName(value: string) {
    update(
      lessonId,
      block.id,
      { characterName: value },
      `scenario-name-${block.id}`,
    )
  }

  function setStartNode(nodeId: string) {
    update(lessonId, block.id, { startNodeId: nodeId })
  }

  async function setCharacterImage(
    emotion: ScenarioEmotion,
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const src = await saveAsset(file, 'image')
      update(lessonId, block.id, {
        characterImages: { ...characterImages, [emotion]: src },
      })
    } catch (err) {
      toastUploadError(err)
    }
  }

  async function setScenePose(
    emotion: ScenarioEmotion,
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const src = await saveAsset(file, 'image')
      update(lessonId, block.id, { sceneImages: { ...sceneImages, [emotion]: src } })
    } catch (err) {
      toastUploadError(err)
    }
  }

  async function setBackground(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const src = await saveAsset(file, 'image')
      update(lessonId, block.id, { background: src })
    } catch (err) {
      toastUploadError(err)
    }
  }

  // Library picks copy the pictures into the project (one undo step each).
  async function pickFromLibrary(id: string) {
    if (picker === 'character') {
      const c = (await loadLibrary()).characters.find((x) => x.id === id)
      if (!c) return
      const images = await importCharacter(c, layout === 'scene')
      update(lessonId, block.id, {
        ...(layout === 'scene' ? { sceneImages: images } : { characterImages: images }),
        ...(characterName.trim() === '' || characterName === translate('content', 'scenarioCharacter')
          ? { characterName: c.name[lang] }
          : {}),
      })
    } else if (picker === 'avatar') {
      update(lessonId, block.id, { userAvatar: await importAvatar(id) })
    } else if (picker === 'background') {
      update(lessonId, block.id, { background: await importBackground(id) })
    }
  }

  async function setUserAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const src = await saveAsset(file, 'image')
      update(lessonId, block.id, { userAvatar: src })
    } catch (err) {
      toastUploadError(err)
    }
  }

  function patchNode(nodeId: string, patch: Partial<ScenarioNode>, key?: string) {
    setNodes(
      nodes.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)),
      key,
    )
  }

  function addNode() {
    const node: ScenarioNode = {
      id: uid('node'),
      text: '',
      emotion: 'neutral',
      choices: [],
    }
    setNodes([...nodes, node])
  }

  function removeNode(nodeId: string) {
    // When deleting a node, null out transitions from OTHER nodes that pointed
    // to it, to avoid dangling references.
    const next = nodes
      .filter((n) => n.id !== nodeId)
      .map((n) => ({
        ...n,
        choices: n.choices.map((c) =>
          c.nextNodeId === nodeId ? { ...c, nextNodeId: null } : c,
        ),
      }))
    // If we delete the start node, move the start to the first remaining one.
    const nextStart = startNodeId === nodeId ? (next[0]?.id ?? '') : startNodeId
    update(lessonId, block.id, { nodes: next, startNodeId: nextStart })
  }

  function patchChoice(
    nodeId: string,
    choiceId: string,
    patch: Partial<ScenarioChoice>,
    key?: string,
  ) {
    patchNode(
      nodeId,
      {
        choices: (nodes.find((n) => n.id === nodeId)?.choices ?? []).map((c) =>
          c.id === choiceId ? { ...c, ...patch } : c,
        ),
      },
      key,
    )
  }

  function addChoice(nodeId: string) {
    const choice: ScenarioChoice = {
      id: uid('choice'),
      text: translate('content', 'scenarioChoice'),
      nextNodeId: null,
    }
    patchNode(nodeId, {
      choices: [...(nodes.find((n) => n.id === nodeId)?.choices ?? []), choice],
    })
  }

  function removeChoice(nodeId: string, choiceId: string) {
    patchNode(nodeId, {
      choices: (nodes.find((n) => n.id === nodeId)?.choices ?? []).filter(
        (c) => c.id !== choiceId,
      ),
    })
  }

  // ── Learner view (when not selected): the same component as the preview ──
  if (!selected) {
    return nodes.length ? <ScenarioPreview block={block} /> : <p className="text-sm text-gray-400">{t('emptyScenario')}</p>
  }

  // ── Editor ──
  const images = layout === 'scene' ? (sceneImages ?? {}) : characterImages
  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4">
      {wizard && <ScenarioWizard block={block} lessonId={lessonId} onClose={() => setWizard(false)} />}
      {picker && <LibraryPickerDialog kind={picker} onPick={pickFromLibrary} onClose={() => setPicker(null)} />}
      <div className="space-y-4">
        <button type="button" onClick={() => setWizard(true)} className="btn-secondary text-sm">
          ✨ {t('wizOpen')}
        </button>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            {t('characterName')}
          </span>
          <input
            type="text"
            value={characterName}
            placeholder={t('characterDefault')}
            onChange={(e) => setCharacterName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>

        <div>
          <span className="mb-1 block text-xs font-medium text-gray-500">
            {t('layout')}
          </span>
          <div className="flex flex-wrap gap-2">
            {(['classic', 'chat', 'scene'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => update(lessonId, block.id, { layout: value })}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  layout === value
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t(value === 'classic' ? 'layoutClassic' : value === 'chat' ? 'layoutChat' : 'layoutScene')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1 block text-xs font-medium text-gray-500">
            {t(layout === 'scene' ? 'sceneImages' : 'characterImages')}
          </span>
          <button type="button" onClick={() => setPicker('character')} className="btn-secondary mb-2 text-sm">
            {t('libraryChoose')}
          </button>
          <div className="flex flex-wrap gap-3">
            {EMOTIONS.map(({ value, emoji, labelKey }) => (
              <label
                key={value}
                className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-600"
              >
                <span aria-hidden>{emoji}</span>
                <span>{t(labelKey)}</span>
                {images[value] && <CharacterThumb src={images[value]!} />}
                <input
                  type="file"
                  accept={IMAGE_ACCEPT}
                  onChange={(e) => (layout === 'scene' ? setScenePose(value, e) : setCharacterImage(value, e))}
                  className="max-w-[8rem] text-xs"
                />
              </label>
            ))}
          </div>
        </div>

        {layout === 'scene' && (
          <div>
            <span className="mb-1 block text-xs font-medium text-gray-500">
              {t('background')}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setPicker('background')} className="btn-secondary text-sm">
                {t('libraryChoose')}
              </button>
              <label className="flex w-fit items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-600">
                {background && <CharacterThumb src={background} />}
                <input
                  type="file"
                  accept={IMAGE_ACCEPT}
                  onChange={setBackground}
                  className="max-w-[8rem] text-xs"
                />
              </label>
              {background && (
                <button
                  type="button"
                  onClick={() => update(lessonId, block.id, { background: undefined })}
                  className="text-xs text-gray-500 underline hover:text-gray-700"
                >
                  {t('removeBackground')}
                </button>
              )}
            </div>
          </div>
        )}

        {layout === 'chat' && (
          <div>
            <span className="mb-1 block text-xs font-medium text-gray-500">
              {t('userAvatar')}
            </span>
            <button type="button" onClick={() => setPicker('avatar')} className="btn-secondary mb-2 text-sm">
              {t('libraryChoose')}
            </button>
            <label className="flex w-fit items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-600">
              {userAvatar && <CharacterThumb src={userAvatar} />}
              <input
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={setUserAvatar}
                className="max-w-[8rem] text-xs"
              />
            </label>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {nodes.map((node, index) => {
          const isStart = node.id === startNodeId
          return (
            <div
              key={node.id}
              className="space-y-3 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {t('nodeN', { n: index + 1 })}
                  </span>
                  {isStart ? (
                    <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      {t('startNode')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStartNode(node.id)}
                      className="rounded px-2 py-0.5 text-xs font-medium text-brand hover:bg-brand/10"
                    >
                      {t('makeStart')}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeNode(node.id)}
                  className="flex h-6 w-6 items-center justify-center rounded text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label={t('deleteNode')}
                >
                  ✕
                </button>
              </div>

              <textarea
                value={node.text}
                placeholder={t('characterLine')}
                rows={2}
                onChange={(e) =>
                  patchNode(
                    node.id,
                    { text: e.target.value },
                    `scenario-node-${node.id}`,
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />

              <div>
                <span className="mb-1 block text-xs font-medium text-gray-500">
                  {t('emotion')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map(({ value, emoji, labelKey }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => patchNode(node.id, { emotion: value })}
                      title={t(labelKey)}
                      className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm ${
                        node.emotion === value
                          ? 'bg-brand text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span aria-hidden>{emoji}</span>
                      <span className="text-xs">{t(labelKey)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {node.choices.map((choice) => (
                  <div
                    key={choice.id}
                    className="flex flex-wrap items-center gap-2 rounded-md border border-gray-100 bg-gray-50 p-3"
                  >
                    <input
                      type="text"
                      value={choice.text}
                      placeholder={t('choiceTextPlaceholder')}
                      onChange={(e) =>
                        patchChoice(
                          node.id,
                          choice.id,
                          { text: e.target.value },
                          `scenario-choice-${choice.id}`,
                        )
                      }
                      className="min-w-[8rem] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      {t('transition')}
                      <select
                        value={choice.nextNodeId ?? ''}
                        onChange={(e) =>
                          patchChoice(node.id, choice.id, {
                            nextNodeId: e.target.value || null,
                          })
                        }
                        className="rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:border-brand"
                      >
                        <option value="">{nodeLabel(null)}</option>
                        {nodes.map((n, i) => (
                          <option key={n.id} value={n.id}>
                            {t('nodeN', { n: i + 1 })}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      {t('emotion')}
                      <select
                        value={choice.setEmotion ?? ''}
                        onChange={(e) =>
                          patchChoice(node.id, choice.id, {
                            setEmotion:
                              (e.target.value as ScenarioEmotion) || undefined,
                          })
                        }
                        className="rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:border-brand"
                      >
                        <option value="">—</option>
                        {EMOTIONS.map(({ value, labelKey }) => (
                          <option key={value} value={value}>
                            {t(labelKey)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeChoice(node.id, choice.id)}
                      className="flex h-6 w-6 items-center justify-center rounded text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                      aria-label={t('deleteChoice')}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addChoice(node.id)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-brand hover:bg-brand/10"
                >
                  {t('addChoice')}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" onClick={addNode} className="btn-secondary">
        {t('addNode')}
      </button>
    </div>
  )
}

function CharacterThumb({ src }: { src: string }) {
  const url = useAssetUrl(src)
  return <img src={url} alt="" className="h-8 w-8 rounded object-cover" />
}
