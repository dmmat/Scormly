import { create } from 'zustand'

export type ToastTone = 'info' | 'success' | 'error'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
  action?: { label: string; onClick: () => void }
}

interface ToastState {
  toasts: Toast[]
  dismiss: (id: string) => void
}

const DURATION: Record<ToastTone, number> = { info: 6000, success: 4000, error: 9000 }
const MAX_VISIBLE = 3
const timers = new Map<string, ReturnType<typeof setTimeout>>()

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  dismiss: (id) => {
    clearTimeout(timers.get(id))
    timers.delete(id)
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

let seq = 0

/**
 * Show a transient notification. Passing an `id` replaces an existing toast
 * with the same id (e.g. repeated save failures show a single toast).
 */
export function toast(opts: Omit<Toast, 'id' | 'tone'> & { id?: string; tone?: ToastTone }): string {
  const id = opts.id ?? `t${++seq}`
  const next: Toast = { tone: 'info', ...opts, id }
  const { dismiss } = useToastStore.getState()
  clearTimeout(timers.get(id))
  useToastStore.setState((s) => ({
    toasts: [...s.toasts.filter((t) => t.id !== id), next].slice(-MAX_VISIBLE),
  }))
  timers.set(id, setTimeout(() => dismiss(id), DURATION[next.tone]))
  return id
}

export function dismissToast(id: string): void {
  useToastStore.getState().dismiss(id)
}
