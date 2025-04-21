# URL Shortener

A full-stack URL shortener application with FastAPI backend and React frontend.

## Project Structure

- `/backend`: FastAPI backend
- `/frontend`: React + TypeScript (Vite) frontend
- `/docker`: Dockerfiles for backend and frontend

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

## License

MIT
