import { useEffect, useRef, type CSSProperties } from 'react'
import {
  MapPin,
  Music,
  Package,
  Quote,
  Sparkles,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { CHAPTERS } from '../data/chapters'
import type { ArtifactKind, ChapterId, Ofrenda } from '../types'
import { cx, prefersReducedMotion } from '../lib/utils'
import { Marigold } from './Marigold'
import { PapelPicado } from './PapelPicado'

const ICONS: Record<ArtifactKind, LucideIcon> = {
  food: Utensils,
  song: Music,
  place: MapPin,
  saying: Quote,
  object: Package,
  moment: Sparkles,
}

const CANDLE_HEIGHTS = [92, 116, 100, 126, 108, 96]
const PETALS = [
  { left: '6%', bottom: '4%', rotate: '-18deg', scale: 0.9 },
  { left: '14%', bottom: '2%', rotate: '24deg', scale: 0.7 },
  { left: '23%', bottom: '6%', rotate: '-8deg', scale: 1 },
  { left: '32%', bottom: '3%', rotate: '16deg', scale: 0.8 },
  { left: '42%', bottom: '7%', rotate: '-26deg', scale: 0.9 },
  { left: '52%', bottom: '4%', rotate: '10deg', scale: 0.7 },
  { left: '61%', bottom: '6%', rotate: '-14deg', scale: 1 },
  { left: '70%', bottom: '2%', rotate: '22deg', scale: 0.8 },
  { left: '79%', bottom: '5%', rotate: '-20deg', scale: 0.9 },
  { left: '88%', bottom: '3%', rotate: '12deg', scale: 0.7 },
  { left: '95%', bottom: '6%', rotate: '-10deg', scale: 0.8 },
]

export function OfrendaScene({
  ofrenda,
  onOpenMemory,
  highlight,
}: {
  ofrenda: Ofrenda
  onOpenMemory: (chapter: ChapterId) => void
  highlight?: ChapterId | null
}) {
  const stageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return

    let frame = 0
    const onMove = (event: MouseEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        stage.style.setProperty('--tilt-x', `${(-y * 2).toFixed(2)}deg`)
        stage.style.setProperty('--tilt-y', `${(x * 2.8).toFixed(2)}deg`)
      })
    }
    const onLeave = () => {
      stage.style.setProperty('--tilt-x', '0deg')
      stage.style.setProperty('--tilt-y', '0deg')
    }

    stage.addEventListener('mousemove', onMove)
    stage.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      stage.removeEventListener('mousemove', onMove)
      stage.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const lit = CHAPTERS.filter((chapter) => {
    const entry = ofrenda.entries.find((item) => item.id === chapter.id)
    return Boolean(entry && !entry.skipped && entry.answer.trim())
  }).length

  const offerings = CHAPTERS.flatMap((chapter) => {
    const entry = ofrenda.entries.find((item) => item.id === chapter.id)
    if (!entry || entry.skipped || !entry.artifact || !entry.answer.trim()) return []
    return [{ chapter, artifact: entry.artifact }]
  })

  const initial = ofrenda.person.name.trim().charAt(0).toUpperCase() || '·'

  return (
    <section
      className="altar-stage"
      ref={stageRef}
      aria-label={`The ofrenda of ${ofrenda.person.name}`}
    >
      <PapelPicado className="altar-papel" flags={10} />

      <div className="altar-hud altar-hud-left mono">
        <span className="dot" /> Memory field · {String(lit).padStart(2, '0')} candles
      </div>
      <div className="altar-hud altar-hud-right mono">
        {lit} of 6 lit · 0 uploaded
      </div>

      <div className="altar-perspective">
        <div className="altar-wall" aria-hidden="true">
          <span className="wall-arch" />
          <span className="wall-glow" />
        </div>

        <div className="altar">
          <div className="altar-tier altar-tier-1">
            <div className="altar-shelf" aria-hidden="true" />
            <div className="altar-portrait">
              <div className="altar-halo" aria-hidden="true" />
              <div className="altar-frame">
                {ofrenda.person.photo ? (
                  <img
                    src={ofrenda.person.photo}
                    alt={`A portrait of ${ofrenda.person.name}`}
                  />
                ) : (
                  <span className="altar-initial">{initial}</span>
                )}
              </div>
              <div className="altar-plaque">
                <b>{ofrenda.person.name}</b>
                <span className="mono">
                  {[ofrenda.person.years, ofrenda.person.relation].filter(Boolean).join(' · ')}
                </span>
              </div>
            </div>
            <div className="altar-flowers altar-flowers-left" aria-hidden="true">
              <Marigold size={38} />
              <Marigold size={24} />
            </div>
            <div className="altar-flowers altar-flowers-right" aria-hidden="true">
              <Marigold size={26} />
              <Marigold size={40} />
            </div>
          </div>

          <div className="altar-tier altar-tier-2">
            <div className="altar-shelf" aria-hidden="true" />
            <div className="altar-garland" aria-hidden="true">
              {Array.from({ length: 11 }).map((_, index) => (
                <Marigold
                  key={index}
                  size={index % 3 === 0 ? 30 : index % 3 === 1 ? 22 : 26}
                  className="garland-flower"
                />
              ))}
            </div>
            <div className="altar-candles">
              {CHAPTERS.map((chapter, index) => {
                const entry = ofrenda.entries.find((item) => item.id === chapter.id)
                const isLit = Boolean(entry && !entry.skipped && entry.answer.trim())
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    className={cx(
                      'altar-candle',
                      isLit ? 'is-lit' : 'is-dark',
                      highlight === chapter.id && 'is-highlighted',
                    )}
                    style={{ '--candle-h': `${CANDLE_HEIGHTS[index]}px` } as CSSProperties}
                    onClick={() => onOpenMemory(chapter.id)}
                    disabled={!isLit}
                    aria-label={
                      isLit
                        ? `Read the ${chapter.label} memory`
                        : `${chapter.label}: this candle is not lit`
                    }
                  >
                    <span className="candle-stick">
                      <span className="candle-wax">
                        {isLit && (
                          <span
                            className="candle-flame"
                            style={{ animationDelay: `${index * -0.55}s` }}
                          />
                        )}
                        <span className="candle-wick" />
                      </span>
                      <span className="candle-base" />
                    </span>
                    <span className="candle-label mono">{chapter.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="altar-tier altar-tier-3">
            <div className="altar-shelf" aria-hidden="true" />
            <div className="altar-water" title="Water, for the thirst of the journey">
              <svg viewBox="0 0 36 54" aria-hidden="true">
                <path
                  d="M8 7h20l-2.4 38.2c-.1 1.8-1.6 3.3-3.5 3.3h-8.2c-1.9 0-3.4-1.5-3.5-3.3L8 7Z"
                  fill="rgba(155,139,255,.08)"
                  stroke="rgba(243,234,216,.28)"
                  strokeWidth="1"
                />
                <path d="M8.7 22h18.6" stroke="rgba(243,234,216,.2)" strokeWidth="1" />
                <path
                  d="M10 29c5 2.2 11 2.2 16 0v9.5c-5 2.2-11 2.2-16 0V29Z"
                  fill="rgba(155,139,255,.13)"
                />
              </svg>
              <span className="mono">agua</span>
            </div>

            <div className="altar-fruit" title="Fruit, for the sweetness of being here">
              <svg viewBox="0 0 56 42" aria-hidden="true">
                <path
                  d="M6 19h44c-2.5 12-10.5 18-22 18S8.5 31 6 19Z"
                  fill="rgba(247,196,108,.05)"
                  stroke="rgba(243,234,216,.24)"
                  strokeWidth="1"
                />
                <circle cx="18" cy="15" r="6.2" fill="#ff8f3e" fillOpacity=".4" stroke="rgba(255,143,62,.4)" />
                <circle cx="31" cy="11" r="7" fill="#f7c46c" fillOpacity=".32" stroke="rgba(247,196,108,.35)" />
                <circle cx="44" cy="15" r="5.4" fill="#ff5d47" fillOpacity=".3" stroke="rgba(255,93,71,.35)" />
              </svg>
              <span className="mono">fruta</span>
            </div>

            <div className="altar-offerings">
              {offerings.length === 0 ? (
                <p className="altar-empty">The plate is still empty.</p>
              ) : (
                offerings.map(({ chapter, artifact }) => {
                  const Icon = ICONS[artifact.kind]
                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      className="offering-token"
                      onClick={() => onOpenMemory(chapter.id)}
                      aria-label={`Read the memory behind ${artifact.label}`}
                    >
                      <span className="offering-icon">
                        <Icon size={15} />
                      </span>
                      <span className="offering-text">
                        <small className="mono">{artifact.kind}</small>
                        {artifact.label}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            <div className="altar-path" aria-hidden="true">
              {PETALS.map((petal, index) => (
                <span
                  key={index}
                  className="petal"
                  style={
                    {
                      left: petal.left,
                      bottom: petal.bottom,
                      transform: `rotate(${petal.rotate}) scale(${petal.scale})`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          </div>

          <div className="altar-pillars" aria-hidden="true" />
        </div>
      </div>

      <p className="altar-hint mono">
        {lit > 0
          ? 'Click a lit candle or an offering to read its memory'
          : 'No candles are lit yet — the altar is waiting'}
      </p>
    </section>
  )
}
