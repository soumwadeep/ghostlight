import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="wrap section not-found">
      <p className="eyebrow">404</p>
      <h1 className="display">This candle isn’t here.</h1>
      <p className="lede">The link may have moved, or the archive was deleted from this browser.</p>
      <Link to="/" className="btn btn-primary">Return to the light</Link>
    </div>
  )
}
