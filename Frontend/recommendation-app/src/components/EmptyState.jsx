import './EmptyState.css'

export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <div className="empty-circle empty-circle--outer" />
        <div className="empty-circle empty-circle--mid" />
        <div className="empty-circle empty-circle--inner" />
        <div className="empty-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 7h20M4 14h14M4 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="21" cy="20" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M24 23l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="empty-content">
        <h3 className="empty-title">No recommendations yet</h3>
        <p className="empty-desc">
          Fill in a customer profile with purchase history, then hit{' '}
          <em>Get Recommendations</em> to see AI-powered product suggestions.
        </p>
      </div>

      <div className="empty-flow">
        <div className="flow-step">
          <span className="flow-num">1</span>
          <span>Enter customer name</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">
          <span className="flow-num">2</span>
          <span>Add purchase history</span>
        </div>
        <div className="flow-arrow">→</div>
        <div className="flow-step">
          <span className="flow-num">3</span>
          <span>Get recommendations</span>
        </div>
      </div>
    </div>
  )
}