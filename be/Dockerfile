FROM node:lts-slim AS base

WORKDIR /app

# Copy relevant files early for better caching
COPY package.json yarn.lock .yarnrc.yml ./
COPY be/package.json ./be/
COPY libs/protocols/package.json ./libs/protocols/

RUN corepack enable && yarn set version 4.9.2

# Builder stage
FROM base AS builder

RUN yarn workspaces focus @icod2/be @icod2/protocols

COPY libs/protocols /app/libs/protocols
COPY be /app/be

WORKDIR /app/be
RUN yarn build

# Final stage
FROM base AS production

RUN yarn workspaces focus @icod2/be --production && \
  yarn cache clean

COPY --from=builder /app/libs/protocols/dist /app/libs/protocols/dist
COPY --from=builder /app/be/dist /app/be/dist

COPY be/.config.* /app/be

RUN chown -R node:node /app && \
  mkdir -p /app/data && \
  chown node:node /app/data

USER node

WORKDIR /app/be/dist

VOLUME ["/app/data"]

EXPOSE 8080

CMD ["node", "index.js"]
