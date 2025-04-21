import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { getMyUrls, getStats } from '../services/api';
import { URL } from '../types';

interface UrlStats {
  visits: number;
  lastVisited?: string;
}

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000';

export function Dashboard() {
  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [urlStats, setUrlStats] = useState<Record<string, UrlStats>>({});

  const fetchUrls = async () => {
    try {
      const data = await getMyUrls();
      setUrls(data);

      // Fetch stats for each URL
      const stats: Record<string, UrlStats> = {};
      for (const url of data) {
        const urlStats = await getStats(url.short_code);
        stats[url.short_code] = urlStats;
      }
      setUrlStats(stats);
    } catch (error) {
      setError('Failed to load your URLs');
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const copyToClipboard = (shortCode: string) => {
    const url = `${BASE_URL}/${shortCode}`;
    navigator.clipboard.writeText(url);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h2 className="mb-4">My URLs</h2>

      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h3 className="mb-3">{urls.length}</h3>
              <p className="text-muted mb-0">Total URLs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h3 className="mb-3">
                {Object.values(urlStats).reduce((sum, stat) => sum + stat.visits, 0)}
              </h3>
              <p className="text-muted mb-0">Total Visits</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h3 className="mb-3">
                {urls.filter(url => urlStats[url.short_code]?.visits > 0).length}
              </h3>
              <p className="text-muted mb-0">Active URLs</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {urls.length === 0 ? (
        <Alert variant="info">
          You haven't created any shortened URLs yet.
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Original URL</th>
                  <th>Short Code</th>
                  <th>Visits</th>
                  <th>Last Visited</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url.short_code}>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '300px' }}>
                        <a href={url.original_url} target="_blank" rel="noopener noreferrer">
                          {url.original_url}
                        </a>
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">{url.short_code}</Badge>
                    </td>
                    <td>{urlStats[url.short_code]?.visits || 0}</td>
                    <td>
                      {urlStats[url.short_code]?.lastVisited
                        ? new Date(urlStats[url.short_code].lastVisited!).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => copyToClipboard(url.short_code)}
                      >
                        Copy Link
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
