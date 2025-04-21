import { useState } from 'react'
import { Container, Row, Col, Form, Button, Card, Alert, Toast } from 'react-bootstrap'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [customShortCode, setCustomShortCode] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCopyToast, setShowCopyToast] = useState(false)

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 3000);
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h1 className="text-center mb-4">URL Shortener</h1>

          <Form onSubmit={shortenUrl}>
            <Form.Group className="mb-3">
              <Form.Label>Enter URL to shorten</Form.Label>
              <Form.Control
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Custom short code (optional)</Form.Label>
              <Form.Control
                type="text"
                value={customShortCode}
                onChange={(e) => setCustomShortCode(e.target.value)}
                placeholder="e.g., my-link"
                pattern="[a-zA-Z0-9_-]+"
                minLength={3}
                maxLength={20}
                title="Letters, numbers, hyphens and underscores only (3-20 characters)"
              />
              <Form.Text className="text-muted">
                Use letters, numbers, hyphens and underscores only (3-20 characters)
              </Form.Text>
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="mb-3"
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </Button>
            </div>
          </Form>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          {shortUrl && (
            <Card className="mt-4">
              <Card.Body>
                <Card.Title>Your shortened URL</Card.Title>
                <div className="d-flex align-items-center mt-2">
                  <Form.Control
                    type="text"
                    value={shortUrl}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={copyToClipboard}
                  >
                    Copy
                  </Button>
                </div>
                <div className="text-center mt-3">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Open Link
                  </a>
                </div>
              </Card.Body>
            </Card>
          )}

          <Toast
            onClose={() => setShowCopyToast(false)}
            show={showCopyToast}
            delay={3000}
            autohide
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20
            }}
            bg="success"
            className="text-white"
          >
            <Toast.Header>
              <strong className="me-auto">URL Shortener</strong>
            </Toast.Header>
            <Toast.Body>URL copied to clipboard!</Toast.Body>
          </Toast>
        </Col>
      </Row>
    </Container>
  )
}

export default App
