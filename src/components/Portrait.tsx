import type { Person } from '../types'
import { cx } from '../lib/utils'

export function Portrait({
  person,
  size = 'md',
  className,
}: {
  person: Person
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const initial = person.name.trim().charAt(0).toUpperCase() || '·'
  return (
    <div className={cx('portrait', `portrait-${size}`, className)}>
      {person.photo ? (
        <img src={person.photo} alt={`A portrait of ${person.name}`} />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </div>
  )
}
