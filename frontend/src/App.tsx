import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [customShortCode, setCustomShortCode] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const shortenUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Prepare request body with optional custom short code
      const requestBody = {
        original_url: url,
        ...(customShortCode && { custom_short_code: customShortCode })
      }

      const response = await fetch('/api/urls/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to shorten URL')
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
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            required
            className="input"
          />
          <input
            type="text"
            value={customShortCode}
            onChange={(e) => setCustomShortCode(e.target.value)}
            placeholder="Custom short code (optional)"
            pattern="[a-zA-Z0-9_-]+"
            minLength={3}
            maxLength={20}
            title="Letters, numbers, hyphens and underscores only (3-20 characters)"
            className="input"
          />
        </div>
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
