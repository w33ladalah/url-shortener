import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

def test_shorten_url(test_client: TestClient, auth_headers: dict):
    """Test shortening a URL with authentication."""
    url_data = {
        "url": "https://www.example.com",
        "custom_code": None
    }
    response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "short_code" in data
    assert data["original_url"] == url_data["url"]
    assert data["user_id"] is not None

def test_shorten_url_with_custom_code(test_client: TestClient, auth_headers: dict):
    """Test shortening a URL with a custom code."""
    url_data = {
        "url": "https://www.example.com",
        "custom_code": "custom123"
    }
    response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["short_code"] == "custom123"
    assert data["original_url"] == url_data["url"]

def test_shorten_url_duplicate_custom_code(test_client: TestClient, auth_headers: dict):
    """Test that using a duplicate custom code returns an error."""
    url_data = {
        "url": "https://www.example.com",
        "custom_code": "unique123"
    }
    # First request should succeed
    response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
    assert response.status_code == 200

    # Second request with same custom code should fail
    url_data["url"] = "https://www.different.com"
    response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
    assert response.status_code == 400
    assert "already in use" in response.json()["detail"].lower()

def test_shorten_invalid_url(test_client: TestClient, auth_headers: dict):
    """Test that invalid URLs are rejected."""
    url_data = {
        "url": "not-a-valid-url",
        "custom_code": None
    }
    response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
    assert response.status_code == 422

def test_get_url(test_client: TestClient, auth_headers: dict):
    """Test retrieving a shortened URL."""
    # First create a shortened URL
    url_data = {
        "url": "https://www.example.com",
        "custom_code": "gettest"
    }
    response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
    assert response.status_code == 200

    # Then try to retrieve it
    response = test_client.get(f"/api/urls/{url_data['custom_code']}")
    assert response.status_code == 200
    data = response.json()
    assert data["original_url"] == url_data["url"]
    assert data["short_code"] == url_data["custom_code"]

def test_get_nonexistent_url(test_client: TestClient):
    """Test retrieving a non-existent shortened URL."""
    response = test_client.get("/api/urls/nonexistent")
    assert response.status_code == 404

def test_get_my_urls(test_client: TestClient, auth_headers: dict):
    """Test retrieving user's URLs."""
    # Create a few URLs first
    urls = [
        {"url": "https://example1.com", "custom_code": "test1"},
        {"url": "https://example2.com", "custom_code": "test2"},
    ]

    for url_data in urls:
        response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
        assert response.status_code == 200

    # Get user's URLs
    response = test_client.get("/api/urls/my", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2  # Should have at least the two URLs we just created

    # Verify the URLs we created are in the response
    created_codes = {url["custom_code"] for url in urls}
    response_codes = {url["short_code"] for url in data}
    assert created_codes.issubset(response_codes)

def test_unauthorized_access(test_client: TestClient):
    """Test that unauthorized access is properly handled."""
    url_data = {
        "url": "https://www.example.com",
        "custom_code": None
    }
    response = test_client.post("/api/urls/shorten", json=url_data)
    assert response.status_code == 401

    response = test_client.get("/api/urls/my")
    assert response.status_code == 401
