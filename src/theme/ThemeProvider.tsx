import type { ReactNode } from 'react'
import { useCourseStore } from '../store/courseStore'

// Applies the project's global theme via data-theme on the root container.
// CSS variables (index.css) cascade down to the entire editor interface.
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useCourseStore((s) => s.course.theme)
  return (
    <div data-theme={theme} className="flex h-full flex-col">
      {children}
    </div>
  )
}
