# URL Shortener

A full-stack URL shortener application with FastAPI backend and React+Bootstrap frontend.

## Features

- User Authentication
  - Email and password registration
  - Secure login system
  - Protected routes and API endpoints
  - Password strength validation
- URL Management
  - Shorten any URL with a randomly generated code
  - Create custom short codes for your URLs
  - Track click statistics for your shortened URLs
  - Personal dashboard for managing your URLs
- Modern Tech Stack
  - Redis caching for improved performance
  - Copy to clipboard functionality
  - Responsive Bootstrap UI
  - Hot-reload development setup
- Security
  - JWT-based authentication
  - Password hashing
  - Rate limiting
  - Input validation

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
- JWT - Authentication tokens

### Frontend
- React - UI library
- TypeScript - Type-safe JavaScript
- React Router - Client-side routing
- React Bootstrap - UI component library
- Vite - Build tool and development server
- Axios - HTTP client

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
3. Edit the `.env` file with your settings:
   ```
   # Database configuration
   DB_HOST=db
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=url_shortener

   # JWT configuration
   JWT_SECRET=your-secret-key
   JWT_ALGORITHM=HS256
   ```
4. Start the application in production mode:
   ```bash
   docker compose up -d
   ```
   Or in development mode with hot-reload:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

## Development Setup

The development environment includes hot-reload for both frontend and backend:

### Production Mode
- Frontend: http://localhost
- Backend API: http://localhost/api
- API Documentation: http://localhost/api/docs
- Adminer (DB Management): http://localhost:8080

### Development Mode
- Frontend: http://localhost:5173 (with hot-reload)
- Backend API: http://localhost:8000 (with auto-reload)
- API Documentation: http://localhost:8000/docs
- Adminer: http://localhost:8080

### Environment Files
1. Backend (`.env`):
   ```
   DB_HOST=db
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=url_shortener
   JWT_SECRET=your-secret-key
   JWT_ALGORITHM=HS256
   ```

2. Frontend (`frontend/.env`):
   ```
   VITE_API_URL=http://localhost:8000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  - Request: `{ "email": "user@example.com", "password": "password", "username": "username" }`
- `POST /api/auth/login` - Login
  - Request: `{ "email": "user@example.com", "password": "password" }`

### URL Management
- `POST /api/urls/shorten` - Create a new short URL
  - Request: `{ "original_url": "https://example.com", "custom_short_code": "my-code" }`
  - Custom short code is optional
- `GET /api/urls/{short_code}` - Redirect to the original URL
- `GET /api/urls/stats/{short_code}` - Get stats for a short URL
- `GET /api/urls/my` - Get user's URLs (requires authentication)
- `GET /api/urls/unclaimed` - Get unclaimed URLs
- `POST /api/urls/claim` - Claim an unclaimed URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
