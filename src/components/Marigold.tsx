import { cx } from '../lib/utils'

export function Marigold({
  size = 28,
  className,
  stem = false,
}: {
  size?: number
  className?: string
  stem?: boolean
}) {
  return (
    <svg
      className={cx('marigold', className)}
      width={stem ? size * 0.7 : size}
      height={stem ? size * 1.7 : size}
      viewBox={stem ? '0 0 44 108' : '0 0 64 64'}
      aria-hidden="true"
      focusable="false"
    >
      {stem && (
        <>
          <path d="M22 62v42" stroke="#5c6b4b" strokeWidth="2" />
          <path d="M22 78c-10-2-14-8-14-14 8 0 12 4 14 10Z" fill="#66784f" />
          <path d="M22 88c10-2 14-8 14-14-8 0-12 4-14 10Z" fill="#5c6b4b" />
        </>
      )}
      <g transform={stem ? 'translate(0 14) scale(0.62)' : undefined}>
        {Array.from({ length: 12 }).map((_, index) => (
          <ellipse
            key={index}
            cx="32"
            cy="13"
            rx="7.4"
            ry="12.4"
            transform={`rotate(${index * 30} 32 32)`}
            fill={index % 2 === 0 ? '#ff9a45' : '#f7c46c'}
            opacity="0.92"
          />
        ))}
        {Array.from({ length: 8 }).map((_, index) => (
          <ellipse
            key={`inner-${index}`}
            cx="32"
            cy="21"
            rx="4.2"
            ry="7"
            transform={`rotate(${index * 45 + 20} 32 32)`}
            fill={index % 2 === 0 ? '#ff7d31' : '#ffb95c'}
            opacity="0.95"
          />
        ))}
        <circle cx="32" cy="32" r="8.6" fill="#7e3410" />
        <circle cx="32" cy="32" r="5.4" fill="#c46225" />
        <circle cx="30" cy="30" r="2" fill="#ffd18a" opacity="0.8" />
      </g>
    </svg>
  )
}
