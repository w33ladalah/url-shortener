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

def test_redirect_to_url(test_client: TestClient, auth_headers: dict):
    """Test URL redirection functionality."""
    # Create a shortened URL first
    url_data = {
        "url": "https://www.example.com",
        "custom_code": "redirect1"
    }
    response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
    assert response.status_code == 200

    # Test redirection
    response = test_client.get(f"/{url_data['custom_code']}", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == url_data["url"]

def test_url_stats(test_client: TestClient, auth_headers: dict):
    """Test URL statistics tracking."""
    # Create a URL
    url_data = {
        "url": "https://www.example.com",
        "custom_code": "stats1"
    }
    response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
    assert response.status_code == 200

    # Access the URL multiple times
    for _ in range(3):
        test_client.get(f"/{url_data['custom_code']}", follow_redirects=False)

    # Check stats
    response = test_client.get(f"/api/urls/stats/{url_data['custom_code']}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["clicks"] >= 3
    assert data["short_code"] == url_data["custom_code"]

def test_get_unclaimed_urls(test_client: TestClient):
    """Test retrieving unclaimed URLs."""
    # Create an unclaimed URL (without auth)
    url_data = {
        "url": "https://www.example.com",
        "custom_code": None
    }
    response = test_client.post("/api/urls/shorten", json=url_data)
    assert response.status_code == 200

    # Get unclaimed URLs
    response = test_client.get("/api/urls/unclaimed")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(url["original_url"] == url_data["url"] for url in data)

def test_claim_url(test_client: TestClient, auth_headers: dict):
    """Test claiming an unclaimed URL."""
    # Create an unclaimed URL first
    url_data = {
        "url": "https://www.example.com",
        "custom_code": "claim1"
    }
    response = test_client.post("/api/urls/shorten", json=url_data)
    assert response.status_code == 200

    # Claim the URL
    response = test_client.post(f"/api/urls/claim/{url_data['custom_code']}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["short_code"] == url_data["custom_code"]
    assert data["user_id"] is not None

def test_claim_already_claimed_url(test_client: TestClient, auth_headers: dict):
    """Test attempting to claim an already claimed URL."""
    # Create and claim a URL
    url_data = {
        "url": "https://www.example.com",
        "custom_code": "claim2"
    }
    response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
    assert response.status_code == 200

    # Try to claim it again
    response = test_client.post(f"/api/urls/claim/{url_data['custom_code']}", headers=auth_headers)
    assert response.status_code == 400
    assert "already claimed" in response.json()["detail"].lower()

def test_url_validation(test_client: TestClient, auth_headers: dict):
    """Test URL validation rules."""
    invalid_urls = [
        "",  # Empty URL
        "not-a-url",  # Invalid format
        "ftp://example.com",  # Unsupported protocol
        "http://" + "a" * 2048  # Too long URL
    ]

    for invalid_url in invalid_urls:
        url_data = {
            "url": invalid_url,
            "custom_code": None
        }
        response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
        assert response.status_code == 422

def test_custom_code_validation(test_client: TestClient, auth_headers: dict):
    """Test custom code validation rules."""
    invalid_codes = [
        "",  # Empty code
        "a" * 51,  # Too long
        "invalid@code",  # Invalid characters
        "spaces not allowed"
    ]

    for invalid_code in invalid_codes:
        url_data = {
            "url": "https://www.example.com",
            "custom_code": invalid_code
        }
        response = test_client.post("/api/urls/shorten", json=url_data, headers=auth_headers)
        assert response.status_code == 422
