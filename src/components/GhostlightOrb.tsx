const NODES = [
  { index: '01', label: 'Kitchen', angle: 205 },
  { index: '02', label: 'Song', angle: 235 },
  { index: '03', label: 'Place', angle: 305 },
  { index: '04', label: 'Saying', angle: 335 },
  { index: '05', label: 'Small', angle: 25 },
  { index: '06', label: 'Unfinished', angle: 115 },
]

const RADIUS = 40

function point(angle: number) {
  const radians = (angle * Math.PI) / 180
  return {
    x: 50 + RADIUS * Math.cos(radians),
    y: 50 + RADIUS * Math.sin(radians),
    rad: radians,
  }
}

const TICKS = Array.from({ length: 72 }, (_, index) => {
  const angle = (index * 5 * Math.PI) / 180
  const inner = index % 6 === 0 ? 43.4 : 45.1
  return {
    x1: 50 + inner * Math.cos(angle),
    y1: 50 + inner * Math.sin(angle),
    x2: 50 + 46 * Math.cos(angle),
    y2: 50 + 46 * Math.sin(angle),
    strong: index % 6 === 0,
  }
})

export function GhostlightOrb({ className }: { className?: string }) {
  return (
    <div className={className ? `orb ${className}` : 'orb'} aria-hidden="true">
      <div className="orb-glow" />

      <svg className="orb-rings" viewBox="0 0 100 100" focusable="false">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.14" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="0.12" />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.42"
          strokeWidth="0.28"
          strokeDasharray="22 267"
          strokeDashoffset="-30"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="var(--marigold)"
          strokeOpacity="0.5"
          strokeWidth="0.22"
          strokeDasharray="2 10"
          className="orb-spin"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="0.12"
          strokeDasharray="0.5 2.4"
        />
        {TICKS.map((tick, index) => (
          <line
            key={index}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="currentColor"
            strokeOpacity={tick.strong ? 0.42 : 0.16}
            strokeWidth={tick.strong ? 0.22 : 0.12}
          />
        ))}
        {NODES.map((node) => {
          const { x, y } = point(node.angle)
          return (
            <g key={node.index}>
              <line
                x1={x + Math.cos((node.angle * Math.PI) / 180) * 1.2}
                y1={y + Math.sin((node.angle * Math.PI) / 180) * 1.2}
                x2={50 + 35 * Math.cos((node.angle * Math.PI) / 180)}
                y2={50 + 35 * Math.sin((node.angle * Math.PI) / 180)}
                stroke="currentColor"
                strokeOpacity="0.09"
                strokeWidth="0.1"
              />
              <circle cx={x} cy={y} r="0.6" fill="var(--amber)" fillOpacity="0.8" />
              <circle cx={x} cy={y} r="1.6" fill="none" stroke="var(--amber)" strokeOpacity="0.22" strokeWidth="0.12" />
            </g>
          )
        })}
      </svg>

      {NODES.map((node) => {
        const { x, y } = point(node.angle)
        const side =
          y < 24 ? 'top' : y > 76 ? 'bottom' : x < 50 ? 'left' : 'right'
        return (
          <span
            key={node.index}
            className="orb-node"
            data-side={side}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <i />
            <b>
              <span>{node.index}</span> {node.label}
            </b>
          </span>
        )
      })}

      <div className="orb-lantern">
        <div className="lantern-handle" />
        <div className="lantern-body">
          <span className="lantern-shine" />
          <span className="lantern-flame" />
          <span className="lantern-core" />
        </div>
        <div className="lantern-base" />
      </div>

      <div className="orb-hud orb-hud-tl">
        <span>Memory field</span>
        <b>06 lights · 00 bytes</b>
      </div>
      <div className="orb-hud orb-hud-br">
        <span>Local inference</span>
        <b>No server · no key</b>
      </div>
      <div className="orb-coord">ARCHIVE 001 · NIGHT 04</div>
    </div>
  )
}
