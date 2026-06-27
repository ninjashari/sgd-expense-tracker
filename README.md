# TripKharcha

A minimal, mobile-first expense tracker for your Singapore trip. Track paid and planned expenses in INR with automatic SGD conversion.

## Screenshots

<p align="center">
  <img src="docs/screenshots/login.png" alt="Login" width="250" />
  <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="250" />
  <img src="docs/screenshots/add-expense.png" alt="Add Expense" width="250" />
</p>

## Features

- Multi-user authentication (register + login)
- Track expenses as **Paid** or **Planned**
- Multi-currency support (INR primary, SGD with auto-conversion)
- Filter by status (All / Paid / Planned)
- Categories: Food, Transport, Accommodation, Shopping, Attractions, Other
- Summary cards with real-time totals
- Mobile-first responsive design
- Modern minimalist UI with Geist font

## Tech Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Turso** (libSQL) + **Drizzle ORM**
- **NextAuth.js v5** (credentials provider, bcrypt)
- **Lucide React** (icons)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/ninjashari/sgd-expense-tracker.git
cd sgd-expense-tracker
npm install
```

### Turso Database Setup

1. Install the [Turso CLI](https://docs.turso.tech/cli/installation):

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

2. Sign up and create a database:

```bash
turso auth signup
turso db create tripkharcha
```

3. Get your credentials:

```bash
turso db show tripkharcha --url
turso db tokens create tripkharcha
```

### Environment Variables

Create a `.env.local` file:

```env
AUTH_SECRET=your-random-secret-min-32-characters
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

### Push Schema

```bash
npx drizzle-kit push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account to get started.

## Deployment (Render)

1. Create a **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npm run db:push && npm run build` |
| Start Command | `npm start` |

4. Add environment variables:

| Variable | Value |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://your-db-name.turso.io` |
| `TURSO_AUTH_TOKEN` | *(from `turso db tokens create`)* |
| `AUTH_SECRET` | *(generate a random 32+ character string)* |

## License

MIT
