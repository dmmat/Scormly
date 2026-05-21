import type { PreviewProps } from '../types'

export default function QuotePreview({ block }: PreviewProps<'quote'>) {
  const { text, author } = block.data
  return (
    <blockquote className="border-l-4 border-brand pl-4 italic text-gray-700">
      {text}
      {author && (
        <footer className="mt-2 text-sm not-italic text-gray-500">— {author}</footer>
      )}
    </blockquote>
  )
}
