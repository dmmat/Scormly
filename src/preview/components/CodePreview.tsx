import type { PreviewProps } from '../types'

export default function CodePreview({ block }: PreviewProps<'code'>) {
  const { code, language } = block.data
  return (
    <div className="space-y-1">
      {language && (
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {language}
        </div>
      )}
      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}
