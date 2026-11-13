import { LOGO_GLYPH } from './logoMark'

export default function Logo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="7" fill="#EC4899" />
        <path d={LOGO_GLYPH} fill="#fff" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-gray-900">
        Scorm<span className="text-brand">ly</span>
      </span>
    </div>
  )
}
