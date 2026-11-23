# OMT Platform — Vehicle Asset & Yard Management System

A production-grade, enterprise web application built for vehicle asset tracking, salvage routing, and storage yard lifecycle management.

---

##  Executive Summary

The **OMT Platform** manages the lifecycle of automotive assets from reception to either whole-vehicle remarketing or systematic salvage dismantling. It enforces strict **Role-Based Access Control (RBAC)** across multi-facility storage yards and vehicle inventories with real-time **VIN validation and decoding**.

---

##  Architecture & Clean Code Principles

This codebase is intentionally designed following clean, standard, and maintainable software engineering practices — avoiding over-complicated abstractions so any developer or lead can read, audit, and extend it with confidence.

### The 10 Best Engineering Practices Implemented

| # | Practice | How It Is Implemented in This Codebase |
|---|---|---|
| **1** | **Don't write everything in `App.jsx`** | `src/App.tsx` contains only routing, layouts, and auth guards. Each feature has its dedicated page component under `src/pages/`. |
| **2** | **Don't repeat component code** | Reusable presentational components live in `src/components/common/` (`StatusBadge`, `EmptyState`, `ErrorBanner`, `OmtLogoLoader`). |
| **3** | **Keep API calls separate from UI** | Dedicated service modules in `src/services/` (`yardService.ts`, `vehicleService.ts`, `dashboardService.ts`, `authService.ts`). UI components call typed methods, never raw URLs. |
| **4** | **Use environment variables for API URLs** | Configured via `.env` (`VITE_API_URL=http://localhost:8080/api`) with a version-controlled `.env.example` template. |
| **5** | **Maintain consistent naming conventions** | Components in `PascalCase` (`VehicleCreate.tsx`), services and utilities in `camelCase` (`yardService.ts`, `vinDecoder.ts`), standard TypeScript interfaces in `src/types/index.ts`. |
| **6** | **Show loading indicators during API calls** | Visual loading feedback with custom `OmtLogoLoader` and spin indicators on buttons during async requests. |
| **7** | **Handle empty data and API failures** | Friendly `EmptyState` with call-to-action buttons when lists are empty, and `ErrorBanner` with retry capabilities on network failures. |
| **8** | **Responsive for mobile, tablet, and desktop** | Flexbox and CSS grid layouts with mobile scroll tables, auto-collapsible sidebar (68px icon-mode vs 240px expanded), and fluid breakpoints. |
| **9** | **Avoid unnecessary component re-renders** | Uses `React.memo` on stateless badges/banners, and `useCallback` on event handlers and debounced search triggers. |
| **10** | **Maintain proper form validation** | Real-time field validation, 17-character ISO 3779 VIN checking (disallowing 'I', 'O', 'Q'), year boundaries, and disabled action buttons during submit. |

---

##  Project Directory Structure

```text
src/
├── components/
│   ├── auth/
│   │   └── AuthSplitLayout.tsx     # Reusable two-column authentication layout
│   ├── common/
│   │   ├── EmptyState.tsx          # Reusable empty data screen with CTA
│   │   ├── ErrorBanner.tsx         # Reusable error alert with retry button
│   │   ├── OmtLogoLoader.tsx       # Custom animated OMT SVG logo loader
│   │   └── StatusBadge.tsx         # Standardized status and routing pills
│   ├── layout/
│   │   └── AppLayout.tsx           # Collapsible sidebar (68px/240px) + top nav
│   └── ProtectedRoute.tsx          # Client-side role and session authentication guard
├── context/
│   └── AuthContext.tsx             # Global user authentication and session state
├── pages/
│   ├── Dashboard.tsx               # Operational metrics and KPI cards
│   ├── Login.tsx / MfaLogin.tsx    # Authentication entry points
│   ├── Profile.tsx                 # User profile and password management
│   ├── VehicleCreate.tsx           # Vehicle registration + real-time VIN decoding
│   ├── VehicleDetail.tsx           # Asset details, workflow progression, edit
│   ├── VehicleList.tsx             # Searchable/filterable vehicle asset registry
│   ├── YardCreate.tsx              # Yard creation page
│   ├── YardDetail.tsx              # Yard details, capacity metrics, edit/deactivate
│   └── YardList.tsx                # Storage yard registry + "+ New Yard" modal
├── services/
│   ├── api.ts                      # Central Axios client with JWT interceptors
│   ├── authService.ts              # Authentication & password endpoints
│   ├── dashboardService.ts         # Aggregated KPI dashboard endpoints
│   ├── vehicleService.ts           # Vehicle registry and lifecycle endpoints
│   └── yardService.ts              # Storage yard endpoints
├── types/
│   └── index.ts                    # TypeScript models (Yard, Vehicle, User, etc.)
└── utils/
    └── vinDecoder.ts               # ISO 3779 WMI VIN decoding & NHTSA vPIC lookup
```

---

##  How to Explain This Code to Your Leads & Interviewers

When presenting this project to your technical leads, use this structured walkthrough:

### 1. High-Level Architecture (The 1-Minute Pitch)
> *"This is a React 19 + TypeScript frontend backed by a Spring Boot 3 REST API and PostgreSQL database. The frontend is built with modular service layers, reusable UI components, and role-based guards. It allows storage yard operators and administrators to track yards and vehicle assets, automatically decode vehicle VINs, and advance salvage workflows."*

### 2. Role-Based Access Control (RBAC)
Explain the distinction between the two seeded roles:
- **`ADMIN` (`admin@omt.com` / `Admin@123`)**:
  - Full operational access: create, edit, activate, and deactivate yards.
  - Can register and edit vehicles, update workflow statuses, and view analytics.
- **`STAFF` (`staff@omt.com` / `Staff@123`)**:
  - Can create yards (via "+ New Yard" modal) and register/edit vehicles.
  - **Security Enforcement**: Staff **cannot deactivate yards**. Even if a user attempts to send a `PATCH /api/yards/{id}/status` request directly, the backend `@PreAuthorize("hasRole('ADMIN')")` will reject the call with `403 Forbidden`.

### 3. Core Business Logic & Invariants
- **Yard Deactivation Guard**: A yard **cannot be deactivated while active vehicles are assigned to it**. The system checks `activeVehicleCount` before allowing deactivation, preventing orphaned inventory.
- **Forward-Only Vehicle Lifecycle**: Vehicle processing status strictly advances forward:
  $$\text{RECEIVED} \longrightarrow \text{IN\_PROGRESS} \longrightarrow \text{COMPLETED}$$
- **Asset Immutability**: Once a vehicle reaches `COMPLETED`, it becomes read-only to preserve salvage audit trails.
- **Vehicle Parts Inventory & Extraction Workflow**:
  - When staff clicks on any vehicle, its complete parts catalog is displayed (Body Panels, Engine, Electrical, Brakes, Suspension, Interior).
  - Each part card features an interactive **Extraction Capability Toggle** (`🟢 Can Be Extracted` / `🔴 Cannot Be Extracted`).
  - Staff can click directly on the dropdown on any part card to update whether it can be extracted or not.
  - The change updates the backend via `PATCH /api/vehicles/{vehicleId}/parts/{partId}/extraction` and recalculates the real-time Parts Breakdown progress bars.
- **Dynamic & Exact Pagination Architecture**:
  - Reusable component `src/components/common/Pagination.tsx` eliminates code duplication across tables.
  - Dynamically calculates the exact range (e.g. `Showing 1 to 8 of 8 results` or `Showing 11 to 20 of 35 results`), avoiding static or hardcoded text.
  - Supports configurable page sizes (`5`, `10`, `20`, `50` / page), previous/next arrow navigation, and active page highlighting with responsive mobile wrapping.
  - Slices data client-side (`(currentPage - 1) * pageSize` to `currentPage * pageSize`) and resets back to page 1 automatically whenever search terms or filters change.
- **Real-Time VIN Decoding**:
  - Validates standard ISO 3779 format: exactly 17 alphanumeric characters, excluding invalid letters `I`, `O`, `Q`.
  - Parses World Manufacturer Identifiers (WMI) to instantly detect Make and Model (e.g., `1HG` &rarr; Honda Accord, `WAU` &rarr; Audi A3, `5UX` &rarr; BMW X5).
  - Automatically pre-fills the form fields (Make, Model, Year) to eliminate manual data entry errors.

### 4. Code Organization & Separation of Concerns
Point your leads to these specific layers:
- **API Decoupling**: If an endpoint URL changes, only `src/services/` changes; no UI components need editing.
- **JWT Interceptor**: `src/services/api.ts` automatically attaches `Authorization: Bearer <token>` on all outgoing requests and redirects to login on `401 Unauthorized`.
- **Collapsible Responsive Navigation**: `src/components/layout/AppLayout.tsx` persists sidebar collapsed/expanded state in `localStorage` (`omt_sidebar_collapsed`).

---

##  Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- Running Spring Boot backend on `http://localhost:8080`

### 1. Environment Configuration
Verify that `.env` exists in the `frontend` folder (or copy from `.env.example`):
```bash
cp .env.example .env
```
Contents:
```env
VITE_API_URL=http://localhost:8080/api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
This triggers TypeScript verification (`tsc -b`) followed by Vite optimization.

---

##  Automated Playwright End-to-End Tests

The repository includes a comprehensive Playwright automation suite covering all key user journeys:
1. **Authentication & Profile Settings**: Admin/Staff sign in, initial avatar display, profile editing, change password.
2. **Collapsible Navigation**: 68px icon-only state vs 240px expanded state.
3. **Yard Management**: Yard creation by Admin and Staff, and deactivation restriction enforcement.
4. **Vehicle Asset Management & Search**: VIN lookup, status filtering, details inspection.
5. **Real-Time VIN Decoding**: Live vehicle identification and auto-population from VIN.
6. **Vehicle Parts & Extraction Toggle**: Display vehicle parts inventory, click part to toggle between `Can Be Extracted` and `Cannot Be Extracted`.

To run the full suite:
```bash
npx playwright test
```

To run with the visual test runner:
```bash
npx playwright test --ui
```

---

##  Seeded Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **ADMIN** | `admin@omt.com` | `Admin@123` | Full access (manage yards, deactivate yards, manage vehicles) |
| **STAFF** | `staff@omt.com` | `Staff@123` | Operational access (browse & create yards, register & advance vehicles) |

---

##  License & Confidentiality
*Okoh Mobility Technologies, Inc. (OMT) — Confidential & Proprietary.*
