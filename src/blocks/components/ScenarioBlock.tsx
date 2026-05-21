import type { ChangeEvent } from 'react'
import type { BlockComponentProps } from '../types'
import type {
  BlockOfType,
  ScenarioChoice,
  ScenarioEmotion,
  ScenarioNode,
} from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { uid } from '../../lib/id'
import { useT } from '../../i18n/I18nProvider'

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
  const { characterName, characterImages, startNodeId, nodes } = block.data

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

  function setCharacterImage(
    emotion: ScenarioEmotion,
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      // TODO (Phase 3): assets/ — for now read as a data URL for preview.
      update(lessonId, block.id, {
        characterImages: { ...characterImages, [emotion]: String(reader.result) },
      })
    }
    reader.readAsDataURL(file)
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
    const choice: ScenarioChoice = { id: uid('choice'), text: '', nextNodeId: null }
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

  // ── Compact preview (when not selected) ──
  if (!selected) {
    const start = nodes.find((n) => n.id === startNodeId) ?? nodes[0]
    return (
      <div className="interactive-surface border border-gray-200 bg-white p-4">
        {start ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              {characterName || t('characterDefault')}
            </p>
            <p className="leading-relaxed text-gray-800">
              {start.text || t('characterLine')}
            </p>
            <div className="flex flex-col gap-2">
              {start.choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="btn-secondary text-left"
                >
                  {c.text || t('choiceDefault')}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">{t('emptyScenario')}</p>
        )}
      </div>
    )
  }

  // ── Editor ──
  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="space-y-4">
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
            {t('characterImages')}
          </span>
          <div className="flex flex-wrap gap-3">
            {EMOTIONS.map(({ value, emoji, labelKey }) => (
              <label
                key={value}
                className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-600"
              >
                <span aria-hidden>{emoji}</span>
                <span>{t(labelKey)}</span>
                {characterImages[value] && (
                  <img
                    src={characterImages[value]}
                    alt=""
                    className="h-8 w-8 rounded object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCharacterImage(value, e)}
                  className="max-w-[8rem] text-xs"
                />
              </label>
            ))}
          </div>
        </div>
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
