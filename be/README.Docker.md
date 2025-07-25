# Docker Setup for Backend Service

## Build

```bash
# From backend directory
cd be
docker build -f Dockerfile -t icod2-backend ..

# OR from project root
docker build -f be/Dockerfile -t icod2-backend .
```

## Run

```bash
# Basic
docker run -p 8080:8080 icod2-backend

# with environment variables
docker run -p 8080:8080 -e port=8080 -e vite_signaling_hostname=0.0.0.0 icod2-backend

# with .env file
docker run -p 8080:8080 --env-file .env icod2-backend

# different port mapping
docker run -p 3000:8080 icod2-backend
```
