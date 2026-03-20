import { useState, useCallback, useEffect, useRef } from 'react'
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

const PLACEHOLDER_JSON = `{
  "name": "Arjun Mehta",
  "purchaseHistory": [
    { "product": "Running Shoes", "category": "Sports" },
    { "product": "Yoga Mat", "category": "Sports" },
    { "product": "Python Cookbook", "category": "Books" },
    { "product": "Smart Watch", "category": "Electronics" }
  ]
}`

export default function UserForm({ onSubmit, onLoadSample, loading }) {
  const [name, setName] = useState('')
  const [purchases, setPurchases] = useState([
    { product: '', category: 'Electronics' }
  ])
  const [showJson, setShowJson] = useState(false)
  const [showPasteModal, setShowPasteModal] = useState(false)

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

  const handleJsonApply = useCallback((parsed) => {
    if (parsed.name) setName(parsed.name)
    if (Array.isArray(parsed.purchaseHistory) && parsed.purchaseHistory.length > 0) {
      setPurchases(parsed.purchaseHistory)
    }
    setShowPasteModal(false)
  }, [])

  const payload = {
    name: name || 'User Name',
    purchaseHistory: purchases.filter(p => p.product)
  }

  return (
    <>
      <div className="user-form-card">
        <div className="form-header">
          <div className="form-header-left">
            <span className="form-step">01</span>
            <div>
              <h2 className="form-title">User Profile</h2>
              <p className="form-subtitle">Build purchase history to get recommendations</p>
            </div>
          </div>
          <div className="form-header-actions">
            <button className="sample-btn" onClick={() => setShowPasteModal(true)} type="button">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M4 3V2.5A1.5 1.5 0 015.5 1h3A1.5 1.5 0 0110 2.5V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M4 7h5M4 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Paste JSON
            </button>
            <button className="sample-btn" onClick={handleLoadSample} type="button">
              Load sample
            </button>
          </div>
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

      {showPasteModal && (
        <PasteJsonModal
          onApply={handleJsonApply}
          onClose={() => setShowPasteModal(false)}
        />
      )}
    </>
  )
}

// ── Paste JSON Modal ──────────────────────────────────────────────────────
function PasteJsonModal({ onApply, onClose }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [parsed, setParsed] = useState(null)
  const textareaRef = useRef(null)

  // Focus textarea on open
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const validate = useCallback((raw) => {
    if (!raw.trim()) { setError(''); setParsed(null); return }
    try {
      const obj = JSON.parse(raw)
      if (typeof obj !== 'object' || Array.isArray(obj)) {
        setError('Root must be a JSON object.')
        setParsed(null)
        return
      }
      if (!obj.purchaseHistory && !obj.name) {
        setError('JSON must contain at least "name" or "purchaseHistory".')
        setParsed(null)
        return
      }
      if (obj.purchaseHistory && !Array.isArray(obj.purchaseHistory)) {
        setError('"purchaseHistory" must be an array.')
        setParsed(null)
        return
      }
      setError('')
      setParsed(obj)
    } catch (e) {
      setError('Invalid JSON — ' + e.message.split('\n')[0])
      setParsed(null)
    }
  }, [])

  const handleChange = (e) => {
    setText(e.target.value)
    validate(e.target.value)
  }

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText()
      setText(clipText)
      validate(clipText)
    } catch {
      setError('Clipboard access denied. Please paste manually.')
    }
  }

  const handleFormat = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(text), null, 2)
      setText(formatted)
      validate(formatted)
    } catch {}
  }

  const handleClear = () => {
    setText('')
    setError('')
    setParsed(null)
    textareaRef.current?.focus()
  }

  const lineCount = text ? text.split('\n').length : 0
  const isValid = parsed !== null && !error

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Modal header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3.5" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M4.5 3.5V3A2 2 0 016.5 1h3A2 2 0 0111.5 3v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M4.5 8h5M4.5 10.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h3 className="modal-title">Paste JSON</h3>
              <p className="modal-subtitle">Paste a valid request payload to auto-fill the form</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} title="Close (Esc)">×</button>
        </div>

        {/* Schema hint */}
        <div className="schema-hint">
          <span className="schema-label">Expected shape</span>
          <code className="schema-code">{'{ "name": string, "purchaseHistory": [{ "product": string, "category": string }] }'}</code>
        </div>

        {/* Textarea area */}
        <div className="textarea-wrap">
          <div className="textarea-toolbar">
            <div className="textarea-info">
              {text ? (
                <span className={`validity-badge ${isValid ? 'validity-badge--ok' : error ? 'validity-badge--err' : ''}`}>
                  {isValid ? '✓ Valid JSON' : error ? '✗ Invalid' : '…'}
                </span>
              ) : (
                <span className="textarea-hint">Paste or type JSON below</span>
              )}
              {text && <span className="line-count">{lineCount} lines</span>}
            </div>
            <div className="textarea-actions">
              <button type="button" className="tb-btn" onClick={handlePasteFromClipboard} title="Paste from clipboard">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="3" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4 3V2.5A1.5 1.5 0 015.5 1h3A1.5 1.5 0 0110 2.5V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Clipboard
              </button>
              {text && (
                <>
                  <button type="button" className="tb-btn" onClick={handleFormat} title="Format JSON">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M2 4h10M2 7h7M2 10h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Format
                  </button>
                  <button type="button" className="tb-btn tb-btn--danger" onClick={handleClear}>
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          <textarea
            ref={textareaRef}
            className={`json-textarea ${error ? 'json-textarea--error' : isValid ? 'json-textarea--valid' : ''}`}
            value={text}
            onChange={handleChange}
            placeholder={PLACEHOLDER_JSON}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
          />

          {error && (
            <div className="textarea-error">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M6 3.5v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Parsed preview */}
        {isValid && parsed && (
          <div className="parsed-preview">
            <div className="parsed-preview-label">Preview</div>
            <div className="parsed-fields">
              {parsed.name && (
                <div className="parsed-field">
                  <span className="parsed-key">name</span>
                  <span className="parsed-val">{parsed.name}</span>
                </div>
              )}
              {parsed.purchaseHistory && (
                <div className="parsed-field">
                  <span className="parsed-key">purchaseHistory</span>
                  <span className="parsed-val">{parsed.purchaseHistory.length} item{parsed.purchaseHistory.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              {parsed.purchaseHistory?.slice(0, 3).map((item, i) => (
                <div key={i} className="parsed-field parsed-field--indent">
                  <span className="parsed-key">[{i}]</span>
                  <span className="parsed-val">{item.product || '—'} · <em>{item.category || '—'}</em></span>
                </div>
              ))}
              {parsed.purchaseHistory?.length > 3 && (
                <div className="parsed-field parsed-field--indent">
                  <span className="parsed-key">...</span>
                  <span className="parsed-val">+{parsed.purchaseHistory.length - 3} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="modal-apply-btn"
            disabled={!isValid}
            onClick={() => onApply(parsed)}
          >
            Apply to form →
          </button>
        </div>
      </div>
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