# Smart E-Mobility Hub — VNU-HCM Frontend

Web frontend for **Smart E-Mobility Hub**, an electric mobility coordination, smart charging, and dynamic load balancing (DLB) platform for the **Vietnam National University, Ho Chi Minh City (VNU-HCM) Urban Area** (HCMUT CO3001 Software Engineering, Class CC03, Group 06).

---

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite 6
- **Routing:** TanStack Router v1 (file-based kebab-case routes with `~` prefix)
- **Styling & Design System:** Tailwind CSS v3 + CSS semantic design tokens (`src/index.css`, `tailwind.config.cjs`)
- **State Management:** Zustand 5 domain slices (`src/stores/mobility/`, `src/stores/auth-store.ts`)
- **Interactive Spatial Map:** Leaflet + OpenStreetMap tiles pinned to real VNU-HCM Urban Area GPS coordinates (`Suoi Tien Metro Station`, `Dormitory Zone A`, `Dormitory Zone B`, `HCMUT Campus 2`, `Central Library`)
- **Tooling:** Yarn 1.x, ESLint 9, Prettier 3

---

## Prerequisites & Quickstart

- **Node.js:** `>= 20.x` (tested on `v22.20.0`)
- **Yarn:** `>= 1.22.x`

```bash
# 1. Install dependencies
yarn install

# 2. Start local development server (http://localhost:3000)
yarn dev --port 3000

# 3. Type-check, lint, and build for production
yarn check-types
yarn lint
yarn build
```

---

## Mock Accounts (Local Authentication)

All authentication flows (Login, 5-attempt Lockout, Sign Up, OTP Reset Password) run against the client-side credential store in `src/data/accounts.seed.ts` and `src/stores/auth-store.ts`. Signed-in sessions persist in `localStorage` under `emobility_auth_email`.

| Role | Email | Password | Display Name | Default Landing Route |
| --- | --- | --- | --- | --- |
| **Student** (Default) | `student@vnuhcm.edu.vn` | `student123` | Nguyễn Công Minh | `/student/vehicles` |
| **Student** | `binh.ta@hcmut.edu.vn` | `student123` | Tạ Thanh Bình | `/student/vehicles` |
| **Lead Hub Operator** | `operator@hcmut.edu.vn` | `operator123` | Trương Minh Trân | `/operator/monitoring` |
| **Field Operations Crew** | `crew@vnuhcm.edu.vn` | `crew123` | Đinh Phạm Ngọc Phước | `/operator/redistribution` |
| **System Administrator** | `admin@hcmut.edu.vn` | `admin123` | Nguyễn Đức Trọng | `/operator/monitoring` |

> Signing up on `/sign-up` registers a temporary in-memory `STUDENT` account for the current browser session. Entering wrong credentials 5 consecutive times triggers the `15:00` temporary lockout screen, which can be cleared via password reset or lockout reset.

---

## E2E Test Flows (Frontend Only)

Run `yarn dev --port 3000`, open `http://localhost:3000`, and test these 6 end-to-end journeys sequentially:

### Flow 1 — Authentication, Lockout & Password Reset
1. Open `/login` → enter wrong password 5 times → verify lockout banner (`15:00` countdown) blocks further sign-in.
2. Click **Forgot?** → navigate to `/reset-password` → enter 6 digits into the OTP boxes + new password → submit → verify redirect to `/login` and lockout cleared.
3. Click **Sign Up** (`/sign-up`) → submit form → verify auto-login and redirect to `/student/vehicles`.
4. Sign out from sidebar profile → log in as default Student `student@vnuhcm.edu.vn` / `student123`.

### Flow 2 — Student Shared EV Rental Lifecycle
1. On `/student/vehicles`: test search bar, **Filters** popover (`Type: E-Bike`, `Battery: >= 50%`, `Apply Filters`), removable filter chips, pagination (`1–3 of 8` → page `2`), **Nearest Hub**, and clicking hub cards on the Leaflet map (`Zoom -` down to `70%` → Reset `100%`).
2. Click **View Details →** on an available EV → opens `/student/vehicles/$id` → click **Reserve Vehicle** → verify hold countdown and `CONFIRMED` status.
3. Click **Proceed to Pickup →** (`/student/vehicles/unlock`) → test **Preview Scan Error**, click **Scan Again**, then click **Simulate Scan** → auto-redirects to `/student/vehicles/trip` after unlock loader.
4. On `/student/vehicles/trip`: Step 1 select Destination Hub → **Continue**; Step 2 tick physical lock checkbox & condition → **Confirm Vehicle Return**; Step 3 verify Digital Trip Receipt & updated Trip History.

### Flow 3 — Student Personal Parking & Charging Lifecycle
1. Open `/student/parking` → pick Hub, vehicle, arrival window, and bay on floor grid → **Continue to Confirm** → **Confirm Reservation** → redirects to `/student/parking/pass`.
2. On `/student/parking/pass`: click **Confirm Gate Check-in** → switch to **Book Charging Session** tab → choose connector, port, Target SoC → **Start / Book Charging Session →** → opens `/student/charging/live`.
3. On `/student/charging/live`: test `Simulate +10% SoC`, toggle `Throttle Alert (DLB)` and `Interrupted (Recoverable)` → click **Resume Charging** or **Reassign Port**.
4. Click **Stop Charging** → **Stop & Exit Hub (Release Bay)** → verify combined parking + charging receipt and exit path on `/student/charging/exit`.

### Flow 4 — Operator Network Monitoring & Equipment Isolation (Cross-Role Sync)
1. Sign out and log in as Operator (`operator@hcmut.edu.vn` / `operator123`) → lands on `/operator/monitoring`.
2. Verify Hub Priority Queue pagination (`1–3 of 5`), status filter pills (`All`, `Critical`, `Warning`, `Normal`), and click `Dormitory Zone B` → `/operator/monitoring/hub-dorm-b` (inspect 12-port matrix and **Overdue Vehicles** drawer).
3. Open `/operator/incidents` → filter incidents (`Pending Triage`), click **Isolate** on `#INC-2026-104` (`CP-B04`) → step through the 3-step safety isolation modal → verify `CP-B04` transitions to `ISOLATED` in `/operator/monitoring/hub-dorm-b`.

### Flow 5 — Smart Grid DLB, Fleet Redistribution & Field Crew Ticket
1. Open `/operator/smart-charging`: on **Smart Charging Schedule**, click **Generate Charging Schedule** → **Apply Schedule**; switch to **Real-Time Grid & DLB**, toggle `Critical Overload (88% · Throttle)` and check paginated DLB Activity Log.
2. Open `/operator/redistribution` (**Dispatch & Spatial Map** tab): select source/destination hubs, EV count, crew **Đinh Phạm Ngọc Phước**, click **Approve and Dispatch** → verify new order card appears.
3. Sign out and log in as Field Crew (`crew@vnuhcm.edu.vn` / `crew123`) → lands on **Work Ticket Tracking** (`ORD-6767`) → test Scanned Vehicle List pagination (`1–5 of 10`), click **Scan All EV to Close Ticket** → **Close Work Ticket**.

### Flow 6 — What-if Simulation to Operational Dispatch
1. Log in as Operator (`operator@hcmut.edu.vn`) → open `/operator/simulation` → apply preset (`Monday Morning Peak`), adjust deltas, review scenario, and click **Run Simulation →** (`/operator/simulation/$id`).
2. Wait for progress to reach `100%` → inspect bottleneck heatmap & Hub Impact table → click **View Recommendations** → approve a Scheduling or Redistribution recommendation (**Dispatch to Operations →**).
3. Navigate back to `/operator/redistribution` or `/operator/smart-charging` DLB log to verify the newly dispatched operational record appears live.

---

## Implemented Routes

| Scope | Routes |
| --- | --- |
| **Authentication** | `/login`, `/sign-up`, `/reset-password` |
| **Shared EV Rental** | `/student/vehicles`, `/student/vehicles/$id`, `/student/vehicles/unlock`, `/student/vehicles/trip` |
| **Personal Parking & Charging** | `/student/parking`, `/student/parking/pass`, `/student/charging/live`, `/student/charging/exit` |
| **Network Monitoring & Incidents** | `/operator/monitoring`, `/operator/monitoring/$id`, `/operator/incidents` |
| **Smart Grid & Redistribution** | `/operator/smart-charging`, `/operator/redistribution` |
| **What-If Simulation** | `/operator/simulation`, `/operator/simulation/$id` |
| **Design System** | `/design-system` |
