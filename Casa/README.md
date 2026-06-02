# Casa — Luxury Furniture E-Commerce Application

> A full-stack, cross-platform mobile and web application built with React Native (Expo), TypeScript, and Supabase. Casa features a dual-system architecture serving both end-customers and administrators through a secure, role-based access control system.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Database Schema](#4-database-schema)
5. [Security Implementation](#5-security-implementation)
6. [Local Setup Guide](#6-local-setup-guide)
7. [Environment Variables](#7-environment-variables)
8. [Admin vs. User Capabilities Matrix](#8-admin-vs-user-capabilities-matrix)
9. [Key Features](#9-key-features)

---

## 1. Project Overview

**Casa** is a premium furniture e-commerce platform designed for cross-platform deployment (iOS, Android, and Web). The application operates on a dual-system model:

- **User Side** — A full shopping experience: browse a curated furniture catalog, filter by category, view product details with a live color customization tool, manage a shopping cart, place orders, and track order history.
- **Admin Side** — A protected management dashboard: create, edit, and soft-delete inventory items, manage orders, review audit logs, and maintain full operational control without ever exposing raw database records to the user-facing interface.

All user data and administrative actions are persisted in **Supabase** (PostgreSQL), protected by Row Level Security (RLS) policies enforced at the database level — independent of the application layer.

---

## 2. Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native via Expo SDK 54 |
| **Language** | TypeScript (strict mode) |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage) |
| **State Management** | Zustand |
| **Form Handling** | React Hook Form |
| **Schema Validation** | Zod (with XSS + SQL injection sanitization) |
| **Navigation** | React Navigation v6 (Native Stack + Bottom Tabs) |
| **Secure Storage** | Expo SecureStore (native) / localStorage (web) |
| **Icons** | @expo/vector-icons (Ionicons) |
| **Image Picker** | expo-image-picker |

### Application Flow

```
App Launch
    │
    ▼
RootNavigator
    │
    ├── [No Session]  ──► AuthNavigator
    │                        ├── OnboardingScreen
    │                        ├── LoginScreen
    │                        ├── RegisterScreen
    │                        └── ForgotPasswordScreen
    │
    ├── [role = 'user'] ──► UserNavigator
    │                          ├── HomeScreen (catalog feed)
    │                          ├── CatalogScreen (full grid)
    │                          ├── ProductDetailsScreen (color picker)
    │                          ├── CartScreen
    │                          ├── CheckoutScreen
    │                          ├── OrderHistoryScreen
    │                          └── ProfileScreen
    │
    └── [role = 'admin'] ──► AdminNavigator
                               ├── DashboardScreen
                               ├── ManageProductsScreen
                               ├── EditProductScreen (create/update)
                               ├── ManageOrdersScreen
                               ├── AuditLogsScreen
                               └── AdminProfileScreen
```

---

## 3. Directory Structure

```
Casa/
├── assets/
│   ├── products/          # Local furniture product images (JPG)
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
│
├── src/
│   ├── components/        # Shared UI components (Button, Input, Loading)
│   ├── constants/
│   │   └── theme.ts       # Design system: colors, spacing, typography, shadows
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   ├── lib/
│   │   └── supabase.ts    # Supabase client with chunked SecureStore adapter
│   ├── navigation/
│   │   ├── RootNavigator.tsx   # RBAC gate: renders Auth / User / Admin stack
│   │   ├── AuthNavigator.tsx
│   │   ├── UserNavigator.tsx
│   │   ├── AdminNavigator.tsx
│   │   └── types.ts
│   ├── screens/
│   │   ├── auth/          # OnboardingScreen, LoginScreen, RegisterScreen, ForgotPasswordScreen
│   │   ├── user/          # HomeScreen, CatalogScreen, ProductDetailsScreen, CartScreen, ...
│   │   └── admin/         # DashboardScreen, ManageProductsScreen, EditProductScreen, ...
│   ├── services/
│   │   ├── authService.ts      # Auth operations + centralized error parser
│   │   └── furnitureService.ts # CRUD + soft-delete + activity logging
│   ├── store/
│   │   ├── authStore.ts        # Zustand: session, role, sign-in/up/out
│   │   └── cartStore.ts        # Zustand: cart items, quantities
│   ├── types/
│   │   └── database.ts         # TypeScript interfaces: Profile, Furniture, ActivityLog
│   └── utils/
│       ├── helpers.ts          # formatCurrency()
│       └── validation.ts       # Zod schemas with XSS + SQL injection sanitization
│
├── .env                   # Local environment variables (NOT committed to Git)
├── .env.example           # Template for environment setup
├── .gitignore             # Excludes .env, node_modules, dist, .expo
├── app.json               # Expo configuration (icon, splash, bundle ID)
├── package.json
├── tsconfig.json
└── supabase_setup.sql     # Full database schema + RLS policies
```

---

## 4. Database Schema

### Table: `profiles`

Automatically created via database trigger on `auth.users` registration.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PRIMARY KEY, references `auth.users(id)` |
| `username` | `text` | NOT NULL, UNIQUE |
| `full_name` | `text` | NULLABLE |
| `avatar_url` | `text` | NULLABLE |
| `phone_number` | `text` | NULLABLE |
| `address` | `text` | NULLABLE |
| `role` | `text` | DEFAULT `'user'`, CHECK IN (`'user'`, `'admin'`) |
| `updated_at` | `timestamptz` | DEFAULT `now()` |

---

### Table: `furniture`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` |
| `name` | `text` | NOT NULL |
| `price` | `numeric(10,2)` | NOT NULL, CHECK > 0 |
| `description` | `text` | NOT NULL |
| `category` | `text` | NOT NULL, CHECK IN (`'Living'`, `'Dining'`, `'Bedroom'`, `'Workspace'`, `'Outdoor'`) |
| `image_url` | `text` | NOT NULL |
| `is_deleted` | `boolean` | DEFAULT `false` |
| `created_at` | `timestamptz` | DEFAULT `now()` |

---

### Table: `activity_logs`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` |
| `admin_id` | `uuid` | NOT NULL, references `profiles(id)` |
| `action` | `text` | NOT NULL, CHECK IN (`'ADD_ITEM'`, `'EDIT_ITEM'`, `'DELETE_ITEM'`) |
| `details` | `text` | NULLABLE |
| `created_at` | `timestamptz` | DEFAULT `now()` |

---

## 5. Security Implementation

### 5.1 Row Level Security (RLS) — RBAC Enforcement

All three tables have RLS **enabled**. Policies enforce the following rules at the **database level**, independent of the application:

#### `profiles` Table

| Policy | Role | Operation | Rule |
|---|---|---|---|
| Users read own profile | `authenticated` | SELECT | `auth.uid() = id` |
| Users update own profile | `authenticated` | UPDATE | `auth.uid() = id` |
| Admins read all profiles | `authenticated` | SELECT | `role = 'admin'` in own profile |

#### `furniture` Table

| Policy | Role | Operation | Rule |
|---|---|---|---|
| Public read active items | `anon`, `authenticated` | SELECT | `is_deleted = false` |
| Admins read all items | `authenticated` | SELECT | Requester has `role = 'admin'` |
| Admins insert items | `authenticated` | INSERT | Requester has `role = 'admin'` |
| Admins update items | `authenticated` | UPDATE | Requester has `role = 'admin'` |

> **Note:** Hard `DELETE` is never permitted via RLS. Removal is performed exclusively via `UPDATE SET is_deleted = true` (soft-delete).

#### `activity_logs` Table

| Policy | Role | Operation | Rule |
|---|---|---|---|
| Admins insert logs | `authenticated` | INSERT | Requester has `role = 'admin'` |
| Admins read logs | `authenticated` | SELECT | Requester has `role = 'admin'` |

---

### 5.2 Soft-Delete Architecture

When an Admin deletes a product from the dashboard, the application calls:

```typescript
// furnitureService.ts
await supabase
  .from('furniture')
  .update({ is_deleted: true })
  .eq('id', id);
```

The User-facing catalog query **always** appends a filter:
```typescript
query = query.eq('is_deleted', false);
```

This guarantees:
- ✅ Deleted items **instantly vanish** from the User view
- ✅ The database record is **fully preserved** for audit/recovery
- ✅ The Admin can still view and report on deleted items

---

### 5.3 Input Validation — XSS & SQL Injection Mitigation

All user input passes through **Zod schemas** in `src/utils/validation.ts` before reaching Supabase. String fields are guarded by two sanitization layers:

```typescript
// Blocks <script>, javascript:, on*=, <iframe>
const noXSS = (val: string) =>
  !/<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(val) &&
  !/javascript\s*:/gi.test(val) &&
  !/on\w+\s*=/gi.test(val) &&
  !/<\s*iframe/gi.test(val);

// Blocks DROP, DELETE, INSERT, UPDATE, SELECT, UNION, --, ;
const noSQLInjection = (val: string) =>
  !/(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bSELECT\b|\bUNION\b|--|;)/i.test(val);
```

Applied to: `fullName`, `address`, `name` (furniture), `description` (furniture).

---

### 5.4 Additional Security Measures

| Measure | Implementation |
|---|---|
| **Password hashing** | Delegated entirely to Supabase Auth (bcrypt) — plain-text passwords are never stored or logged |
| **Session persistence** | Supabase JWT stored in Expo SecureStore (native) or `localStorage` (web) via chunked adapter |
| **Token auto-refresh** | `autoRefreshToken: true` in Supabase client config |
| **Environment secrets** | All keys in `.env` via `EXPO_PUBLIC_*` — `.env` is excluded from Git via `.gitignore` |
| **Role enforcement** | Role fetched from the `profiles` database table after every sign-in — never from JWT claims or email heuristics |
| **Error sanitization** | All Supabase/Postgres errors routed through `parseAuthError()` — raw error codes translated to friendly messages before reaching the UI |
| **Image URL allowlist** | `imageUrl` Zod field restricted to `http://`, `https://`, `file://`, `data:image/` schemes only |
| **Client-side role lock** | Sign-up always sends `role: 'user'` in metadata — admin promotion only possible via direct database change |

---

## 6. Local Setup Guide

### Prerequisites

- Node.js **v18+**
- npm **v9+**
- Expo CLI (`npm install -g expo-cli`)
- A Supabase project (free tier at [supabase.com](https://supabase.com))

### Step 1 — Clone the Repository

```bash
git clone <your-repository-url>
cd Casa
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Configure Supabase Database

1. Open your Supabase project → **SQL Editor**
2. Copy the contents of `supabase_setup.sql` (located at the project root)
3. Run the script — this creates all tables, enables RLS, and installs policies and triggers

### Step 4 — Configure Environment Variables

Create a `.env` file in the project root (see [Section 7](#7-environment-variables)):

```bash
cp .env.example .env
```

Then fill in your Supabase credentials.

### Step 5 — Start the Development Server

```bash
npx expo start
```

| Platform | Command |
|---|---|
| Web browser | Press `w` in the terminal |
| iOS Simulator | Press `i` |
| Android Emulator | Press `a` |
| Physical device | Scan the QR code with Expo Go |

### Step 6 — Create an Admin Account

After registering a standard user account, promote it to admin via Supabase:

```sql
UPDATE profiles
SET role = 'admin'
WHERE username = 'your_username';
```

Sign out and sign back in — the app will automatically route to the Admin Dashboard.

---

## 7. Environment Variables

Create a `.env` file at the project root with the following structure:

```env
# Supabase Configuration
# Obtain these from: Supabase Dashboard → Project Settings → API
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

> ⚠️ **Security Note:** Never commit your `.env` file to version control. The `.gitignore` in this project already excludes it. The `ANON` key is safe to use client-side — it only grants access permitted by your RLS policies. **Never** place your `SERVICE_ROLE` key in client code.

---

## 8. Admin vs. User Capabilities Matrix

| Feature | 👤 User | 🔐 Admin |
|---|---|---|
| Browse furniture catalog | ✅ | ✅ |
| Filter by category | ✅ | ✅ |
| View product details | ✅ | ✅ |
| Color customization preview | ✅ | ❌ |
| Add items to cart | ✅ | ❌ |
| Checkout & place orders | ✅ | ❌ |
| View own order history | ✅ | ❌ |
| Edit own profile (name, address, phone) | ✅ | ✅ |
| Change username | ✅ | ❌ |
| Upload profile avatar | ✅ | ✅ |
| View all inventory (incl. deleted) | ❌ | ✅ |
| Add new furniture products | ❌ | ✅ |
| Edit existing products | ❌ | ✅ |
| Soft-delete products | ❌ | ✅ |
| View activity/audit logs | ❌ | ✅ |
| Manage all orders | ❌ | ✅ |
| Access Admin Dashboard | ❌ | ✅ |

---

## 9. Key Features

### User-Facing
- 🏠 **Home Feed** — Curated product grid with promo banner, category filter pills, and live search
- 🎨 **Color Customization** — Per-product color picker that live-tints furniture photos using CSS `mix-blend-mode`
- 🛒 **Cart & Checkout** — Full cart management with quantity controls and order placement
- 📦 **Order History** — Complete record of past purchases
- 👤 **Profile Management** — Edit personal details and avatar

### Admin-Facing
- 📊 **Dashboard** — Overview of inventory metrics and recent activity
- ➕ **Product Management** — Create and edit products with image upload to Supabase Storage
- 🗑️ **Soft-Delete** — Safe inventory removal that preserves database integrity
- 📋 **Audit Logs** — Full traceability of every admin action (add/edit/delete)

### Cross-Cutting
- 🔐 **RBAC** — Role gating enforced at both navigation and database (RLS) levels
- 🌐 **Cross-Platform** — Runs on iOS, Android, and Web from a single codebase
- 🧪 **Mock Mode** — Works fully offline with local data when Supabase is not configured
- 🔒 **Secure Auth** — bcrypt password hashing, JWT session management, SecureStore persistence

---

*Built with ❤️ using React Native Expo + Supabase*
