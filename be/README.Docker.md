# Docker Setup for Backend Service

## Getting the Image

### Option 1: Pull from Registry (Recommended)

The pre-built image is available from GitHub Container Registry:

```bash
docker pull ghcr.io/chmurson/icod2/backend
```

### Option 2: Build Locally

```bash
# From backend directory
cd be
docker build -f Dockerfile -t icod2-backend ..

# OR from project root
docker build -f be/Dockerfile -t icod2-backend .
```

## Run locally

### Basic Usage

```bash
# Using the registry image (recommended)
docker run -p 8080:8080 ghcr.io/chmurson/icod2/backend

# OR using locally built image
docker run -p 8080:8080 icod2-backend

# With environment variables
docker run -p 8080:8080 -e PEER_ID_FILE_PATH=/app/data/my-peer-id.json -e CONFIG_PATH=/app/config/config.yaml ghcr.io/chmurson/icod2/backend

# With .env file
docker run -p 8080:8080 --env-file .env ghcr.io/chmurson/icod2/backend
```

### Persistent Peer ID Storage

To persist the peer ID between container restarts, use a Docker volume:

```bash
# Create a named volume
docker volume create icod2-data

# Run with volume mount
docker run -p 8080:8080 -v icod2-data:/app/data ghcr.io/chmurson/icod2/backend

# Or use a bind mount to a local directory
docker run -p 8080:8080 -v $(pwd)/data:/app/data ghcr.io/chmurson/icod2/backend
```

The peer ID file will be stored at `/app/data/peer-id-private-key.json` inside the container. You can also customize the file path using the `PEER_ID_FILE_PATH` environment variable:

```bash
docker run -p 8080:8080 -v icod2-data:/app/data -e PEER_ID_FILE_PATH=/app/data/my-peer-id.json ghcr.io/chmurson/icod2/backend
```


### Custom Configuration path

Normally the configuration file is located at `/app/be/config.yaml`. During docker build `config.local.yaml` is also copied to the image, and if the file exists in the runtime it's used over the default one.

You can also customize the configuration file path using the `CONFIG_PATH` environment variable:
```bash
docker run -p 8080:8080 -v icod2-data:/app/data -e CONFIG_PATH=/app/config/my-config.yaml ghcr.io/chmurson/icod2/backend
```

### Logging

The relay now uses [Pino](https://github.com/pinojs/pino) for structured logging. Control verbosity via the `logging.level` setting in `config.yaml` (defaults to `info`).

To forward logs to [Axiom](https://axiom.co/docs/send-data/pino), provide credentials through configuration, and enable the optional `logging.axiom` block in `config.yaml`. When credentials are supplied, logs continue to stream to stdout while also being shipped to Axiom.
