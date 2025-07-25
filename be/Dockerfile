FROM node:lts-slim AS base

WORKDIR /app

# Copy relevant files early for better caching
COPY package.json yarn.lock .yarnrc.yml ./
COPY be/package.json ./be/
COPY libs/contracts/package.json ./libs/contracts/

RUN corepack enable && yarn set version 4.9.2

# Builder stage
FROM base AS builder

RUN yarn workspaces focus @icod2/be

COPY libs/contracts ./libs/contracts
COPY be ./be

WORKDIR /app/libs/contracts
RUN yarn build

WORKDIR /app/be
RUN yarn build

# Final stage
FROM base AS production

RUN yarn workspaces focus @icod2/be --production && \
  yarn cache clean

COPY --from=builder /app/libs/contracts/dist ./libs/contracts/dist
COPY --from=builder /app/be/dist ./be/dist

COPY be/.env ./be/

RUN chown -R node:node /app

USER node

WORKDIR /app/be

EXPOSE 8080

CMD ["node", "dist/index.js"]
