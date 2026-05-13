# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Development (run in separate terminals)
pnpm dev:server          # NestJS API on :3000
pnpm dev:web             # User-facing Vue app on :5173
pnpm dev:admin           # Admin panel on :5174

# Build shared package first (required before building server)
pnpm build:shared
pnpm build:server
pnpm build:web
pnpm build:admin

# Database
pnpm db:migrate          # Run Prisma migrations
pnpm db:seed             # Seed vehicle types, pricing rules, admin user
pnpm db:generate         # Regenerate Prisma client after schema changes

# Lint
pnpm lint                # Runs lint in all packages
```

## Architecture

This is a pnpm monorepo for a freight O2O platform (similar to Huolala/货拉拉). Three main packages:

### `packages/shared` — Shared types and constants

Must be built first (`pnpm build:shared`) — server depends on its compiled output. Contains:
- **Enums**: `UserRole`, `OrderStatus`, `DriverStatus`, `PaymentMethod`, `PaymentStatus`, etc.
- **Vehicle data**: 20 predefined vehicle types with pricing rules (`VEHICLE_TYPES`, `DEFAULT_PRICING_RULES`)
- **TypeScript types**: DTOs and response types for auth, user, order, driver

### `packages/server` — NestJS backend

- **Database**: PostgreSQL via Prisma. Schema at `prisma/schema.prisma` — 12 models mapping to snake_case table names (users, orders, drivers, vehicles, payments, etc.)
- **Auth**: Global JWT guard (`JwtAuthGuard`) applied via `APP_GUARD` in `app.module.ts`. Endpoints opt out with `@Public()` decorator. Role-based access via `@Roles('admin')` decorator + `RolesGuard`.
- **Module structure**: Each feature module (auth, user, order, driver, vehicle, payment, admin, sms) follows NestJS convention — `module.ts` → `controller.ts` → `service.ts`
- **Validation**: Global `ValidationPipe` with `whitelist: true` and implicit conversion
- **Order status flow**: `pending → paid → dispatched → arrived → loading → delivering → completed`. Any state can go to `cancelled`.

### `packages/web` — User-facing Vue 3 SPA

- **Stack**: Vue 3 (Composition API) + Vue Router 4 + Pinia 2 + Vite 5
- **API calls**: Custom `fetch` wrapper in `src/utils/http.ts` — prepends `/api`, injects Bearer token from localStorage, redirects to `/auth/login` on 401
- **Vite proxy**: `/api/*` → `http://localhost:3000/*` (strips `/api` prefix)
- **Pages**: home (price estimation), auth (login/register), order (create/list/detail), user profile, driver (register/orders/order-detail)
- **Auth store** (`stores/auth.ts`): persists token + user to localStorage

### `packages/admin` — Admin panel

Same stack as web, plus Naive UI component library. Port 5174, same API proxy config. Features: dashboard statistics, driver review (approve/reject), order management, complaint resolution, pricing rule editing.

## Key conventions

- **No tests exist** — this is a learning/demo project. Manual testing via `TEST_CASES.md`.
- **Mock services**: SMS verification (fixed code `123456`), payment flow (frontend simulation), map/location data (mock coordinates), cargo photo upload (canvas mock)
- **API pattern**: All endpoints prefixed with `/api` on the frontend, stripped by Vite proxy. Controllers use NestJS path prefixes (`auth`, `user`, `order`, `driver`, `vehicle`, `payment`, `admin`)
- **Shared package edits**: After changing `packages/shared/src`, run `pnpm build:shared` before the changes are visible to the server
- **Prisma migrations**: After editing `schema.prisma`, run `pnpm db:migrate` to generate and apply migrations