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
        <path
          d="M20.5 11.2c-1-.9-2.5-1.5-4.2-1.5-2.9 0-4.9 1.5-4.9 3.8 0 2 1.4 3 4 3.6l1.4.3c1.3.3 1.8.7 1.8 1.4 0 .9-.9 1.4-2.3 1.4-1.5 0-2.7-.6-3.6-1.5l-1.9 2c1.2 1.4 3.1 2.2 5.4 2.2 3.1 0 5.2-1.6 5.2-4 0-2.1-1.4-3.1-4.1-3.7l-1.4-.3c-1.2-.3-1.7-.6-1.7-1.3 0-.8.8-1.3 2.1-1.3 1.3 0 2.4.5 3.2 1.3l1.9-1.9z"
          fill="#fff"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight text-gray-900">
        Scorm<span className="text-brand">ly</span>
      </span>
    </div>
  )
}
