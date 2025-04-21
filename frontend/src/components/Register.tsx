import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col, ProgressBar } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface PasswordStrength {
  score: number;
  feedback: string[];
}

export function Register() {
  const [credentials, setCredentials] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [] });
  const navigate = useNavigate();
  const { login } = useAuth();

  const validatePassword = (password: string): PasswordStrength => {
    const strength: PasswordStrength = { score: 0, feedback: [] };

    // Length check
    if (password.length < 8) {
      strength.feedback.push('Password must be at least 8 characters long');
    } else {
      strength.score += 1;
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
      strength.feedback.push('Add an uppercase letter');
    } else {
      strength.score += 1;
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
      strength.feedback.push('Add a lowercase letter');
    } else {
      strength.score += 1;
    }

    // Number check
    if (!/\d/.test(password)) {
      strength.feedback.push('Add a number');
    } else {
      strength.score += 1;
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength.feedback.push('Add a special character');
    } else {
      strength.score += 1;
    }

    return strength;
  };

  useEffect(() => {
    if (credentials.password) {
      setPasswordStrength(validatePassword(credentials.password));
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [credentials.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const strength = validatePassword(credentials.password);
    if (strength.score < 5) {
      setError('Password is not strong enough. Please address all requirements.');
      return;
    }

    // Validate username
    if (credentials.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(credentials.username)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
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

  const getPasswordStrengthVariant = (score: number): string => {
    if (score === 0) return 'danger';
    if (score < 3) return 'warning';
    if (score < 5) return 'info';
    return 'success';
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
                  pattern="[a-zA-Z0-9_-]+"
                  minLength={3}
                />
                <Form.Text className="text-muted">
                  Username must be at least 3 characters long and can only contain letters, numbers, underscores, and hyphens
                </Form.Text>
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
                {credentials.password && (
                  <>
                    <div className="mt-2">
                      <ProgressBar
                        variant={getPasswordStrengthVariant(passwordStrength.score)}
                        now={(passwordStrength.score / 5) * 100}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <Form.Text className="text-muted">
                        <div className="mt-2">Password requirements:</div>
                        <ul className="mt-1 mb-0">
                          {passwordStrength.feedback.map((feedback, index) => (
                            <li key={index}>{feedback}</li>
                          ))}
                        </ul>
                      </Form.Text>
                    )}
                  </>
                )}
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
