import { useEffect, useRef } from 'react'
import { cx, prefersReducedMotion } from '../lib/utils'

interface Particle {
  x: number
  y: number
  radius: number
  speed: number
  drift: number
  alpha: number
  phase: number
}

export function Embers({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = prefersReducedMotion()
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let frame = 0

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(44, Math.max(12, Math.floor(width / 34)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.5 + Math.random() * 1.3,
        speed: 0.8 + Math.random() * 2.2,
        drift: 4 + Math.random() * 12,
        alpha: 0.12 + Math.random() * 0.38,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height)
      for (const particle of particles) {
        const y = reduce
          ? particle.y
          : (((particle.y - time * 0.004 * particle.speed) % height) + height) % height
        const x = reduce
          ? particle.x
          : particle.x + Math.sin(time * 0.0004 + particle.phase) * particle.drift
        context.beginPath()
        context.arc(x, y, particle.radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(255, 190, 112, ${particle.alpha})`
        context.fill()
      }
      if (!reduce) frame = requestAnimationFrame(draw)
    }

    build()
    draw(0)

    const handleResize = () => {
      build()
      if (reduce) draw(0)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className={cx('embers', className)} aria-hidden="true" />
}
