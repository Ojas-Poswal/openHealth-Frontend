# openHealth frontend — architecture

How the client is put together, why each piece is the way it is, and — importantly —
where the backend it talks to does not behave the way its own routes suggest.

---

## 1. The shape of the app

Two products in one bundle:

- **`/` and `/app/*`** — the patient's own record: timeline, cases, reports, AI summary,
  digital will, family groups, doctor access, audit log, profile.
- **`/doctor/*`** — a doctor's console: find a patient, obtain consent, read their
  timeline, write a prescription or a note, manage sessions.

They share the design system, the API client and the error contract, but nothing else.
A patient never downloads doctor screens and vice versa — every route except the landing
page and the 404 is lazy-loaded (`React.lazy` in `App.jsx`), which keeps the entry chunk
at ~272 kB (89 kB gzipped) instead of ~475 kB.

### Layering rule

```
pages/  ──────▶ components/  ──────▶ hooks/  ──────▶ api/  ──────▶ axios
   │                                   │
   └──────────────▶ context/ ──────────┘
```

- **`api/`** is the only place `axios` is called. One module per backend resource, each
  function returning already-unwrapped data (`.then(r => r.data.thing)`) so no page has
  to know the envelope shape.
- **`hooks/`** own the request lifecycle.
- **`components/`** are presentational. They take props and callbacks; they never fetch.
- **`pages/`** compose the above and own page-level state.

The one deliberate exception is that `components/timeline/CaseDetailView.jsx` is shared
by three different pages (patient case page, family member timeline, doctor timeline) and
switches its write actions on and off with `can*` props. That is what stops a family
member or a doctor from being offered a button the backend would refuse.

---

## 2. Authentication: two realms, one secret, one browser

The backend signs **both** token flavours with the same `JWT_SECRET`:

| Realm | Payload | Lifetime | Issued by |
|---|---|---|---|
| Patient | `{ patientID, ohid }` | 7 days | `POST /patients/login` |
| Doctor | `{ doctorId, dhid }` | 7 days | `POST /doctors/login` |

A patient and a doctor therefore need to be able to be signed in **in the same browser at
the same time** — a doctor testing the app while also holding a patient account, for
instance. Three things make that work:

1. **Separate storage keys** (`src/utils/token.js`):
   `openhealth.patient.token` / `openhealth.doctor.token`, each with a matching cached
   profile under `openhealth.patient` / `openhealth.doctor`, so a page can render a name
   before the profile request lands.
2. **Separate axios instances** (`src/api/client.js`): `patientClient` and `doctorClient`,
   each closing over its own role and attaching its own bearer token. `publicClient`
   carries no token and is used for login/register/forgot-password.
3. **Separate React contexts**: `AuthContext` (`useAuth()`) and `DoctorAuthContext`
   (`useDoctorAuth()`), with independent `logout`, `refresh` and session-expiry handling.

### Client-side expiry checking

`decodeToken()` reads the JWT payload and `isTokenExpired()` compares `exp` against the
clock **before** any protected request fires. This exists because the backend's patient
auth middleware has a broken error path (see §7.5) — an expired token produces a
malformed response rather than a clean 401. Checking locally means the app redirects to
login instead of rendering an error state for what is really just an old session.

### The 401 contract

Both clients install one response interceptor. On a 401 it:

1. clears that role's token and cached profile,
2. dispatches `window.dispatchEvent(new CustomEvent('openhealth:session-expired', { detail: { role } }))`.

The matching context listens for its own role and logs out. One interceptor, both realms,
no cross-talk.

### Route guards

`ProtectedRoute` and `DoctorProtectedRoute` gate `/app/*` and `/doctor/*`. Each renders a
full-page spinner while `booting` (the initial profile restore), then redirects to the
correct login page if the session is absent.

---

## 3. State: two hooks, no data library

### `useAsync(fn, deps, options)`

For reads. Exposes `data`, `error`, `loading`, `refreshing`, `empty`, plus `refetch()`
(spinner replaces content) and `refresh()` (content stays visible — used after a write,
so the page never flashes). Options:

- `immediate: false` — don't fetch on mount (used where a read must be user-triggered,
  e.g. the AI summary "Fetch saved" button and the doctor's summary panel).
- `emptyOn: [404]` — **the important one.** Treat a given status as "nothing here yet"
  rather than a failure. Several endpoints use 404 as their normal empty state:

  | Endpoint | 404 means |
  |---|---|
  | `GET /family/my-groups` | you belong to no group |
  | `GET /family/my-invites` | no pending invites |
  | `GET /digital-will/me` | you have not created a will |
  | `GET /ai-summary/:patientId` | no summary generated yet |
  | `GET /death-certificate/:patientId` | no certificate uploaded |

  Without `emptyOn`, each of those would render a red error box on a brand-new account.

Stale responses are discarded by request id, so a fast tab switch cannot let an older
response overwrite a newer one.

### `useMutation(fn)`

For writes. Exposes `run`, `loading`, `error`. **`run` never throws** — it resolves to the
result on success and `null` on failure, holding the error in `error`. That keeps submit
handlers flat:

```js
const result = await save.run(values)
if (!result) { setError(save.error); return false }
toast.success('Saved')
return true
```

The convention is worth stating because it has a sharp edge: wrapping an *already
wrapped* mutation loses the error. In `Family.jsx`, `handleAccept` therefore calls
`familyApi.acceptInvite()` directly inside the `try/catch` helper rather than going
through `useMutation.run`, which would have returned `null` and reported a false success.

### `useTimeline()`

The product's backbone. Wraps `GET /medical-case/timeline` — one entry per case, each
carrying `{ medicalCase, reports[], doctorNotes[], prescriptions[] }`, newest first — and
is shared by the dashboard, timeline, case detail, reports and AI summary screens.
`utils/timeline.js` derives everything else in memory: `countStats`, `flattenReports`,
`findEntry`, `sortByRecency`, `collectTags`.

---

## 4. Endpoint coverage

Every route in `src/app.js` has a client module. Nothing is unexercised.

### Patients — `/api/v1/patients`

| Method | Path | Auth | Used by |
|---|---|---|---|
| POST | `/register` | public | `PatientRegister` |
| POST | `/login` | public | `PatientLogin` |
| GET | `/profile` | patient | `AuthContext`, `Profile` |
| PATCH | `/profile` | patient | `Profile` |
| PATCH | `/change-password` | patient | `Profile` |
| POST | `/forgot-password` | public | `ForgotPassword` (step 1) |
| POST | `/verify-otp` | public | `ForgotPassword` (step 2) |
| POST | `/reset-password` | public | `ForgotPassword` (step 3) |
| GET | `/audit-logs` | patient | `AuditLogs` |
| GET | `/my-consents` | patient | `Consents` |
| POST | `/revoke-consent` | patient | `Consents` |

### Doctors — `/api/v1/doctors`

| Method | Path | Auth | Used by |
|---|---|---|---|
| POST | `/register` | public | `DoctorRegister` |
| POST | `/login` | public | `DoctorLogin` |
| GET | `/profile` | doctor | `DoctorAuthContext`, `DoctorProfile` |
| PATCH | `/profile` | doctor | `DoctorProfile` |
| PATCH | `/change-password` | doctor | `DoctorProfile` |
| GET | `/search/:ohid` | doctor | `SearchPatient`, doctor dashboard |
| GET | `/patient/:patientId/timeline` | doctor + consent | `DoctorPatientTimeline` |
| POST | `/request-consent` | doctor | `ConsentGate` |
| POST | `/verify-consent` | doctor | `ConsentGate` |
| POST | `/end-session` | doctor | `DoctorPatientTimeline`, `ActiveSessions` |
| GET | `/active-sessions` | doctor | `ActiveSessions`, doctor dashboard |

### Medical cases — `/api/v1/medical-case`

`POST /create` (patient) · `GET /my-cases` · `GET /timeline` · `GET /active-cases` ·
`GET /resolved-cases` · `GET /:caseId` · `PATCH /:caseId/status`

`create` reads **only** `diagnosis`, `verdict` and `finalAdvice` — `diagnosedAt`, `tags`,
`status` and `doctors` exist on the model but are not settable through the API, so
`CaseFormModal` offers exactly the three fields the controller destructures.

`Cases.jsx` uses the three lean list endpoints (`/my-cases`, `/active-cases`,
`/resolved-cases`) because it does not need nested records. `Timeline.jsx` uses the full
`/timeline` payload and filters in memory, because the lean endpoints omit the nested
reports and prescriptions that the card counts depend on.

### Reports — `/api/v1/reports` (multipart)

`POST /create` · `GET /case/:medicalCaseId` · `GET /:reportId` · `PATCH /:reportId` · `DELETE /:reportId`

`reportType` is an enum (Blood Test, MRI, X-Ray, CT-Scan, Ultrasound, Prescription,
Other) and the upload accepts `pdf/jpeg/jpg/png`, both mirrored in `utils/constants.js`
and enforced client-side by `FileDropzone` — failing fast beats a 500 after an upload.

`PATCH` accepts `reportName` and `reportType` only; the file itself is immutable, so
`ReportEditModal` does not offer to replace it.

**Only patients can create reports** (`verifyPatient`), so no doctor screen offers one.

### Doctor notes — `/api/v1/doctor-notes`

`POST /create` (`{ reportId, note }`). A note hangs off a **report**, not a case — which
is why notes are rendered nested under each report rather than as a flat list. The author
comes from the bearer token, never the client. Doctor-only.

### Prescriptions — `/api/v1/prescriptions`

`POST /create` (`{ medicalCaseId, medicines[] }`, first four fields of each medicine
required). Doctor-only — so the patient's case page shows prescriptions read-only, and
only the doctor timeline offers a write.

### Family — `/api/v1/family`

`POST /create` · `GET /my-groups` · `POST /invite-member` · `GET /my-invites` ·
`POST /accept-invite` · `POST /reject-invite` · `POST /leave-group` · `POST /promote-admin` ·
`POST /demote-admin` · `POST /remove-member` · `DELETE /delete-group` · `GET /timeline/:patientId`

`DELETE /delete-group` takes its body as `{ groupId }`, so the client passes axios `data`
rather than a query string.

### Digital will — `/api/v1/digital-will`

`POST /create` · `GET /me` · `PATCH /update-section` · `DELETE /delete` ·
`GET /family/:patientId` · `POST /approve-death-certificate`

`POST /create` seeds **exactly eight sections** and `PATCH /update-section` finds them by
**title**, so `WILL_SECTION_META` in `utils/constants.js` mirrors the controller's array
verbatim — a typo there silently 404s. Sections are edited, never added or removed.

### Death certificate — `/api/v1/death-certificate` (multipart)

`POST /upload` (`patientId` + `file`) · `GET /:patientId`. One certificate per patient;
uploading does not unlock anything on its own — a family admin must approve it.

### AI summary — `/api/v1/ai-summary`

`POST /generate/:patientId` · `GET /:patientId`. One summary per patient, upserted on
generate. The product spec is that the summary is *hidden* behind explicit buttons, which
`AISummary.jsx` implements literally: "Fetch saved" reveals what is stored, "Get new
summary" rebuilds and replaces it, and the page says plainly that the previous text is not
kept.

---

## 5. Error handling

`utils/errors.js` normalises everything into one shape:

```js
{ message, status, details, isApiError }
```

Two backend quirks are absorbed here:

- **The bare `"401"` body.** The patient auth middleware's catch block calls
  `res.send(401).json(...)` (see §7.5), which can deliver a literal `"401"` string where
  JSON was expected. `toApiError` recognises that body and produces a proper session-expiry
  error instead of showing the user `"401"`.
- **Non-JSON error pages.** If a proxy or the server returns HTML, the normaliser falls
  back to a status-derived message rather than crashing on `JSON.parse`.

Every screen then renders one of four states, consistently:

| State | Component |
|---|---|
| Loading | `Skeleton*` (shape-matched) or `PageSpinner` |
| Empty | `EmptyState` — always with the action that would fill it |
| Error | `ErrorState` — with retry |
| Content | the page |

---

## 6. Design system

Dark-first, derived from the logo's own palette rather than an arbitrary theme.

**Tokens** (`tailwind.config.js`): `ink.950 #040A14` → `ink.600 #16304F` for surfaces,
`brand.400 #22C6EE` / `royal.500 #3B82F6` / `mint.400 #34D399` for emphasis, plus
`bg-brand-gradient = linear-gradient(120deg, #22C6EE, #3B82F6 48%, #34D399)`. Inter for
body text, Plus Jakarta Sans for headings.

Deliberate constraints, so the UI stays readable as it grows:

- The brand gradient is reserved for **primary actions, the active nav item and the
  timeline rail**. Everything else is a flat surface, so emphasis still means something.
- **Colour is never the only channel.** Every status is a label plus a colour —
  `CaseStatusBadge`, `Badge`, audit action chips — never a bare dot.
- **Figures are proportional, not tabular.** Large standalone numbers are set in Inter
  semibold with default figures; `tabular-nums` would make a KPI read like a spreadsheet
  cell.
- **Meters pair the fill with a lighter step of the same hue** and always print the
  numeric value beside them, so state survives a grayscale screenshot.
- No charts. The API returns no multi-series or time-bucketed data, so the dashboard uses
  a KPI row of stat tiles; a chart would be decoration, not information.

`components/ui/` holds the primitives (Button, Modal, Field, Input, Select, Textarea,
Alert, Badge, Card, Avatar, StatTile, Meter, Tabs, FileDropzone, Skeleton, Spinner,
EmptyState, ErrorState, ConfirmDialog). Every destructive action routes through
`ConfirmDialog`, so nothing irreversible happens on a single click.

`components/layout/Logo.jsx` renders the square emblem by cropping the 1774×887 source
artwork with `background-size: 307% auto` and a tuned position — the alternative was
shipping a second image asset.

---

## 7. Backend defects, and how the UI copes

> These were found by reading the backend at
> `openHealth-Backend/`. **Nothing in the backend was modified** — the client works
> around each one and reports it honestly rather than hiding it.

### Broken outright (the feature cannot work until fixed)

**7.1 — AI summary generation always fails.**
`aiSummary.controller.js:generateAISummary` calls `openai.responses.create({ input: prompt })`,
but `openai` is never imported or configured anywhere, and the variable it builds is named
`promp`. Both are `ReferenceError`s, so `POST /ai-summary/generate/:patientId` returns 500
on every call.
→ `AISummary.jsx` surfaces the failure as an error alert. "Fetch saved" still works, so a
summary created before the regression remains readable.

**7.2 — The doctor's timeline always fails.**
`doctor.controller.js:getPatientTimeline` calls `Prescription.find(...)`, but the module
never imports `Prescription` (it imports `DoctorNote`, `Report`, `MedicalCase`, `Consent`,
`AuditLog` and `Patient`). The consent check passes, then the request 500s.
→ `DoctorPatientTimeline` distinguishes this from a consent failure and shows a dedicated
panel explaining that consent is not the problem and the request failed server-side, with
the server's own message.

**7.3 — Approving a death certificate fails.**
`digitalWill.controller.js:approveDeathCertificate` calls `DeathCertificate.findOne(...)`
without importing `DeathCertificate`. The certificate therefore stays `PENDING` and
`isUnlocked` is never set.
→ `FamilyMemberWill` shows the certificate's status and offers the approve action; if it
500s, the error is surfaced rather than leaving the user guessing why the will stayed shut.

### Security findings

**7.4 — `GET /doctors/search/:ohid` returns the password hash.**
`doctor.controller.js:searchPatientByOHID` runs `Patient.findOne({ ohid })` with **no**
`.select("-password")` (unlike the doctor middleware, which does exclude it). The response
therefore includes the patient's bcrypt hash and every other field on the document.
→ `SearchPatient.jsx` renders only clinical fields — name, OHID, blood group, date of
birth, gender, allergies — and states plainly that email and phone are not displayed.
**The leak is in the response body regardless; this is the highest-priority backend fix.**

**7.5 — The patient auth middleware's 401 path is malformed, and it logs tokens.**
`auth.middleware.js` catch block: `return res.send(401).json({ message: "Invalid Token" })`
— `res.send()` has already flushed the response, so `.json()` cannot set headers. The
client can receive a bare `"401"` body. The middleware also `console.log(decodedToken)`,
writing live tokens into server logs.
→ `toApiError` normalises the bare-`"401"` body into a session-expiry error, and
client-side `exp` decoding means an expired session is usually caught before the request.

**7.6 — Neither middleware checks the token's *type*.**
`verifyJWT` verifies the signature and assigns `req.patient = decodedToken` without
checking that the payload actually came from a patient. Because both realms are signed
with the same secret, a **doctor token passes patient middleware**. Most patient routes
then fail safely, since they use `req.patient.patientID` — `undefined` for a doctor token,
so the lookup simply finds nothing. But the routes that take the id from the **URL** do
not fail safely:

- `GET /ai-summary/:patientId` performs **no ownership check at all** — it never reads
  `req.patient`. Any validly-signed token can read any patient's summary by id.
- `POST /ai-summary/generate/:patientId` likewise.
- `GET /death-certificate/:patientId` has no authorization beyond the middleware, so any
  authenticated caller who knows a patient id can read their death certificate.

→ The client never exercises these paths from a cross-account context: `aiSummaryApi`
uses `patientClient`, and the doctor screens reach summaries through no route at all. The
doctor timeline's summary panel states that the summary is not part of the doctor's API
surface. Fixing this properly means asserting the payload shape (`patientID` vs
`doctorId`) in each middleware.

**7.7 — CORS is fully open.** `app.js` uses `app.use(cors())` with no origin allowlist.

### Product gaps (the API cannot do what the vision asks)

**7.8 — A doctor cannot search patients by name.**
`GET /doctors/search/:ohid` is an exact match on OHID and there is no directory endpoint.
The original requirement was "search for patient by name or OHID"; only the OHID half has
backend support. There is no way to build name search client-side without inventing a
patient list the API does not expose.
→ `SearchPatient.jsx` implements the lookup that exists and explains on the page why name
search is absent, framing it as the privacy property it is: no directory means no doctor
can browse the patient population. It also treats the match as case-sensitive and warns
that a single wrong character will miss.

**7.9 — Family members have no names.**
`GET /family/my-groups` returns raw group documents — `members[].patientId` and `admins[]`
are unpopulated ObjectIds. `fullName` and `ohid` are simply not in the payload, and no
patient-resolves-an-OHID endpoint exists for patients (only doctors have one).
→ `FamilyGroupCard` labels each row by the **relationship** recorded at invite time plus a
truncated id, and says in a comment why no name is invented. Rendering a placeholder name
would be worse than showing the id.

**7.10 — The consent code is never delivered to the patient.**
`POST /doctors/request-consent` returns the OTP **in the response body**, to the doctor's
own request. Nothing sends it to the patient by any channel. The flow is therefore
honour-based: the doctor is trusted to read the code out and to confirm the patient
consents.
→ `ConsentGate` presents the code as "read this code to the patient" and requires the
doctor to confirm before verifying, and the doctor dashboard's walkthrough says so
explicitly. It does not pretend the patient received it.

**7.11 — `POST /patients/forgot-password` returns the OTP in its response body.**
There is no mail provider configured, so the endpoint simply hands back the code.
→ `ForgotPassword.jsx` exposes it in a clearly-labelled warning panel so the flow is
usable in development, rather than silently hiding it and making the feature appear broken.
This must not ship to production as-is.

**7.12 — `PATCH /medical-case/:caseId/status` never sets `resolvedAt`.**
`resolvedAt` exists on the model and `MedicalCaseCard`/`CaseDetailView` display it, so a
resolved case shows "Resolved on —".

**7.13 — Consent expiry is stored but not enforced.**
`Consent.expiresAt` is checked in `verifyConsent` (the 10-minute OTP window) but **not** in
`getPatientTimeline`, which checks only `isUsed` and `accessGranted`. A granted session
therefore never times out on the server.
→ `Consents.jsx` shows the expiry as information and decides "active" from
`isUsed && accessGranted` — the same condition the backend uses — rather than implying an
expiry that is not enforced.

**7.14 — `revokeConsent` only matches `accessGranted: true`.**
Revoking a pending request 404s ("No Active Consent Found"), and revocation does not clear
`isUsed`.
→ `Consents.jsx` groups consents into Active / Awaiting code / Ended and offers **Revoke
access** only for active ones.

**7.15 — `joinPolicy` is destructured but not in the schema.**
`createFamilyGroup` reads `joinPolicy` from the body, but `familyGroup.model.js` has no
such field, so it is silently dropped. Strict-mode Mongoose means it is not even stored.
→ `CreateGroupModal` does not offer the field, rather than presenting a control that does
nothing.

---

## 8. Deliberate omissions

Things the app does *not* have, and why:

- **No demo or seed data.** Every number on every screen is derived from a live API
  response. Where the API has no aggregate endpoint, the app derives from the timeline it
  already fetched rather than inventing a figure.
- **No report upload from a doctor.** `POST /reports/create` is `verifyPatient` — reports
  belong to the patient. A doctor's contribution is a note on a report.
- **No prescription creation from a patient.** `POST /prescriptions/create` is
  `verifyDoctor`. The patient sees prescriptions read-only.
- **No "all reports" endpoint.** `ReportsPage` derives its flat list from the timeline
  payload via `flattenReports`, which keeps every report attached to its case.
- **No state or data-fetching library.** ~100 files, one shared read hook and one write
  hook; Redux or React Query would be more machinery than the problem needs.
- **No test suite.** None was requested and the backend has none to mirror. Verification
  was `npm run build` (clean) plus a manual pass over the documented flows.

---

## 9. Verifying a change

```bash
npm run build     # must stay clean
npm run dev       # then walk the flow you touched
```

Checklist that matches the contract above:

- A brand-new account shows **empty states, not errors** (that is `emptyOn` working).
- A 404 on `GET /family/my-groups`, `/digital-will/me`, `/ai-summary/:id` never renders red.
- Write handlers return a boolean and only toast on success — remember `run` returns
  `null` on failure instead of throwing.
- Nothing offers an action the backend's middleware would reject.
- Any new screen has all four states: loading, empty, error, content.
