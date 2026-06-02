# PROJECT REPORT
## Casa — Luxury Furniture E-Commerce Application
### Final Submission Document | Mobile Application Development

---

| | |
|---|---|
| **Application Name** | Casa — Luxury Furniture E-Commerce Platform |
| **Platform** | Cross-Platform Mobile & Web (iOS / Android / Web) |
| **Framework** | React Native via Expo SDK 54 |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, RLS) |
| **Language** | TypeScript (Strict Mode) |
| **Submission Phase** | Part 9 — Final Submission & Reflection |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Requirement Fulfillment Checklist](#2-requirement-fulfillment-checklist)
3. [Technical Architecture Retrospective](#3-technical-architecture-retrospective)
4. [Cybersecurity & Data Integrity Reflection](#4-cybersecurity--data-integrity-reflection)
5. [Personal Engineering Key Takeaways](#5-personal-engineering-key-takeaways)
6. [Final Project Deliverables Index](#6-final-project-deliverables-index)

---

## 1. Executive Summary

**Casa** is a fully functional, production-grade, cross-platform furniture e-commerce application developed using React Native (Expo SDK 54), TypeScript, and Supabase as the Backend-as-a-Service infrastructure. The system was architected and completed across nine structured development phases, progressing from initial project scaffolding through to security hardening, documentation, and final reflection.

The application operates as a **dual-system platform** serving two distinct, isolated user experiences from a single shared codebase:

The **User-Facing System** provides a premium shopping experience featuring a curated furniture catalog with category filtering and live search, individual product detail pages with a real-time CSS color customization tool, a persistent shopping cart, a full checkout flow, order history tracking, and a self-service profile management screen.

The **Admin-Facing System** provides a secure operations dashboard featuring full inventory management (create, edit, and soft-delete furniture products), order oversight, a complete administrative audit log trail, and a dedicated admin profile screen. Admin accounts access an entirely separate navigation stack that is structurally inaccessible to standard user sessions at the application layer.

The two systems interact with a shared **Supabase PostgreSQL** database, where data integrity and access control are enforced through Row Level Security (RLS) policies that operate at the database engine level — independent of the client application. This guarantees that even technically sophisticated users who attempt to bypass the frontend cannot escalate privileges or access protected data.

The frontend-to-backend interaction is governed by Supabase's auto-generated RESTful API (PostgREST), secured with JWT-authenticated sessions managed by Expo SecureStore on native platforms and `localStorage` on web. Global application state is managed by **Zustand** stores, ensuring that authentication status, user roles, and cart data remain consistent across every component and screen without prop-drilling or redundant API calls.

The result is a scalable, maintainable, and secure full-stack application that meets and exceeds all specified project requirements.

---

## 2. Requirement Fulfillment Checklist

### 2.1 Core Application Requirements

| # | Requirement Description | Status | Location in Source Code |
|---|---|---|---|
| 1 | Cross-platform mobile application (iOS, Android, Web) | ✅ Completed | `app.json`, Expo SDK 54 config |
| 2 | User registration with email and password | ✅ Completed | `src/screens/auth/RegisterScreen.tsx` |
| 3 | User login and session persistence | ✅ Completed | `src/store/authStore.ts`, `src/lib/supabase.ts` |
| 4 | Password strength enforcement | ✅ Completed | `src/utils/validation.ts` — `signupSchema` |
| 5 | Forgot password / reset flow | ✅ Completed | `src/screens/auth/ForgotPasswordScreen.tsx` |
| 6 | User profile management (name, address, phone, avatar) | ✅ Completed | `src/screens/user/ProfileScreen.tsx` |
| 7 | Furniture product catalog with images | ✅ Completed | `src/screens/user/HomeScreen.tsx`, `src/screens/user/CatalogScreen.tsx` |
| 8 | Category filtering of products | ✅ Completed | `HomeScreen.tsx` — `CATEGORIES` filter array |
| 9 | Live product search | ✅ Completed | `HomeScreen.tsx` — `filteredProducts` computed value |
| 10 | Product details screen | ✅ Completed | `src/screens/user/ProductDetailsScreen.tsx` |
| 11 | Shopping cart with quantity management | ✅ Completed | `src/screens/user/CartScreen.tsx`, `src/store/cartStore.ts` |
| 12 | Checkout and order placement | ✅ Completed | `src/screens/user/CheckoutScreen.tsx` |
| 13 | Order history view | ✅ Completed | `src/screens/user/OrderHistoryScreen.tsx` |

### 2.2 Admin System Requirements

| # | Requirement Description | Status | Location in Source Code |
|---|---|---|---|
| 14 | Admin-exclusive dashboard | ✅ Completed | `src/screens/admin/DashboardScreen.tsx` |
| 15 | Add new furniture products | ✅ Completed | `src/screens/admin/EditProductScreen.tsx` |
| 16 | Edit existing furniture products | ✅ Completed | `src/screens/admin/EditProductScreen.tsx` |
| 17 | Product image upload to cloud storage | ✅ Completed | `EditProductScreen.tsx` — Supabase Storage upload |
| 18 | Soft-delete products (`is_deleted = true`) | ✅ Completed | `src/services/furnitureService.ts` — `deleteFurniture()` |
| 19 | Deleted items hidden from user catalog | ✅ Completed | `furnitureService.ts` — `.eq('is_deleted', false)` filter |
| 20 | Activity log for all admin actions | ✅ Completed | `furnitureService.ts` — `logActivity()`, Supabase `activity_logs` table |
| 21 | Admin audit log screen | ✅ Completed | `src/screens/admin/AuditLogsScreen.tsx` |
| 22 | Manage orders (admin view) | ✅ Completed | `src/screens/admin/ManageOrdersScreen.tsx` |

### 2.3 Security & Access Control Requirements

| # | Requirement Description | Status | Location in Source Code |
|---|---|---|---|
| 23 | Role-Based Access Control (RBAC) | ✅ Completed | `src/navigation/RootNavigator.tsx` — conditional navigator rendering |
| 24 | Admin routes inaccessible to user accounts | ✅ Completed | `RootNavigator.tsx` — separate navigation stacks per role |
| 25 | Role fetched from database (not client-side trust) | ✅ Completed | `src/store/authStore.ts` — `getUserProfile()` post-login fetch |
| 26 | Database-level RLS enforcement | ✅ Completed | Supabase `furniture`, `profiles`, `activity_logs` table policies |
| 27 | Input validation (React Hook Form + Zod) | ✅ Completed | `src/utils/validation.ts` |
| 28 | XSS prevention via Zod sanitization | ✅ Completed | `validation.ts` — `noXSS()` regex guard |
| 29 | SQL Injection mitigation | ✅ Completed | `validation.ts` — `noSQLInjection()` regex guard + PostgREST parameterized queries |
| 30 | Secure session storage (SecureStore / localStorage) | ✅ Completed | `src/lib/supabase.ts` — chunked SecureStore adapter |
| 31 | Environment variable protection | ✅ Completed | `.env` + `.gitignore`, `EXPO_PUBLIC_*` pattern |
| 32 | Error messages never expose system internals | ✅ Completed | `src/services/authService.ts` — `parseAuthError()` |
| 33 | Password hashing (bcrypt) | ✅ Completed | Delegated to Supabase Auth — never handled client-side |

### 2.4 Data Integrity Requirements

| # | Requirement Description | Status | Location in Source Code |
|---|---|---|---|
| 34 | Profiles table with role column | ✅ Completed | Supabase `profiles` table — `role TEXT CHECK IN ('user', 'admin')` |
| 35 | Furniture table with all required columns | ✅ Completed | Supabase `furniture` table — `supabase_setup.sql` |
| 36 | Activity logs table with admin reference | ✅ Completed | Supabase `activity_logs` table — `admin_id` FK → `profiles.id` |
| 37 | Auto-profile creation on user registration | ✅ Completed | Supabase database trigger on `auth.users` INSERT |
| 38 | TypeScript interfaces for all database types | ✅ Completed | `src/types/database.ts` |
| 39 | No TypeScript compilation errors | ✅ Completed | `npx tsc --noEmit` → Exit code 0 |

---

## 3. Technical Architecture Retrospective

### 3.1 The Expo + Supabase Pairing

The decision to pair Expo with Supabase proved to be one of the most productive architectural choices of this project. What is traditionally a multi-service infrastructure problem — authentication, database, storage, real-time, and access control — was consolidated into a single, coherent backend platform.

**Role-Based Access Control via PostgreSQL RLS** eliminated an entire category of backend development work. In a conventional architecture, enforcing that a user cannot access admin data would require custom middleware, server-side route guards, and careful token validation on each endpoint. With Supabase RLS, these rules live in the database itself as SQL policies. The policy `auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')` on the `activity_logs` table means that no application code needs to enforce this — PostgreSQL does it unconditionally, for every request, from every client.

This approach provided a fundamental security guarantee: even if a bug in the application code accidentally allowed a regular user to call an admin function, the database would reject the request. Defense-in-depth was achieved structurally, not just through careful coding.

**Zustand for Global State** was significantly more effective than the alternatives considered. Its minimal API (a single `create()` call), its direct support for async actions, and its subscription-based reactivity meant that authentication state, role information, and cart data were immediately accessible from any component without providers, context nesting, or boilerplate. The `authStore` became the single source of truth for session state, and the `cartStore` persisted shopping cart data across screen navigations with zero additional infrastructure.

**React Hook Form + Zod** as a validation pipeline enforced a clean separation between UI state and validated, typed data. Form state never reached the service layer until Zod confirmed its shape and safety, making the entire data flow from user input to Supabase insertion predictable and auditable.

### 3.2 The Mock Mode Architecture

A particularly effective design decision was the **mock mode system** — when Supabase credentials are not configured, the application detects the placeholder `.env` values and operates entirely on local in-memory data using the `MOCK_FURNITURE` dataset. This enabled rapid UI development without any backend dependency, and it ensures the application is fully demonstrable in environments where a live Supabase connection is unavailable.

---

## 4. Cybersecurity & Data Integrity Reflection

### 4.1 Defence Against SQL Injection

SQL Injection attacks attempt to terminate a legitimate SQL string and inject a new, malicious command — for example, inputting `'; DROP TABLE furniture; --` into a search field. Casa addresses this at two independent layers.

At the **application layer**, Zod schemas in `src/utils/validation.ts` contain a `noSQLInjection()` regex guard that explicitly pattern-matches and rejects inputs containing SQL keywords (`DROP`, `DELETE`, `INSERT`, `UPDATE`, `SELECT`, `UNION`) and comment sequences (`--`, `;`). This blocks the attack before any network request is constructed.

At the **database layer**, the Supabase client communicates with PostgreSQL through PostgREST, which uses parameterized queries exclusively. The SQL structure is compiled and locked before user data is bound as a typed argument. The malicious payload is treated as a literal string value to be searched or stored — it cannot break out of its parameter context.

The result is that a SQL injection attempt is blocked twice: once in the JavaScript validation layer and once by the database engine itself.

### 4.2 Defence Against Cross-Site Scripting (XSS)

XSS attacks inject executable scripts into a web interface — for example, `<script>alert('hacked')</script>` submitted as a product name. Casa's defences operate across three layers.

The `noXSS()` Zod guard explicitly rejects inputs containing `<script>` tags, `javascript:` protocol strings, `on*=` event attribute patterns, and `<iframe>` injection attempts at the form validation layer.

Beyond validation, React Native's rendering architecture provides structural XSS immunity. React Native does not render to an HTML DOM — it renders to native platform primitives (UILabel, TextView). There is no HTML parser to interpret script tags. Any string that passes validation is rendered as literal characters on screen, regardless of its content.

### 4.3 Soft-Delete as a Data Integrity Practice

The decision to implement soft-deletion (`is_deleted = true`) rather than hard-deletion (`DELETE FROM furniture`) is both a security and a business architecture decision.

From a **data integrity** perspective, hard-deleting a product row that is referenced by historical order records causes referential integrity violations or data loss. A customer's purchase receipt would lose its product context. Soft-deletion preserves the complete historical record while removing the item from active visibility.

From a **business** perspective, soft-deletion enables accidental recovery. An incorrectly deleted product can be restored by an administrator with a single database update — no backup restoration required.

From a **security and audit** perspective, the `activity_logs` table records the exact timestamp and administrator identity for every deletion event. Combined with the preserved database row, this creates a complete, tamper-evident audit trail — a requirement in regulated commercial environments.

The implementation is deliberate: the user-facing catalog query appends `.eq('is_deleted', false)` at the service layer AND the Supabase RLS policy enforces the same filter at the database layer. A deleted item cannot appear in the user catalog through any code path or direct API call.

### 4.4 Unauthorized Route Access Prevention

The application guards against unauthorized access at two structural layers that must both fail independently for a breach to occur.

At the **navigation layer**, `RootNavigator.tsx` conditionally renders separate, isolated navigation stacks. A user session renders `UserNavigator` — the `AdminNavigator` and all its screens are simply not instantiated in the component tree. There is no URL or programmatic navigation path that can reach admin screens from a user session.

At the **database layer**, even if an attacker obtained a valid user JWT and called the Supabase API directly, every admin-restricted operation would be rejected by RLS. The database validates the caller's role on every single request, independently of what the application layer permitted.

---

## 5. Personal Engineering Key Takeaways

### 5.1 The Complexity of Dual-State Application Architecture

The most intellectually demanding challenge of this project was designing two completely distinct application experiences — an admin system and a user system — that coexist within a single TypeScript codebase without cross-contamination.

This is structurally analogous to a network routing problem: just as OSPF ensures that different network segments receive only the routing information relevant to their domain, our RootNavigator functions as a routing gateway that ensures each role is directed to exactly the stack of screens it is authorized to use, with no shared routes between them.

The critical insight was that **role-gating must be structural, not conditional**. The temptation is to render the same screens to all users and show/hide elements based on role. This approach is fragile — a single conditional check failing anywhere in the tree exposes privileged UI. The correct solution is to render fundamentally different navigator trees per role, making unauthorized access architecturally impossible at the React component level.

### 5.2 The Primacy of Database-Level Security

Before this project, the instinct was to solve authorization problems in the application layer. After implementing Supabase RLS, the key lesson is that **the database is the last and most important line of defense**, and authorization logic belongs there.

Client-side code can be inspected, modified, and bypassed by a determined attacker. A Supabase RLS policy written in PostgreSQL cannot be bypassed by any client — it executes inside the database engine on every request, regardless of how the request was constructed. This realization fundamentally changed how the security architecture was approached: the application layer is the user experience layer; the database layer is the security layer.

### 5.3 Validation as the First Line of Trust

Implementing Zod schemas with custom XSS and SQL injection guards made explicit something that is easy to overlook: **user input is adversarial by default**. Every string that enters the system from a text field must be assumed to be a potential attack until it has been validated against a strict schema.

The layered validation approach — Zod schema at the form layer, React Native rendering as structural XSS immunity, PostgREST parameterization at the network layer, and PostgreSQL type safety at the database layer — demonstrated that robust security is not a single feature but a design philosophy applied at every boundary where data crosses between trust levels.

### 5.4 Documentation as Engineering Discipline

Completing the documentation phases (README.md, MAINTENANCE.md, and this report) reinforced that professional software engineering is not complete when the last line of code is written. A system that cannot be understood, maintained, or extended by another engineer has limited real-world value. The discipline of writing precise technical documentation — database schemas, RLS policy tables, environment setup guides, and maintenance schedules — is as important a deliverable as the application itself.

---

## 6. Final Project Deliverables Index

| Deliverable | File / Location | Phase |
|---|---|---|
| Application source code | `src/` | Parts 1–5 |
| Product image assets | `assets/products/` (20 items) | Parts 3–5 |
| Expo configuration | `app.json` | Part 1 |
| Environment template | `.env.example` | Part 5 |
| Git exclusion rules | `.gitignore` | Part 5 |
| Database schema + RLS SQL | `supabase_setup.sql` | Part 2 |
| Technical documentation | `README.md` | Part 6 |
| Maintenance & scaling guide | `MAINTENANCE.md` | Part 8 |
| This submission report | `PROJECT_REPORT.md` | Part 9 |

---

## Declaration

This project — including its architecture, implementation, security design, and documentation — was completed in full accordance with the course requirements. All security implementations (Row Level Security, input validation, environment variable management, soft-delete, and error sanitization) are genuinely implemented in the production codebase and are verifiable by running the application locally following the instructions in `README.md`.

The application is ready for live demonstration and technical evaluation at any time.

---

*Casa E-Commerce Furniture Application — Final Submission*  
*Built with React Native Expo + Supabase + TypeScript*
