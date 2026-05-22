import { useEffect, useRef, useState } from 'react'
import type { PreviewProps } from '../types'
import type { ScenarioChoice, ScenarioEmotion } from '../../types/course'
import { useT } from '../../i18n/I18nProvider'
import { useAssetUrl } from '../../hooks/useAssetUrl'

export default function ScenarioPreview({ block }: PreviewProps<'scenario'>) {
  const { t } = useT('preview')
  const data = block.data
  const { nodes, startNodeId, characterName, characterImages } = data

  // Resolve all emotion avatars up front (a fixed set, so hooks are stable).
  const avatars: Record<ScenarioEmotion, string> = {
    neutral: useAssetUrl(characterImages.neutral ?? ''),
    happy: useAssetUrl(characterImages.happy ?? ''),
    concerned: useAssetUrl(characterImages.concerned ?? ''),
  }
  const userAvatar = useAssetUrl(data.userAvatar ?? '')

  if ((data.layout ?? 'classic') === 'chat') {
    return (
      <ChatScenario
        nodes={nodes}
        startNodeId={startNodeId}
        characterName={characterName}
        avatars={avatars}
        userAvatar={userAvatar}
        endLabel={t('end')}
        restartLabel={t('restart')}
      />
    )
  }

  return (
    <ClassicScenario
      nodes={nodes}
      startNodeId={startNodeId}
      characterName={characterName}
      avatars={avatars}
      endLabel={t('end')}
      restartLabel={t('restart')}
    />
  )
}

interface ScenarioViewProps {
  nodes: PreviewProps<'scenario'>['block']['data']['nodes']
  startNodeId: string
  characterName: string
  avatars: Record<ScenarioEmotion, string>
  userAvatar?: string
  endLabel: string
  restartLabel: string
}

function ClassicScenario({
  nodes,
  startNodeId,
  characterName,
  avatars,
  endLabel,
  restartLabel,
}: ScenarioViewProps) {
  const [nodeId, setNodeId] = useState<string | null>(startNodeId)
  const [emotion, setEmotion] = useState<ScenarioEmotion>(
    () => nodes.find((n) => n.id === startNodeId)?.emotion ?? 'neutral',
  )
  const node = nodeId ? nodes.find((n) => n.id === nodeId) : undefined
  const image = avatars[emotion]

  function choose(c: ScenarioChoice) {
    if (c.setEmotion) setEmotion(c.setEmotion)
    else {
      const next = c.nextNodeId ? nodes.find((n) => n.id === c.nextNodeId) : undefined
      if (next) setEmotion(next.emotion)
    }
    setNodeId(c.nextNodeId)
  }

  function restart() {
    setNodeId(startNodeId)
    setEmotion(nodes.find((n) => n.id === startNodeId)?.emotion ?? 'neutral')
  }

  return (
    <div className="interactive-surface border border-gray-200 bg-white p-5">
      <div className="flex items-start gap-4">
        {image && (
          <img
            src={image}
            alt={characterName}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-sm font-semibold text-brand-dark">{characterName}</p>
          {node ? (
            <>
              <p className="mb-4 leading-relaxed text-gray-800">{node.text}</p>
              <div className="flex flex-col gap-2">
                {node.choices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => choose(c)}
                    className="btn-secondary text-left"
                  >
                    {c.text}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="font-medium text-gray-500">{endLabel}</p>
              <button type="button" onClick={restart} className="btn-secondary text-sm">
                {restartLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ChatMessage {
  id: number
  from: 'bot' | 'user'
  text: string
  emotion: ScenarioEmotion
}

function ChatScenario({
  nodes,
  startNodeId,
  characterName,
  avatars,
  userAvatar,
  endLabel,
  restartLabel,
}: ScenarioViewProps) {
  const start = nodes.find((n) => n.id === startNodeId)
  const seqRef = useRef(0)
  const next = () => (seqRef.current += 1)

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    start ? [{ id: next(), from: 'bot', text: start.text, emotion: start.emotion }] : [],
  )
  const [nodeId, setNodeId] = useState<string | null>(startNodeId)
  const node = nodeId ? nodes.find((n) => n.id === nodeId) : undefined
  const bodyRef = useRef<HTMLDivElement>(null)

  // Keep the latest message in view as the conversation grows.
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  function choose(c: ScenarioChoice) {
    const target = c.nextNodeId ? nodes.find((n) => n.id === c.nextNodeId) : undefined
    const emotion = c.setEmotion ?? target?.emotion ?? 'neutral'
    setMessages((prev) => {
      const out = [...prev, { id: next(), from: 'user' as const, text: c.text, emotion }]
      if (target) out.push({ id: next(), from: 'bot', text: target.text, emotion: target.emotion })
      return out
    })
    setNodeId(c.nextNodeId)
  }

  function restart() {
    setMessages(start ? [{ id: next(), from: 'bot', text: start.text, emotion: start.emotion }] : [])
    setNodeId(startNodeId)
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col overflow-hidden rounded-3xl border border-gray-300 bg-gray-50 shadow-sm">
      <div className="flex items-center gap-3 bg-brand px-4 py-3 text-white">
        {avatars.neutral ? (
          <img src={avatars.neutral} alt={characterName} className="h-9 w-9 rounded-full object-cover ring-2 ring-white/40" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
            {(characterName || '?').slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="font-semibold">{characterName}</span>
      </div>

      <div ref={bodyRef} className="flex max-h-96 flex-col gap-2 overflow-y-auto px-3 py-4">
        {messages.map((m) =>
          m.from === 'bot' ? (
            <div key={m.id} className="flex items-end gap-2 self-start">
              {avatars[m.emotion] ? (
                <img src={avatars[m.emotion]} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="h-6 w-6 shrink-0 rounded-full bg-gray-300" />
              )}
              <p className="max-w-[16rem] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm leading-relaxed text-gray-800 shadow-sm">
                {m.text}
              </p>
            </div>
          ) : (
            <div key={m.id} className="flex items-end gap-2 self-end">
              <p className="max-w-[16rem] rounded-2xl rounded-br-sm bg-brand px-3 py-2 text-sm leading-relaxed text-white shadow-sm">
                {m.text}
              </p>
              {userAvatar && (
                <img src={userAvatar} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
              )}
            </div>
          ),
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-200 bg-white p-3">
        {node ? (
          node.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => choose(c)}
              className="rounded-full border border-brand/40 px-4 py-2 text-left text-sm font-medium text-brand-dark transition-colors hover:bg-brand/5"
            >
              {c.text}
            </button>
          ))
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-400">{endLabel}</span>
            <button type="button" onClick={restart} className="btn-secondary text-sm">
              {restartLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
