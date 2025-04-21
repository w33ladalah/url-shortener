import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const shortenUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // In a real app, this would point to your backend API
      const response = await fetch('/api/urls/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ original_url: url }),
      })

      if (!response.ok) {
        throw new Error('Failed to shorten URL')
      }

      const data = await response.json()
      const baseUrl = window.location.origin
      setShortUrl(`${baseUrl}/${data.short_code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>URL Shortener</h1>

      <form onSubmit={shortenUrl} className="form">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to shorten"
          required
          className="input"
        />
        <button type="submit" disabled={loading} className="button">
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {shortUrl && (
        <div className="result">
          <p>Your shortened URL:</p>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  )
}

export default App
