import pytest
from fastapi import status

def test_register_user(client):
    user_data = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "password123"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["username"] == user_data["username"]
    assert "hashed_password" not in data

def test_register_duplicate_email(client, test_user):
    user_data = {
        "email": "test@example.com",  # Same email as test_user
        "username": "different",
        "password": "password123"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_register_duplicate_username(client, test_user):
    user_data = {
        "email": "different@example.com",
        "username": "testuser",  # Same username as test_user
        "password": "password123"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]

def test_login_success(client, test_user):
    login_data = {
        "username": test_user["email"],
        "password": "testpass123"
    }
    response = client.post("/api/auth/token", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client, test_user):
    login_data = {
        "username": test_user["email"],
        "password": "wrongpass"
    }
    response = client.post("/api/auth/token", data=login_data)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_login_nonexistent_user(client):
    login_data = {
        "username": "nonexistent@example.com",
        "password": "password123"
    }
    response = client.post("/api/auth/token", data=login_data)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_get_current_user(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"

def test_get_current_user_no_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

def test_get_current_user_invalid_token(client):
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]
