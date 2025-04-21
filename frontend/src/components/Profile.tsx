import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const { user } = useAuth();
  const [showEmail, setShowEmail] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-4">Profile</h2>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <h4 className="mb-4">Account Information</h4>

              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={user.username}
                  readOnly
                  plaintext
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type={showEmail ? "text" : "password"}
                    value={user.email}
                    readOnly
                    plaintext
                  />
                  <Button
                    variant="link"
                    onClick={() => setShowEmail(!showEmail)}
                    className="ms-2"
                  >
                    {showEmail ? "Hide" : "Show"}
                  </Button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Account Created</Form.Label>
                <Form.Control
                  type="text"
                  value={new Date(user.created_at).toLocaleDateString()}
                  readOnly
                  plaintext
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Body>
              <h4 className="mb-4">Security</h4>
              <p className="text-muted">
                Password changes and additional security features coming soon.
              </p>
              <div className="d-grid">
                <Button variant="outline-primary" disabled>
                  Change Password
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <h4 className="mb-4">Usage Statistics</h4>

              <Alert variant="info">
                <strong>Pro Tip:</strong> Check out your URL statistics in the Dashboard
                to track how your shortened links are performing.
              </Alert>

              <div className="text-muted">
                <p>Account Type: Free</p>
                <p>Features available:</p>
                <ul>
                  <li>Unlimited URL shortening</li>
                  <li>Basic analytics</li>
                  <li>Custom URL codes</li>
                </ul>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Body>
              <h4 className="mb-4">Preferences</h4>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="custom-switch"
                  label="Enable email notifications"
                  disabled
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="custom-switch-2"
                  label="Show click statistics"
                  disabled
                />
              </Form.Group>
              <p className="text-muted">
                Additional preferences will be available in future updates.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
