import { createContext, useContext } from 'react'

// Learner progress in the in-app preview: blocks report a finished task
// (answered quiz or exercise, submitted reflection, watched required video),
// so restricted Continue buttons below them unlock like in the SCORM player.
// Outside the preview (editor canvas) it is a no-op.
export const PreviewProgress = createContext<(blockId: string) => void>(() => {})

export function useMarkDone(): (blockId: string) => void {
  return useContext(PreviewProgress)
}
