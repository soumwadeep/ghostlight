import { useId } from 'react'
import { cx } from '../lib/utils'

const COLORS = [
  '#f7c46c',
  '#ff8f3e',
  '#ff5d47',
  '#f7c46c',
  '#ffd48f',
  '#ff8f3e',
  '#f7c46c',
  '#ff5d47',
  '#ffb45a',
  '#ff8f3e',
]

const FLAG_WIDTH = 110
const FLAG_HEIGHT = 120
const VIEW_WIDTH = 1320

function Cutouts({ index }: { index: number }) {
  const variant = index % 3
  if (variant === 0) {
    return (
      <>
        <rect x="40" y="34" width="30" height="30" rx="2" transform="rotate(45 55 49)" />
        <circle cx="55" cy="76" r="7" />
        <path d="M26 30v44M84 30v44" stroke="black" strokeWidth="3" />
      </>
    )
  }
  if (variant === 1) {
    return (
      <>
        <circle cx="55" cy="45" r="11" />
        <path d="M23 72a9 9 0 0 1 18 0v9a9 9 0 0 1-18 0Z" />
        <path d="M69 72a9 9 0 0 1 18 0v9a9 9 0 0 1-18 0Z" />
        <path d="M26 30h58" stroke="black" strokeWidth="3" />
      </>
    )
  }
  return (
    <>
      <path d="M55 28l14 20-14 20-14-20Z" />
      <circle cx="31" cy="76" r="6" />
      <circle cx="79" cy="76" r="6" />
      <path d="M25 56h18M67 56h18" stroke="black" strokeWidth="3" />
      <path d="M55 17v4" stroke="black" strokeWidth="3" />
    </>
  )
}

export function PapelPicado({ className, flags = 8 }: { className?: string; flags?: number }) {
  const id = useId().replace(/:/g, '')
  const margin = 20
  const gap =
    flags > 1 ? Math.max(6, (VIEW_WIDTH - margin * 2 - flags * FLAG_WIDTH) / (flags - 1)) : 0

  return (
    <svg
      className={cx('papel', className)}
      viewBox={`0 0 ${VIEW_WIDTH} ${FLAG_HEIGHT}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 14C210 8 410 20 620 14s410-8 700 0"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
      />
      {Array.from({ length: flags }).map((_, index) => {
        const x = margin + index * (FLAG_WIDTH + gap)
        const maskId = `${id}-papel-${index}`
        const color = COLORS[index % COLORS.length]
        return (
          <g key={index} transform={`translate(${x} 0)`}>
            <g className="papel-flag" style={{ animationDelay: `${index * -0.7}s` }}>
              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={FLAG_WIDTH}
                height={FLAG_HEIGHT}
              >
                <path d="M0 16H110V86L55 118L0 86Z" fill="white" />
                <g fill="black">
                  <Cutouts index={index} />
                </g>
              </mask>
              <path d="M9 14v10M101 14v10" stroke={color} strokeOpacity="0.24" />
              <path
                d="M0 16H110V86L55 118L0 86Z"
                fill={color}
                fillOpacity="0.07"
                mask={`url(#${maskId})`}
              />
              <path
                d="M0 16H110V86L55 118L0 86Z"
                fill="none"
                stroke={color}
                strokeOpacity="0.38"
                strokeWidth="0.8"
              />
              <path d="M0 16h110" stroke={color} strokeOpacity="0.26" />
            </g>
          </g>
        )
      })}
    </svg>
  )
}
