import type { ReactNode } from 'react'
import { useCourseStore } from '../store/courseStore'
import { themeStyle } from './customTheme'

// Applies the project's global theme via data-theme on the root container.
// CSS variables (index.css) cascade down to the entire editor interface; a
// custom theme sets them inline.
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useCourseStore((s) => s.course.theme)
  const customTheme = useCourseStore((s) => s.course.customTheme)
  return (
    <div data-theme={theme} style={themeStyle({ theme, customTheme })} className="flex h-full flex-col">
      {children}
    </div>
  )
}
