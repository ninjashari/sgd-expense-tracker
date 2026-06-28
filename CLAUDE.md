# TripKharcha

Mobile-first trip expense tracker. Multi-currency (INR/SGD), multi-user, multi-trip.

**Repo:** https://github.com/ninjashari/sgd-expense-tracker
**Live:** https://tripkharcha.onrender.com

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
- **Language:** TypeScript (strict mode)
- **Database:** Turso (libSQL/SQLite) via Drizzle ORM
- **Auth:** NextAuth v5 beta (Credentials provider, JWT sessions, 30-day max age)
- **Styling:** Tailwind CSS v4, Lucide React icons, clsx
- **Testing:** Vitest + Testing Library (unit), Playwright (E2E)

## Commands

```bash
npm run dev          # Dev server on port 9000
npm run build        # Production build
npm start            # Production server on port 9000
npm run db:push      # Sync Drizzle schema to Turso (interactive, needs TTY)
npm run db:studio    # Drizzle Studio UI
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run
npm run test:e2e     # Playwright E2E tests
```

## Environment Variables

```
AUTH_SECRET          # NextAuth session signing secret
TURSO_DATABASE_URL   # libsql://... connection string
TURSO_AUTH_TOKEN     # Turso auth token
```

## Database Schema

4 tables in `src/lib/db/schema.ts`. All IDs are UUIDs. All timestamps are ISO strings.

**users** — `id` (PK), `username` (unique), `password` (bcrypt hash), `createdAt`

**trips** — `id` (PK), `userId` (FK→users), `name`, `destination`, `startDate`, `endDate`, `createdAt`, `updatedAt`

**expenses** — `id` (PK), `userId` (FK→users), `tripId` (FK→trips), `description`, `amount` (real), `currency` ("INR"|"SGD", default "INR"), `amountInr` (real, auto-converted), `category` (FK→categories.id), `status` ("paid"|"planned"), `date`, `notes` (nullable), `paidBy` (nullable), `createdAt`, `updatedAt`

**categories** — `id` (PK), `userId` (FK→users), `name`, `icon` (lucide icon key), `color` (tailwind class), `createdAt`, `updatedAt`

**Relationships:** Every expense belongs to a trip. Every expense references a category by ID. Trips, expenses, and categories are all scoped to a user.

**Types exported:** `User`, `Trip`, `Expense`, `CategoryRecord`

## Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/app/page.tsx` | Dashboard — list all trips |
| `/login` | `src/app/login/page.tsx` | Login form |
| `/register` | `src/app/register/page.tsx` | Registration (creates user + 8 default categories) |
| `/trips/new` | `src/app/trips/new/page.tsx` | Create new trip |
| `/trips/[id]` | `src/app/trips/[id]/page.tsx` | Trip detail — summary cards, filter tabs, expense list, import button |
| `/trips/[id]/settings` | `src/app/trips/[id]/settings/page.tsx` | Edit/delete trip |
| `/trips/[id]/add` | `src/app/trips/[id]/add/page.tsx` | Add expense to trip |
| `/trips/[id]/edit/[expenseId]` | `src/app/trips/[id]/edit/[expenseId]/page.tsx` | Edit/delete expense |
| `/categories` | `src/app/categories/page.tsx` | List user categories |
| `/categories/add` | `src/app/categories/add/page.tsx` | Create category |
| `/categories/edit/[id]` | `src/app/categories/edit/[id]/page.tsx` | Edit category |
| `/api/auth/[...nextauth]` | `src/app/api/auth/[...nextauth]/route.ts` | NextAuth handler |

## Server Actions (`src/lib/actions.ts`)

All use the `ActionResult` pattern: `(prev: ActionResult | null, formData: FormData) => Promise<ActionResult>` with `useActionState` on the client.

| Action | Signature | What it does |
|--------|-----------|-------------|
| `addExpense` | `(tripId, prev, formData)` | Validates & inserts expense, redirects to trip page |
| `updateExpense` | `(id, tripId, prev, formData)` | Updates expense, redirects to trip page |
| `deleteExpense` | `(id)` | Deletes expense, redirects to trip page |
| `addTrip` | `(prev, formData)` | Creates trip, redirects to `/trips/[newId]` |
| `updateTrip` | `(id, prev, formData)` | Updates trip, redirects to `/trips/[id]` |
| `deleteTrip` | `(id)` | Deletes trip + all its expenses, redirects to `/` |
| `addCategory` | `(prev, formData)` | Creates category with icon/color |
| `updateCategory` | `(id, prev, formData)` | Updates category |
| `deleteCategory` | `(id)` | Deletes category (only if no expenses use it) |
| `importExpenses` | `(tripId, items[])` | Bulk insert from CSV data |
| `loginUser` | `(formData)` | Authenticates via NextAuth |
| `registerUser` | `(formData)` | Creates user + 8 default categories |

Helper: `getUserId()` — extracts userId from session, throws if unauthorized.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/db/schema.ts` | Drizzle table definitions and TypeScript types |
| `src/lib/db/queries.ts` | 9 query functions (expenses, trips, categories, users) |
| `src/lib/db/index.ts` | DB singleton (Proxy pattern for lazy init) |
| `src/lib/actions.ts` | All 13 server actions |
| `src/lib/auth.ts` | NextAuth config (Credentials, JWT, callbacks) |
| `src/lib/constants.ts` | ICON_OPTIONS (16 icons), ICON_MAP, COLOR_OPTIONS (11 colors), DEFAULT_CATEGORIES (8), CURRENCIES, STATUS_STYLES |
| `src/lib/utils.ts` | formatCurrency, formatINR, formatDate, convertToINR, todayISO, getMaxDate, getMinDate |
| `src/lib/validations.ts` | Field validators for all forms (description, amount, dates, trip name, etc.) |
| `src/lib/action-helpers.ts` | `ActionResult` type: `{ success: true } \| { success: false; error: string; fieldErrors?: Record<string, string> }` |
| `src/middleware.ts` | Exports `auth` as middleware; protects all routes except `/api/auth`, `/_next/`, `/favicon.ico` |
| `drizzle.config.ts` | Drizzle Kit config (turso dialect, schema path, credentials) |

## Components (`src/components/`)

| Component | Description |
|-----------|-------------|
| `header.tsx` | Sticky header — back button, title, action button, categories link, logout |
| `expense-form.tsx` | Add/edit expense form with currency toggle, category picker, inline category creation, validation |
| `trip-form.tsx` | Add/edit trip form with date validation |
| `category-form.tsx` | Add/edit category form with icon and color picker |
| `expense-card.tsx` | Expense display card (amount, category badge, status, date) |
| `trip-card.tsx` | Trip display card (name, destination, date range) |
| `expense-list.tsx` | Renders list of ExpenseCards or "No expenses" empty state |
| `trip-list.tsx` | Renders list of TripCards or "No trips" empty state |
| `category-list.tsx` | Category list with edit/delete links |
| `summary-cards.tsx` | 3-column grid: Paid / Planned / Total (all in INR) |
| `filter-tabs.tsx` | All / Paid / Planned tabs using `?status=` query param and `usePathname()` for base URL |
| `delete-button.tsx` | Delete button with confirmation dialog (accepts `label` and `confirmMessage` props) |
| `import-button.tsx` | Opens import drawer, accepts `tripId` and `categories` props |
| `import-drawer.tsx` | Modal for CSV import: paste or upload, parse, edit rows, map category names→IDs, bulk import |

## Architecture Patterns

- **Server Components by default.** Pages are async server components. Client components only where needed (forms, interactive UI).
- **Server Actions for mutations.** No API routes for CRUD. Forms use `useActionState(action, null)` with `ActionResult` return type for field-level errors.
- **Action binding pattern.** Pages bind IDs to actions: `const boundAction = updateTrip.bind(null, id)` then pass to client form components.
- **Categories by ID.** Expenses store category UUID, not name. Components receive a `categoriesMap: Record<string, {name, icon, color}>` for display.
- **DB singleton.** `src/lib/db/index.ts` uses a Proxy for lazy initialization of the Drizzle client.
- **Post-mutation flow.** All mutations call `revalidatePath(path)` then `redirect(path)`.
- **Dual validation.** Client-side via `onBlur` handlers + server-side in actions. Validators in `src/lib/validations.ts` are shared.

## Currencies

| Currency | Symbol | Rate to INR |
|----------|--------|-------------|
| INR | ₹ | 1 (base) |
| SGD | S$ | 62.5 |

All expenses store `amountInr` (auto-converted). Summary cards always display in INR.

## Category System

- Users get 8 default categories on registration (Food & Drink, Transport, Accommodation, Shopping, Attractions, Travel, Visa, Other)
- Each category has: name, icon (from 16 Lucide icons), color (from 11 Tailwind schemes)
- Categories are user-scoped — each user has their own set
- Expense form allows inline category creation without leaving the form
- Categories cannot be deleted if any expense references them

## CSV Import

**Format:** `description,amount,currency,category,status,date,notes,paidby`

- Supports paste or file upload
- Parses and shows editable row preview before importing
- Category column uses names (e.g., "Food & Drink") which are mapped to user's category IDs (case-insensitive match)
- Unknown category names are rejected with an error — user must create them first or pick from dropdown
- All imported expenses are linked to the current trip's `tripId`

## Deployment

- **Platform:** Render (web service)
- **Build:** `npm install && npm run db:push && npm run build`
- **Start:** `npm start` (port 9000)
- **Database:** Turso cloud (libsql protocol)
- **Env vars on Render:** `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`

## Testing

**Unit tests** (`src/components/__tests__/`, `src/lib/__tests__/`):
- Framework: Vitest + @testing-library/react + jsdom
- Config: `vitest.config.ts`
- Tests for: category-form, expense-form, filter-tabs, trip-form, utils, validations

**E2E tests** (`e2e/`):
- Framework: Playwright (Chromium, headless)
- Config: `playwright.config.ts`
- Tests for: auth, categories, expenses, trips
- Runs against dev server on port 9000, sequential execution

## Design

- Mobile-first, max-width `max-w-lg` (32rem) container
- Geist font (Google Fonts)
- Consistent `rounded-xl` / `rounded-2xl` border radius
- Status colors: paid = emerald, planned = amber
- Sticky header with backdrop blur
- Cards with `shadow-sm` → `shadow-md` on hover
