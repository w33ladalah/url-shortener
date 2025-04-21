# URL Shortener

A full-stack URL shortener application with FastAPI backend and React+Bootstrap frontend.

## Features

- Shorten any URL with a randomly generated code
- Create custom short codes for your URLs
- Redis caching for improved performance
- Copy to clipboard functionality
- Responsive Bootstrap UI
- Track click statistics for your shortened URLs
- Docker containerization for easy deployment

## Project Structure

- `/backend`: FastAPI backend with SQLAlchemy and Redis
- `/frontend`: React + TypeScript + Bootstrap (Vite) frontend
- `/docker`: Dockerfiles for backend and frontend
- Docker Compose configuration for the entire stack

## Technologies Used

### Backend
- FastAPI - Modern, high-performance web framework
- SQLAlchemy - SQL toolkit and ORM
- Redis - In-memory caching
- PostgreSQL - Relational database
- Pydantic - Data validation

### Frontend
- React - UI library
- TypeScript - Type-safe JavaScript
- Bootstrap - UI component library
- Vite - Build tool and development server

### Infrastructure
- Docker & Docker Compose - Containerization
- Nginx - Web server and reverse proxy
- Adminer - Database management

## Requirements

- Docker and Docker Compose
- Node.js and npm (for local frontend development)
- Python 3.11+ (for local backend development)

## Getting Started

1. Clone this repository
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Edit the `.env` file to customize your settings
4. Start the application:
   ```bash
   docker-compose up -d
   ```
5. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - API Documentation: http://localhost/api/docs
   - Adminer (DB Management): http://localhost:8080

## Development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /api/urls/shorten` - Create a new short URL
  - Request body: `{ "original_url": "https://example.com", "custom_short_code": "my-code" }`
  - Custom short code is optional

- `GET /api/urls/{short_code}` - Redirect to the original URL

- `GET /api/urls/stats/{short_code}` - Get stats for a short URL

## License

MIT
