# Repository Guidelines

- `fe/` — React + Vite UI (entry `src/main.tsx`). Create new pages inside `fe/src/components/<feature>/` and register them in `fe/src/App.tsx`; keep feature helpers beside the page.
- `fe/src/components/layout/` holds shared shells/navs, and `fe/src/components/ui/` keeps reusable primitives—reuse these before reaching for Radix or adding another control.
- `be/` — TypeScript libp2p relay (`src/index.ts`) configured via `config.yaml` plus local overrides in `config.local.yaml`.
- `libs/` — shared packages (`contracts`, `protocols`, `icod-crypto-js`) with compiled output in each package’s `dist/` directory.

## Build, Test, Develop
- `yarn install` — install workspace dependencies.
- `yarn dev-prepare` — compile `@icod2/contracts` before running anything else.
- `yarn dev` — start frontend and backend together and regenerate `fe/.env.local` from `.env` files.
- `yarn workspace @icod2/fe dev` — run only the UI. `yarn workspace @icod2/be start` — run only the relay.
- `yarn workspace @icod2/<lib> build` — rebuild touched libraries; rerun `yarn dev-prepare` after contract changes so `fe`/`be` load the new dist.
- `yarn workspace @icod2/fe build` / `yarn workspace @icod2/be build` — build production bundles.

## Coding Style & Naming
- Biome enforces two-space indentation, double quotes, and trailing commas; rely on it for formatting via `yarn :lint-fix` or `yarn workspace <pkg> lint`.
- Use PascalCase for React components, camelCase for utilities and services, and SCREAMING_SNAKE_CASE only for constants.
- Hooks live in `fe/src/hooks/` and begin with `use`; Zustand stores belong in `fe/src/stores/`.
- Backend services in `be/src/services/` export camelCase factories or classes mirroring their filename.

## Testing Guidelines
- Vitest with Testing Library drives UI coverage; run `yarn workspace @icod2/fe test`, co-locate specs as `Component.test.tsx`, and import helpers from `fe/src/test/setup.ts`.
- For integration checks, start the relay with `yarn workspace @icod2/be start`.
- Backend unit tests are currently absent; if you add them, pick a TypeScript-native runner (Vitest or Jest) and add a script to `be/package.json`.
- Update fixtures and types in `libs/contracts/src` whenever protocol payloads change.

## Commit & PR Workflow
- Write Conventional Commits (`fix:`, `refactor:`, `feat:`) and add a scope when it clarifies impact (e.g., `feat(protocols): add handshake timeout`).
- Include PR summaries, linked issues, verification commands, and UI screenshots when applicable; flag config/env changes and request review from maintainers of touched packages.

## Configuration Notes
- Keep shared secrets in `.env`; put local overrides in `.env.local` or `be/config.local.yaml`.
- Rerun `yarn dev` after updating env keys; it rebuilds `fe/.env.local`.
- Never commit generated peer IDs or other sensitive artifacts.
