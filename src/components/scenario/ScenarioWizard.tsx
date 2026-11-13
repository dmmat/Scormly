import { useEffect, useRef, useState } from 'react'
import type { BlockOfType, ScenarioChoice, ScenarioEmotion, ScenarioLayout, ScenarioNode } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useDialog } from '../../hooks/useDialog'
import { useT, translate } from '../../i18n/I18nProvider'
import { uid } from '../../lib/id'
import { toastUploadError } from '../../lib/assets'
import { importAvatar, importBackground, importCharacter, loadLibrary } from '../../lib/library'
import LibraryGrid from './LibraryGrid'

type Outcome = 'good' | 'neutral' | 'bad'
interface Answer {
  id: string
  text: string
  outcome: Outcome
  reply: string
}
type Step = 'layout' | 'character' | 'background' | 'avatar' | 'dialogue' | 'review'

const OUTCOME_EMOTION: Record<Outcome, ScenarioEmotion> = { good: 'happy', neutral: 'neutral', bad: 'concerned' }
const LAYOUTS: ScenarioLayout[] = ['classic', 'chat', 'scene']
const newAnswer = (outcome: Outcome): Answer => ({ id: uid('choice'), text: '', outcome, reply: '' })

// Step-by-step setup of a scenario: look, character, place / learner avatar and
// the first exchange. Applies everything in one undoable update.
export default function ScenarioWizard({
  block,
  lessonId,
  onClose,
}: {
  block: BlockOfType<'scenario'>
  lessonId: string
  onClose: () => void
}) {
  const { t, lang } = useT('scenario')
  const update = useCourseStore((s) => s.updateBlockData)
  const ref = useRef<HTMLDivElement>(null)
  // Esc and a click outside must not close the wizard (they would drop what was
  // typed); it is left only with the Cancel button or by finishing it.
  useDialog(ref, () => {})
  // The editor's own shortcuts (Esc deselects the block, Delete removes it, …)
  // must not reach the block behind the wizard; Tab and typing are unaffected.
  useEffect(() => {
    function swallow(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Delete' || e.key === 'Backspace' || e.ctrlKey || e.metaKey || e.altKey) {
        e.stopImmediatePropagation()
        if (e.key === 'Escape') e.preventDefault()
      }
    }
    window.addEventListener('keydown', swallow, true)
    return () => window.removeEventListener('keydown', swallow, true)
  }, [])

  const [layout, setLayout] = useState<ScenarioLayout>(block.data.layout ?? 'classic')
  const [characterId, setCharacterId] = useState<string | null>(null) // null = own character
  const [name, setName] = useState(block.data.characterName)
  const [backgroundId, setBackgroundId] = useState<string | null>(null)
  const [avatarId, setAvatarId] = useState<string | null>(null)
  const [opening, setOpening] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([newAnswer('good'), newAnswer('bad')])
  const [stepIndex, setStepIndex] = useState(0)
  const [busy, setBusy] = useState(false)

  const steps: Step[] = [
    'layout',
    'character',
    ...(layout === 'scene' ? (['background'] as const) : []),
    ...(layout === 'chat' ? (['avatar'] as const) : []),
    'dialogue',
    'review',
  ]
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const filled = answers.filter((a) => a.text.trim())
  const dialogueOk = opening.trim() !== '' && filled.length >= 2
  const canNext = step === 'dialogue' ? dialogueOk : true

  const { nodes } = block.data
  const hasContent =
    nodes.length > 1 || (nodes[0] !== undefined && nodes[0].text !== translate('content', 'scenarioNodeText'))

  async function selectCharacter(id: string) {
    setCharacterId(id)
    const library = await loadLibrary().catch(() => null)
    const c = library?.characters.find((x) => x.id === id)
    if (c) setName(c.name[lang])
  }

  function patchAnswer(id: string, patch: Partial<Answer>) {
    setAnswers((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  async function create() {
    setBusy(true)
    try {
      const data: Partial<BlockOfType<'scenario'>['data']> = { layout, characterName: name.trim() }
      if (characterId) {
        const library = await loadLibrary()
        const c = library.characters.find((x) => x.id === characterId)
        if (c) {
          const images = await importCharacter(c, layout === 'scene')
          if (layout === 'scene') data.sceneImages = images
          else data.characterImages = images
        }
      }
      if (layout === 'scene') data.background = backgroundId ? await importBackground(backgroundId) : undefined
      if (layout === 'chat') data.userAvatar = avatarId ? await importAvatar(avatarId) : undefined

      // One opening node; every answer leads to a reaction node that ends the
      // dialogue (more branches can be added in the editor).
      const startId = uid('node')
      const reactions: ScenarioNode[] = []
      const choices: ScenarioChoice[] = filled.map((a) => {
        let nextNodeId: string | null = null
        if (a.reply.trim()) {
          const reaction: ScenarioNode = { id: uid('node'), text: a.reply.trim(), emotion: OUTCOME_EMOTION[a.outcome], choices: [] }
          reactions.push(reaction)
          nextNodeId = reaction.id
        }
        return { id: a.id, text: a.text.trim(), nextNodeId }
      })
      data.startNodeId = startId
      data.nodes = [{ id: startId, text: opening.trim(), emotion: 'neutral', choices }, ...reactions]
      update(lessonId, block.id, data)
      onClose()
    } catch (err) {
      toastUploadError(err)
      setBusy(false)
    }
  }

  const layoutLabel = t(layout === 'classic' ? 'layoutClassic' : layout === 'chat' ? 'layoutChat' : 'layoutScene')
  const fieldClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 id="wizard-title" className="text-lg font-semibold text-gray-900">{t('wizTitle')}</h2>
          <span className="text-xs text-gray-500">{t('wizStep', { n: stepIndex + 1, total: steps.length })}</span>
        </div>
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-gray-100" aria-hidden>
          <div className="h-full bg-brand transition-all" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
        </div>

        <div className={`min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-1 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
          {step === 'layout' && (
            <>
              <h3 className="font-semibold text-gray-800">{t('wizLayoutTitle')}</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {LAYOUTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={layout === value}
                    onClick={() => setLayout(value)}
                    className={`rounded-xl border-2 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                      layout === value ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-gray-800">
                      {t(value === 'classic' ? 'layoutClassic' : value === 'chat' ? 'layoutChat' : 'layoutScene')}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {t(value === 'classic' ? 'wizLayoutClassicDesc' : value === 'chat' ? 'wizLayoutChatDesc' : 'wizLayoutSceneDesc')}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'character' && (
            <>
              <h3 className="font-semibold text-gray-800">{t('wizCharacterTitle')}</h3>
              <LibraryGrid kind="character" value={characterId} onSelect={selectCharacter} />
              <button
                type="button"
                aria-pressed={characterId === null}
                onClick={() => setCharacterId(null)}
                className={`w-full rounded-xl border-2 p-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  characterId === null ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="block font-semibold text-gray-800">{t('wizOwnCharacter')}</span>
                <span className="block text-xs text-gray-500">{t('wizOwnCharacterHelp')}</span>
              </button>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">{t('characterName')}</span>
                <input className={fieldClass} value={name} placeholder={t('characterDefault')} onChange={(e) => setName(e.target.value)} />
              </label>
            </>
          )}

          {step === 'background' && (
            <>
              <h3 className="font-semibold text-gray-800">{t('wizBackgroundTitle')}</h3>
              <LibraryGrid kind="background" value={backgroundId} onSelect={setBackgroundId} />
              <button type="button" onClick={() => setBackgroundId(null)} className="text-sm text-gray-500 underline hover:text-gray-700">
                {t('wizNoBackground')}
              </button>
            </>
          )}

          {step === 'avatar' && (
            <>
              <h3 className="font-semibold text-gray-800">{t('wizAvatarTitle')}</h3>
              <LibraryGrid kind="avatar" value={avatarId} onSelect={setAvatarId} />
              <button type="button" onClick={() => setAvatarId(null)} className="text-sm text-gray-500 underline hover:text-gray-700">
                {t('wizNoAvatar')}
              </button>
            </>
          )}

          {step === 'dialogue' && (
            <>
              <h3 className="font-semibold text-gray-800">{t('wizDialogueTitle')}</h3>
              <p className="text-sm text-gray-500">{t('wizDialogueHelp')}</p>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">{t('wizOpening')}</span>
                <textarea className={fieldClass} rows={2} value={opening} placeholder={t('wizOpeningPh')} onChange={(e) => setOpening(e.target.value)} />
              </label>
              {answers.map((a, i) => (
                <div key={a.id} className="space-y-2 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-700">{t('wizAnswerN', { n: i + 1 })}</span>
                    {answers.length > 2 && (
                      <button
                        type="button"
                        aria-label={t('deleteChoice')}
                        onClick={() => setAnswers((l) => l.filter((x) => x.id !== a.id))}
                        className="text-sm text-gray-400 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <input className={fieldClass} value={a.text} placeholder={t('wizAnswerPh')} onChange={(e) => patchAnswer(a.id, { text: e.target.value })} />
                  <textarea className={fieldClass} rows={2} value={a.reply} placeholder={t('wizReplyPh')} onChange={(e) => patchAnswer(a.id, { reply: e.target.value })} />
                  <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('wizOutcome')}>
                    <span className="text-xs text-gray-500">{t('wizOutcome')}:</span>
                    {(['good', 'neutral', 'bad'] as const).map((o) => (
                      <button
                        key={o}
                        type="button"
                        aria-pressed={a.outcome === o}
                        onClick={() => patchAnswer(a.id, { outcome: o })}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                          a.outcome === o ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {t(o === 'good' ? 'wizOutcomeGood' : o === 'neutral' ? 'wizOutcomeNeutral' : 'wizOutcomeBad')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {answers.length < 5 && (
                <button
                  type="button"
                  onClick={() => setAnswers((l) => [...l, newAnswer('neutral')])}
                  className="rounded-md px-3 py-2 text-sm font-medium text-brand hover:bg-brand/10"
                >
                  {t('wizAddAnswer')}
                </button>
              )}
              {!dialogueOk && <p className="text-xs text-gray-500">{t('wizNeedDialogue')}</p>}
            </>
          )}

          {step === 'review' && (
            <>
              <h3 className="font-semibold text-gray-800">{t('wizReviewTitle')}</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>{t('layout')}: <b>{layoutLabel}</b></li>
                <li>{t('characterName')}: <b>{name.trim() || t('characterDefault')}</b></li>
                {layout === 'scene' && <li>{t('background')}: <b>{backgroundId ?? t('wizNone')}</b></li>}
                {layout === 'chat' && <li>{t('userAvatar')}: <b>{avatarId ?? t('wizNone')}</b></li>}
                <li>{t('wizAnswersCount', { n: filled.length })}</li>
              </ul>
              {hasContent && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{t('wizReplaceWarn')}</p>}
            </>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button type="button" disabled={busy} onClick={onClose} className="btn-secondary text-sm">{t('wizCancel')}</button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button type="button" disabled={busy} onClick={() => setStepIndex(stepIndex - 1)} className="btn-secondary text-sm">
                {t('wizBack')}
              </button>
            )}
            {step === 'review' ? (
              <button type="button" disabled={busy || !dialogueOk} onClick={create} className="btn-primary text-sm">
                {busy ? t('wizCreating') : t('wizCreate')}
              </button>
            ) : (
              <button type="button" disabled={!canNext} onClick={() => setStepIndex(stepIndex + 1)} className="btn-primary text-sm">
                {t('wizNext')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
