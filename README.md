# openHealth — web client

The React client for **openHealth**, a personal health-record system built around a
**timeline** of medical cases.

Every illness becomes a card on the timeline holding its diagnosis, verdict, advice,
reports, prescriptions and doctor notes. Around that core sit four more features:

| Feature | Who can see it |
|---|---|
| **Timeline** | The owner, and family in the same group, and a doctor with live consent |
| **AI summary** | The owner, and family in the same group. Not readable from a doctor session |
| **Digital will** | The owner only — until a family admin approves a death certificate |
| **Family groups** | Members of the group, for each other's timelines and summaries |
| **Doctor sessions** | Doctors, for one patient at a time, with an OTP the patient approves |

> This repository is the **frontend only**. It talks to the openHealth backend over
> `/api/v1` and does not modify it.

---

## Requirements

- **Node.js 18+** and npm
- The **openHealth backend** running and reachable (defaults to `http://localhost:8000`)
- A MongoDB instance the backend can reach

## Setup

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

During development the Vite dev server proxies `/api/*` to `http://localhost:8000`, so
the browser makes same-origin requests and no CORS or env configuration is needed.

### Pointing at a different backend

Create a `.env` file to override the API base (see `.env.example`):

```bash
VITE_API_BASE_URL=https://api.example.com/api/v1
```

Leave it unset for local development — the proxy handles it.

> If your backend runs on a port other than `8000`, change `server.proxy['/api'].target`
> in `vite.config.js`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR on port 5173 |
| `npm run build` | Production bundle into `dist/` |
| `npm run preview` | Serve the built bundle locally |

## First run

There is **no demo data**: every screen reads live from your backend. On a fresh
database:

1. **Register a patient** at `/register`, then sign in at `/login`.
2. **Add a medical case** from *My timeline* — this is the only way a timeline starts.
3. **Upload a report** into that case (PDF/JPG/PNG, up to 10 MB).
4. **Generate an AI summary** from the *AI summary* page.
5. **Register a doctor** at `/doctor/register` to exercise the consent flow.

The two account types are entirely separate — patients live under `/`, doctors under
`/doctor`, and both can be signed in in the same browser at once.

---

## The two walkthroughs worth doing

### Patient → family

1. *Family* → **Create group**.
2. Note your OHID from *Profile* (or the copy button on the Family page).
3. **Invite member** with a second patient's OHID and a relationship.
4. Sign in as that second patient → *Family* → **Accept**.
5. Either can now open the other's **Timeline** — and their **Will** page will refuse,
   because a digital will stays locked until a death certificate is approved.
6. Upload a death certificate from the group card, then approve it as an admin. The will
   unlocks for the group.

### Doctor → patient

1. Sign in at `/doctor/login`.
2. *Find a patient* → enter the patient's OHID (the lookup is an **exact match**).
3. **Request consent** — openHealth mints a one-time code. Read it to the patient.
4. **Verify** the code → the timeline opens. Every view is written to the patient's audit log.
5. From a case, **Write prescription** or add a **note** to a report.
6. **End session**, or have the patient revoke from *Doctor access* — either closes it.

---

## Project layout

```
src/
├── api/          One module per backend resource; the only place axios is called
├── components/
│   ├── ui/       Design-system primitives (Button, Modal, Field, Badge, …)
│   ├── layout/   Shells, sidebar, topbar, route guards, logo
│   ├── patient/  Case cards, status badges, case form
│   ├── reports/  Report card, upload/edit modals, file-type icons
│   ├── notes/    Doctor note list + modal
│   ├── prescriptions/
│   ├── timeline/ TimelineList (the rail) and CaseDetailView (the tabs)
│   ├── family/   Group card, invite/create-group/certificate modals
│   └── doctor/   ConsentGate (request → verify OTP)
├── context/      AuthContext, DoctorAuthContext, ToastContext
├── hooks/        useAsync, useMutation, useTimeline, useDebounce, useDismissable
├── pages/        One file per route
└── utils/        Token handling, error normalisation, formatting, constants
```

Full rationale — the auth model, the state hooks, the error contract, and the known
backend defects this client works around — is in **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Tech

Vite 6 · React 18 · React Router 6 · Axios · Tailwind CSS 3 · lucide-react

No state-management library, no data-fetching library, no component kit — the app is
small enough that two hooks (`useAsync`, `useMutation`) and React context cover it.

## Design

Dark-first, built from the openHealth logo palette: deep navy `ink` surfaces with a
cyan → blue → mint `brand` gradient used only for emphasis (primary actions, active
nav, the timeline rail). Inter for text, Plus Jakarta Sans for headings. The app targets
WCAG AA contrast, keeps every status colour paired with a text label, and never relies
on colour alone to convey state.
