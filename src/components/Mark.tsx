export function Mark({ className = '' }: { className?: string }) {
  return <svg className={`brand-mark ${className}`} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    {[0, 60, 120].map((angle) => <ellipse key={angle} cx="32" cy="32" rx="11" ry="27" stroke="currentColor" strokeWidth="3.2" transform={`rotate(${angle} 32 32)`} />)}
  </svg>
}
