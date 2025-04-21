import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function Register() {
  const [credentials, setCredentials] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (credentials.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        email: credentials.email,
        username: credentials.username,
        password: credentials.password
      });

      // Log the user in after successful registration
      login(response.access_token, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-center mb-4">Sign Up</h2>
            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  placeholder="Choose a username"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password"
                />
                <Form.Text className="text-muted">
                  Password must be at least 8 characters long
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={credentials.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-3">
              Already have an account? <Link to="/login">Log In</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
