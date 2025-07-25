FROM node:22-alpine as builder

WORKDIR /app

# Copy all project files for yarn install to work correctly
COPY package.json yarn.lock .yarnrc.yml ./
COPY be ./be
COPY libs ./libs

RUN corepack enable
RUN yarn install
RUN yarn workspace @icod2/contracts build
RUN yarn workspace @icod2/be build

# Production Stage
FROM node:22-alpine
WORKDIR /app

# Copy be's package.json
COPY --from=builder /app/be/package.json ./package.json

# Copy be's built code
COPY --from=builder /app/be/dist ./dist

# Copy the entire root node_modules from the builder stage
# This should contain all hoisted dependencies and built workspace packages
COPY --from=builder /app/node_modules ./node_modules

# Explicitly copy the entire built contracts package into node_modules
COPY --from=builder /app/libs/contracts ./node_modules/@icod2/contracts

EXPOSE 8080
CMD ["node", "dist/index.js"]




