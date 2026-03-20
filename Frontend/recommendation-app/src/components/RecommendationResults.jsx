import './RecommendationResults.css'

const CATEGORY_COLORS = {
  Electronics: { bg: '#e8f0fc', accent: '#2a5abf', icon: '⚡' },
  Books: { bg: '#f0ece0', accent: '#7a5c1e', icon: '📖' },
  Sports: { bg: '#e0f0ea', accent: '#1e7a4a', icon: '🏃' },
  Clothing: { bg: '#f0e8f8', accent: '#6a2abf', icon: '👕' },
  Home: { bg: '#faf0e0', accent: '#bf7a1e', icon: '🏠' },
  Beauty: { bg: '#fce8f0', accent: '#bf2a6a', icon: '✨' },
  Food: { bg: '#e8f8e8', accent: '#2abf4a', icon: '🌿' },
  Toys: { bg: '#fff0e0', accent: '#bf4a1e', icon: '🎲' },
}

const DEFAULT_COLOR = { bg: '#f0f0f0', accent: '#4a4a4a', icon: '🛍️' }

export default function RecommendationResults({ data }) {
  const { user, recommendations } = data

  const sortedRecs = [...recommendations].sort((a, b) => b.score - a.score)

  return (
    <div className="results">
      {/* Result header */}
      <div className="results-header">
        <div className="results-header-left">
          <span className="form-step">02</span>
          <div>
            <h2 className="results-title">
              Recommendations
              <span className="results-for"> for {user}</span>
            </h2>
            <p className="results-subtitle">
              {recommendations.length} categor{recommendations.length === 1 ? 'y' : 'ies'} · {recommendations.reduce((s, r) => s + r.recommended_products.length, 0)} products
            </p>
          </div>
        </div>
        <div className="confidence-legend">
          <span className="legend-label">Affinity score</span>
        </div>
      </div>

      {/* Category distribution bar */}
      <div className="distribution-bar">
        {sortedRecs.map((rec, idx) => {
          const colors = CATEGORY_COLORS[rec.category] || DEFAULT_COLOR
          return (
            <div
              key={rec.category}
              className="dist-segment"
              style={{
                width: `${rec.score * 100}%`,
                background: colors.accent,
                opacity: 0.85 - idx * 0.06
              }}
              title={`${rec.category}: ${(rec.score * 100).toFixed(0)}%`}
            />
          )
        })}
      </div>

      {/* Category cards */}
      <div className="category-list">
        {sortedRecs.map((rec, idx) => (
          <CategoryCard
            key={rec.category}
            rec={rec}
            idx={idx}
            colors={CATEGORY_COLORS[rec.category] || DEFAULT_COLOR}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ rec, idx, colors }) {
  const pct = (rec.score * 100).toFixed(1)

  return (
    <div
      className="category-card"
      style={{ animationDelay: `${idx * 0.08}s` }}
    >
      <div className="category-card-header">
        <div className="category-info">
          <div
            className="category-icon-wrap"
            style={{ background: colors.bg, color: colors.accent }}
          >
            <span className="category-icon">{colors.icon}</span>
          </div>
          <div>
            <div className="category-name">{rec.category}</div>
            <div className="category-rank">#{idx + 1} preference</div>
          </div>
        </div>

        <div className="score-display">
          <div className="score-pct" style={{ color: colors.accent }}>{pct}%</div>
          <div className="score-label">affinity</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{
            '--target-width': `${pct}%`,
            background: `linear-gradient(90deg, ${colors.accent}aa, ${colors.accent})`,
            animationDelay: `${0.2 + idx * 0.08}s`
          }}
        />
      </div>

      {/* Products grid */}
      <div className="products-grid">
        {rec.recommended_products.map((product, pIdx) => (
          <ProductCard
            key={pIdx}
            product={product}
            colors={colors}
            idx={pIdx}
            catIdx={idx}
          />
        ))}
      </div>
    </div>
  )
}

function ProductCard({ product, colors, idx, catIdx }) {
  const name = typeof product === 'string' ? product : product.name || product.product || JSON.stringify(product)
  const price = typeof product === 'object' ? product.price : null
  const rating = typeof product === 'object' ? product.rating : null

  return (
    <div
      className="product-card"
      style={{ animationDelay: `${0.3 + catIdx * 0.08 + idx * 0.05}s` }}
    >
      <div
        className="product-image-placeholder"
        style={{ background: colors.bg }}
      >
        <span className="product-image-icon">{colors.icon}</span>
      </div>
      <div className="product-info">
        <div className="product-name">{name}</div>
        <div className="product-meta">
          {rating && (
            <div className="product-rating">
              <span className="star">★</span>
              <span>{rating}</span>
            </div>
          )}
          {price && (
            <div className="product-price" style={{ color: colors.accent }}>
              ${typeof price === 'number' ? price.toFixed(2) : price}
            </div>
          )}
        </div>
        <div
          className="product-tag"
          style={{ background: colors.bg, color: colors.accent }}
        >
          Recommended
        </div>
      </div>
    </div>
  )
}