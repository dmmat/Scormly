import { useState } from 'react'
import type { PreviewProps } from '../types'
import { blankAnswers, scoreBlanks } from '../../blocks/fillBlanks'
import ScoreResult from './ScoreResult'
import { useMarkDone } from '../progress'
import BlanksText from './BlanksText'

export default function FillBlanksPreview({ block }: PreviewProps<'fillBlanks'>) {
  const { text, mode, passingScore, showAnswers = true, caseSensitive = false } = block.data
  const [responses, setResponses] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const markDone = useMarkDone()
  const [attempt, setAttempt] = useState(0)

  // Selected answers are always canonical; typed ones honour caseSensitive.
  const strict = mode === 'type' && caseSensitive
  const score = scoreBlanks(blankAnswers(text), responses, strict)

  function setResponse(i: number, value: string) {
    setResponses((prev) => {
      const next = prev.slice()
      next[i] = value
      return next
    })
  }

  function retry() {
    setResponses([])
    setSubmitted(false)
    setAttempt((a) => a + 1)
  }

  return (
    <div className="space-y-4">
      <BlanksText
        text={text}
        mode={mode}
        strict={strict}
        responses={responses}
        onChange={setResponse}
        submitted={submitted}
        reveal={submitted && showAnswers}
        attempt={attempt}
      />

      <ScoreResult
        submitted={submitted}
        score={score}
        passingScore={passingScore}
        onSubmit={() => {
          setSubmitted(true)
          markDone(block.id)
        }}
        onRetry={retry}
      />
    </div>
  )
}
