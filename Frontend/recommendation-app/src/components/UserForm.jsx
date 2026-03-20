import { useState, useCallback } from 'react'
import './UserForm.css'

const CATEGORIES = ['Electronics', 'Books', 'Sports', 'Clothing', 'Home', 'Beauty', 'Food', 'Toys']

const CATEGORY_SUGGESTIONS = {
  Electronics: ['Wireless Headphones', 'Smart Watch', 'Laptop Stand', 'USB Hub', 'Webcam', 'Mechanical Keyboard'],
  Books: ['Python Cookbook', 'Design Patterns', 'Atomic Habits', 'The Pragmatic Programmer', 'Deep Work'],
  Sports: ['Running Shoes', 'Yoga Mat', 'Resistance Bands', 'Trail Runners', 'Foam Roller', 'Water Bottle'],
  Clothing: ['Linen Shirt', 'Denim Jacket', 'Running Shorts', 'Wool Sweater', 'Canvas Sneakers'],
  Home: ['Coffee Maker', 'Air Purifier', 'Desk Lamp', 'Plant Pot', 'Throw Pillow'],
  Beauty: ['Face Serum', 'Sunscreen SPF50', 'Hair Oil', 'Moisturiser', 'Lip Balm'],
  Food: ['Protein Powder', 'Matcha Powder', 'Olive Oil', 'Dark Chocolate', 'Granola'],
  Toys: ['LEGO Set', 'Board Game', 'Puzzle 1000pc', 'RC Car', 'Art Kit'],
}

export default function UserForm({ onSubmit, onLoadSample, loading }) {
  const [name, setName] = useState('')
  const [purchases, setPurchases] = useState([
    { product: '', category: 'Electronics' }
  ])
  const [showJson, setShowJson] = useState(false)

  const addRow = useCallback(() => {
    setPurchases(p => [...p, { product: '', category: 'Electronics' }])
  }, [])

  const removeRow = useCallback((idx) => {
    setPurchases(p => p.filter((_, i) => i !== idx))
  }, [])

  const updateRow = useCallback((idx, field, value) => {
    setPurchases(p => p.map((row, i) => i === idx ? { ...row, [field]: value } : row))
  }, [])

  const handleLoadSample = useCallback(() => {
    const sample = onLoadSample()
    setName(sample.name)
    setPurchases(sample.purchaseHistory)
  }, [onLoadSample])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const valid = purchases.filter(p => p.product.trim())
    if (!name.trim() || valid.length === 0) return
    onSubmit({ name: name.trim(), purchaseHistory: valid })
  }, [name, purchases, onSubmit])

  const payload = {
    name: name || 'User Name',
    purchaseHistory: purchases.filter(p => p.product)
  }

  return (
    <div className="user-form-card">
      <div className="form-header">
        <div className="form-header-left">
          <span className="form-step">01</span>
          <div>
            <h2 className="form-title">User Profile</h2>
            <p className="form-subtitle">Build purchase history to get recommendations</p>
          </div>
        </div>
        <button className="sample-btn" onClick={handleLoadSample} type="button">
          Load sample
        </button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        {/* Name field */}
        <div className="field-group">
          <label className="field-label">Customer Name</label>
          <input
            className="field-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Arjun Mehta"
            required
          />
        </div>

        {/* Purchase history */}
        <div className="field-group">
          <div className="field-label-row">
            <label className="field-label">Purchase History</label>
            <span className="purchase-count">{purchases.filter(p => p.product).length} items</span>
          </div>

          <div className="purchase-list">
            {purchases.map((row, idx) => (
              <PurchaseRow
                key={idx}
                row={row}
                idx={idx}
                onUpdate={updateRow}
                onRemove={removeRow}
                canRemove={purchases.length > 1}
              />
            ))}
          </div>

          <button type="button" className="add-row-btn" onClick={addRow}>
            <span className="add-icon">+</span> Add purchase
          </button>
        </div>

        {/* JSON preview toggle */}
        <div className="json-toggle-row">
          <button type="button" className="json-toggle" onClick={() => setShowJson(s => !s)}>
            <span className="json-toggle-icon">{showJson ? '▼' : '▶'}</span>
            Preview payload
          </button>
        </div>

        {showJson && (
          <pre className="json-preview">
            {JSON.stringify(payload, null, 2)}
          </pre>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={loading || !name.trim() || !purchases.some(p => p.product.trim())}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="btn-spinner" /> Processing...
            </span>
          ) : (
            <span>Get Recommendations →</span>
          )}
        </button>
      </form>
    </div>
  )
}

function PurchaseRow({ row, idx, onUpdate, onRemove, canRemove }) {
  const suggestions = CATEGORY_SUGGESTIONS[row.category] || []

  return (
    <div className="purchase-row">
      <div className="purchase-row-fields">
        <input
          className="field-input field-input--sm"
          list={`suggestions-${idx}`}
          value={row.product}
          onChange={e => onUpdate(idx, 'product', e.target.value)}
          placeholder="Product name"
        />
        <datalist id={`suggestions-${idx}`}>
          {suggestions.map(s => <option key={s} value={s} />)}
        </datalist>

        <select
          className="field-select"
          value={row.category}
          onChange={e => onUpdate(idx, 'category', e.target.value)}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {canRemove && (
          <button
            type="button"
            className="remove-row-btn"
            onClick={() => onRemove(idx)}
            title="Remove"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}