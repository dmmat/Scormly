import { useState } from 'react'
import type { PreviewProps } from '../types'
import { useT } from '../../i18n/I18nProvider'
import { useAssetUrl } from '../../hooks/useAssetUrl'

export default function ScenarioPreview({ block }: PreviewProps<'scenario'>) {
  const { t } = useT('preview')
  const { nodes, startNodeId, characterName, characterImages } = block.data
  const [nodeId, setNodeId] = useState<string | null>(startNodeId)
  const [emotion, setEmotion] = useState(
    () => nodes.find((n) => n.id === startNodeId)?.emotion ?? 'neutral',
  )

  const node = nodeId ? nodes.find((n) => n.id === nodeId) : undefined
  const image = useAssetUrl(characterImages[emotion] ?? '')

  function choose(nextId: string | null, setEmotionTo?: typeof emotion) {
    if (setEmotionTo) setEmotion(setEmotionTo)
    else {
      const next = nextId ? nodes.find((n) => n.id === nextId) : undefined
      if (next) setEmotion(next.emotion)
    }
    setNodeId(nextId)
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
          <p className="mb-2 text-sm font-semibold text-brand-dark">
            {characterName}
          </p>
          {node ? (
            <>
              <p className="mb-4 leading-relaxed text-gray-800">{node.text}</p>
              <div className="flex flex-col gap-2">
                {node.choices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => choose(c.nextNodeId, c.setEmotion)}
                    className="btn-secondary text-left"
                  >
                    {c.text}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="font-medium text-gray-500">{t('end')}</p>
              <button type="button" onClick={restart} className="btn-secondary text-sm">
                {t('restart')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
