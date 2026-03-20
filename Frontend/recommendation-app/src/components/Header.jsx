import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="brand-mark">R</span>
          <div className="brand-text">
            <span className="brand-name">RecoEngine</span>
            <span className="brand-tagline">Purchase Intelligence</span>
          </div>
        </div>
        <div className="header-meta">
          <div className="api-badge">
            <span className="api-dot" />
            <span>POST /recommend</span>
          </div>
          <div className="version-tag">v1.0</div>
        </div>
      </div>
      <div className="header-rule" />
    </header>
  )
}