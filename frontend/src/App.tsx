import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Container, Nav, Navbar, Row, Col, Form, Button, Card, Alert, Toast, Spinner } from 'react-bootstrap'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { Dashboard } from './components/Dashboard'
import { Profile } from './components/Profile'
import { useAuth } from './contexts/AuthContext'
import { shortenUrl } from './services/api'
import './App.css'

// Get the API base URL from environment variable, removing '/api' if present
const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000'

function Home() {
  const [url, setUrl] = useState('')
  const [customShortCode, setCustomShortCode] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCopyToast, setShowCopyToast] = useState(false)

  const handleShortenUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await shortenUrl({
        original_url: url,
        ...(customShortCode && { custom_short_code: customShortCode })
      });

      setShortUrl(`${BASE_URL}/${response.short_code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shorten URL')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    setShowCopyToast(true)
    setTimeout(() => setShowCopyToast(false), 3000)
  }

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <h1 className="text-center mb-4">URL Shortener</h1>

        <Form onSubmit={handleShortenUrl}>
          <Form.Group className="mb-3">
            <Form.Label>Enter URL to shorten</Form.Label>
            <Form.Control
              type="url"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Custom short code (optional)</Form.Label>
            <Form.Control
              type="text"
              value={customShortCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomShortCode(e.target.value)}
              placeholder="e.g., my-link"
              pattern="^[a-zA-Z0-9_-]+$"
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
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  const { user, logout, loading } = useAuth()

  const handleLogout = () => {
    logout();
  };

  return (
    <Router>
      <div>
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">URL Shortener</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                {loading ? (
                  <Spinner animation="border" size="sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                ) : user ? (
                  <>
                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleLogout}
                      className="ms-2 my-1"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                    <Nav.Link as={Link} to="/register">Sign Up</Nav.Link>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="py-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Container>
      </div>
    </Router>
  )
}

export default App
