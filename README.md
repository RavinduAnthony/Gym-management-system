## IronCore Gym SaaS — Frontend

A multi-tenant Gym management web app built with **React 19 + TypeScript + Vite**.

### Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19, TypeScript 5.9, Vite 7 |
| Routing | React Router DOM 7 (lazy-loaded routes) |
| Server state | TanStack React Query 5 |
| Client state | Zustand 5 (auth + theme, persisted to `localStorage`) |
| Forms | React Hook Form 7 + Zod 4 |
| HTTP | Axios — auto-injects `Authorization: Bearer` + `X-Tenant-Id` headers |
| UI / Animations | Tailwind CSS 4, Framer Motion 12, Lucide React icons |
| Charts | Recharts 3 |
| Tables | TanStack Table 8 + TanStack Virtual 3 |
| Notifications | Sonner toast |
| Exports | jsPDF + jspdf-autotable (PDF), xlsx (Excel) |

### Project Structure

```
src/
├── app/              # Router, providers, App root
├── core/             # Axios instance, auth, permissions, constants, types
├── features/         # Domain modules (auth, members, trainers, payments, …)
├── components/       # Shared UI: layout, form controls, branding
├── hooks/            # Reusable React Query hooks
├── styles/           # Global CSS, design tokens, themes
└── lib/              # Axios API wrapper, toast utilities
```

### Key Features

- **Multi-tenant auth** — JWT login, tenant ID carried on every request, auto-logout on 401
- **Role-based access** — `Owner`, `Manager`, `Receptionist`, `Trainer`; routes and UI elements gated per role
- **Setup Wizard** — 4-step onboarding (Gym Profile → Membership Plans → Staff → Payment Settings), Owner-only, blocked once completed
- **Members** — Full CRUD, profile photos, branch & trainer assignment, membership status enrichment
- **Trainers** — CRUD with certifications, specializations, availability
- **Memberships & Packages** — Package catalog management, member enrollment, renewal
- **Payments** — Monthly payment schedule tracking, pending/late/paid status, payment recording, schedule backfill
- **Attendance** — Check-in / check-out logging
- **Reports** — Revenue and membership analytics with PDF/Excel export
- **Settings** — Gym profile, users & roles, working hours, branches, service configuration
- **Theme** — Dark / Light / System mode via CSS design tokens; primary color `#C62828`

### Running Locally

```bash
# Prerequisites: Node.js 20+

cd "Gym App"
npm install
npm run dev
# App available at http://localhost:5173
```

Set `VITE_API_URL` in a `.env.local` file to point at the backend (defaults to `http://localhost:5123/api`).
