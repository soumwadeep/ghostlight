import { cx } from '../lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx('logo', className)}>
      <svg className="logo-mark" viewBox="0 0 40 48" aria-hidden="true" focusable="false">
        <path
          d="M9 44V23a11 11 0 0 1 22 0v21"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1.4"
        />
        <path
          d="M20 7c-3.5 5.6-7.3 9.6-7.3 15.6 0 5.3 3.3 8.7 7.3 8.7s7.3-3.4 7.3-8.7C27.3 16.6 23.5 12.6 20 7Z"
          fill="var(--amber)"
        />
        <path
          d="M20 21.5c-1.8 2.9-3.6 4.9-3.6 7.7 0 2.9 1.6 4.7 3.6 4.7s3.6-1.8 3.6-4.7c0-2.8-1.8-4.8-3.6-7.7Z"
          fill="#fff6df"
        />
        <path d="M12 44h16" stroke="var(--amber)" strokeOpacity="0.65" strokeLinecap="round" />
      </svg>
      <span className="logo-text">
        ghost<em>light</em>
      </span>
    </span>
  )
}
