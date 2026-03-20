import { useState, useCallback } from 'react'
import Header from './components/Header'
import UserForm from './components/UserForm'
import RecommendationResults from './components/RecommendationResults'
import EmptyState from './components/EmptyState'
import './App.css'

const SAMPLE_USER = {
  name: "Priya Sharma",
  purchaseHistory: [
    { product: "Running Shoes", category: "Sports" },
    { product: "Yoga Mat", category: "Sports" },
    { product: "Python Cookbook", category: "Books" },
    { product: "Wireless Headphones", category: "Electronics" },
    { product: "Trail Runners", category: "Sports" },
    { product: "Design Patterns", category: "Books" },
    { product: "Smart Watch", category: "Electronics" },
    { product: "Resistance Bands", category: "Sports" },
  ]
}

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [animKey, setAnimKey] = useState(0)

  const handleSubmit = useCallback(async (userData) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      setAnimKey(k => k + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLoadSample = useCallback(() => {
    return SAMPLE_USER
  }, [])

  return (
    <div className="app">
      <Header />
      <main className="main">
        <div className="layout">
          <div className="panel panel--left">
            <UserForm
              onSubmit={handleSubmit}
              onLoadSample={handleLoadSample}
              loading={loading}
            />
          </div>
          <div className="panel panel--right">
            {error && (
              <div className="error-card">
                <span className="error-icon">!</span>
                <div>
                  <div className="error-title">Request Failed</div>
                  <div className="error-msg">{error}</div>
                </div>
              </div>
            )}
            {loading && <LoadingState />}
            {!loading && !error && result && (
              <RecommendationResults key={animKey} data={result} />
            )}
            {!loading && !error && !result && <EmptyState />}
          </div>
        </div>
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <div className="loading-text">
        <span>Analysing purchase patterns</span>
        <span className="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    </div>
  )
}