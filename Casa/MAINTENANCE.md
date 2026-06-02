# Casa — Post-Deployment Maintenance & Scaling Strategy

> This document outlines the operational procedures for monitoring, maintaining, and scaling the Casa E-Commerce Furniture Application after it has been released to a production environment.

---

## Table of Contents

1. [Production Logs & Monitoring](#1-production-logs--monitoring)
2. [Supabase Optimization & Scaling](#2-supabase-optimization--scaling)
3. [Security Lifecycle Updates](#3-security-lifecycle-updates)
4. [Feature Roadmap — Future Enhancements](#4-feature-roadmap--future-enhancements)

---

## 1. Production Logs & Monitoring

### 1.1 Application Crash & Runtime Error Tracking

Once the application is live, unhandled exceptions and runtime crashes must be captured automatically — users will not reliably report bugs.

#### Recommended Tool: Sentry

[Sentry](https://sentry.io) is the industry-standard crash reporting platform for React Native and Expo applications.

**Integration steps:**

```bash
npx expo install @sentry/react-native
```

In `App.tsx`, initialize Sentry before the root component mounts:

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.2, // Capture 20% of transactions for performance profiling
});
```

**What Sentry captures automatically:**
- JavaScript runtime exceptions and stack traces
- Unhandled promise rejections (e.g., failed Supabase queries)
- Device info, OS version, and app version at the time of crash
- Breadcrumbs — the sequence of user actions leading up to a crash

**Alerting:** Configure Sentry to send email or Slack notifications whenever a new crash type is detected, or whenever an existing issue exceeds a frequency threshold (e.g., > 10 occurrences per hour).

---

#### Supabase Edge Function Logs

For server-side operations and API call monitoring, Supabase provides built-in logging accessible directly from the dashboard:

```
Supabase Dashboard → Logs → API Logs / Edge Function Logs
```

**Key metrics to monitor weekly:**
| Metric | Healthy Range | Action if Exceeded |
|---|---|---|
| API error rate | < 1% | Investigate failed queries via Logs Explorer |
| Average query latency | < 200ms | Review missing indexes (see Section 2) |
| Auth failure rate | < 0.5% | Investigate potential brute-force attempts |
| Storage upload failures | < 2% | Check bucket size limits and file type restrictions |

---

### 1.2 Activity Log Audit Review

The `activity_logs` table (created in Part 2) records every admin `ADD_ITEM`, `EDIT_ITEM`, and `DELETE_ITEM` action. This table serves as the primary audit trail.

**Recommended review cadence:**

| Period | Action |
|---|---|
| **Weekly** | Review all `DELETE_ITEM` entries to confirm no unauthorized soft-deletes occurred |
| **Monthly** | Export a full audit report for the billing period |
| **On Suspicion** | Query for unusual patterns — e.g., multiple deletes from the same admin in a short window |

**Useful audit queries (run in Supabase SQL Editor):**

```sql
-- Review last 7 days of admin activity
SELECT
  al.created_at,
  al.action,
  al.details,
  p.username AS admin_username
FROM activity_logs al
JOIN profiles p ON al.admin_id = p.id
WHERE al.created_at >= now() - interval '7 days'
ORDER BY al.created_at DESC;

-- Count actions by admin for the current month
SELECT
  p.username,
  al.action,
  COUNT(*) AS total
FROM activity_logs al
JOIN profiles p ON al.admin_id = p.id
WHERE date_trunc('month', al.created_at) = date_trunc('month', now())
GROUP BY p.username, al.action
ORDER BY total DESC;
```

---

## 2. Supabase Optimization & Scaling

### 2.1 Database Indexing Strategy

As the furniture inventory grows beyond hundreds or thousands of records, query performance degrades without proper indexes. The following indexes should be created proactively.

**Run in Supabase SQL Editor:**

```sql
-- Index for the most common user-facing filter: active products only
CREATE INDEX IF NOT EXISTS idx_furniture_is_deleted
  ON furniture (is_deleted);

-- Index for category filtering (user catalog and admin product list)
CREATE INDEX IF NOT EXISTS idx_furniture_category
  ON furniture (category);

-- Composite index for the most common combined query
-- (fetch all active items sorted by newest first)
CREATE INDEX IF NOT EXISTS idx_furniture_active_created
  ON furniture (is_deleted, created_at DESC)
  WHERE is_deleted = false;

-- Index on activity_logs for admin audit queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_created
  ON activity_logs (admin_id, created_at DESC);
```

**Performance impact:** The composite partial index `idx_furniture_active_created` is particularly effective — it pre-filters only active rows and pre-sorts by date, making the home screen catalog fetch essentially a direct index scan rather than a full table scan.

**Monitoring indexes:** In the Supabase Dashboard, navigate to:
```
Database → Query Performance → Index Advisor
```
Supabase's Index Advisor will automatically flag slow queries and recommend additional indexes as usage patterns evolve.

---

### 2.2 Image Storage Optimization

Furniture product images are the largest assets in the application. Unoptimized images directly impact load times and user experience.

#### Storage Bucket Configuration

```
Supabase Dashboard → Storage → furniture (bucket) → Policies
```

**Recommended bucket settings:**

| Setting | Recommended Value |
|---|---|
| Max file size | 5 MB (enforce via upload validation) |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |
| Public CDN access | Enabled (for fast global delivery) |
| Cache-Control header | `public, max-age=31536000` (1 year, images are immutable) |

#### Image Processing Pipeline (Future Sprint)

For production scale, integrate an on-upload image transformation pipeline:

1. **Trigger on upload** — Use a Supabase Edge Function triggered by a Storage webhook
2. **Resize variants** — Generate three sizes: thumbnail (200×200), card (600×600), full (1200×1200)
3. **Convert to WebP** — WebP reduces file sizes by 25–34% vs. JPEG with identical visual quality
4. **Update database** — Store the CDN URL of the optimized image in the `furniture.image_url` column

**Supabase Image Transformation (built-in):**

Supabase Pro plans include on-the-fly image resizing via URL parameters:
```
https://your-project.supabase.co/storage/v1/render/image/public/furniture/image.jpg?width=600&quality=80
```

This can be integrated into the app with zero additional infrastructure by updating the image URL constructor in `furnitureService.ts`.

---

## 3. Security Lifecycle Updates

### 3.1 Dependency Update Schedule

Outdated dependencies are one of the most common sources of exploitable security vulnerabilities in production applications. The following schedule must be followed:

| Cadence | Action |
|---|---|
| **Weekly** | Run `npm audit` and review the output for high/critical severity issues |
| **Monthly** | Update patch versions: `npm update` |
| **Quarterly** | Review and update minor versions of core libraries |
| **Per Expo SDK Release** | Migrate to the new Expo SDK (currently v54) within 90 days of release |

**Monthly audit command:**

```bash
# Check for known vulnerabilities
npm audit

# Auto-fix low-risk issues
npm audit fix

# Review available updates
npx npm-check-updates
```

**Priority packages to monitor for security patches:**

| Package | Why Critical |
|---|---|
| `@supabase/supabase-js` | Auth token handling, RLS client |
| `zod` | Validation schema engine |
| `expo` / Expo SDK | Native module security |
| `@react-navigation/native` | Deep link handling (XSS via URL schemes) |
| `expo-secure-store` | Keychain/Keystore encryption |

---

### 3.2 API Key Rotation Protocol

If a credential leak is ever suspected (e.g., a `.env` file was accidentally committed to a public repository, or a team member's device was compromised):

**Immediate Response — Execute in order:**

```
Step 1: Invalidate the leaked key immediately
         Supabase Dashboard → Project Settings → API → Regenerate Anon Key

Step 2: Rotate the JWT secret
         Supabase Dashboard → Project Settings → Auth → JWT Secret → Generate New Secret
         ⚠ This invalidates ALL active user sessions — all users will be logged out

Step 3: Update environment variables
         Update .env on all developer machines
         Update environment variables in your CI/CD pipeline (GitHub Secrets, etc.)

Step 4: Audit the activity_logs table
         Query for any anomalous admin actions in the window between
         the suspected leak and the key rotation

Step 5: Review Supabase API logs
         Supabase Dashboard → Logs → API Logs
         Filter by the time window of the suspected exposure
         Look for unusual IP addresses or geographic locations

Step 6: Notify affected users if any PII was accessed
         (Required under GDPR / data breach notification obligations)

Step 7: Document the incident
         Record the timeline, scope, response actions, and prevention measures
```

**Prevention:**
- Add a pre-commit Git hook using `git-secrets` or `detect-secrets` to automatically block commits containing API key patterns
- Enable GitHub's secret scanning alerts on the repository

---

## 4. Feature Roadmap — Future Enhancements

The current architecture was intentionally designed for extensibility. The following features are planned for future development sprints and slot naturally into the existing codebase without requiring architectural rewrites.

---

### 4.1 Application Settings Screen

**Effort:** Low — 1 sprint  
**Location:** New screen in `src/screens/user/SettingsScreen.tsx`

The existing `UserNavigator.tsx` simply gains a new stack entry. The `ProfileScreen` gains a "Settings" navigation button. Settings to include:

- **Notification Preferences** — Toggle push notification categories (new arrivals, order updates, promotions)
- **App Theme** — Light / Dark / System default (requires a `ThemeContext` wrapping the app root)
- **Language / Region** — Currency display format (extends `formatCurrency()` in `helpers.ts`)
- **Privacy Controls** — Toggle analytics tracking consent (Sentry opt-out)

---

### 4.2 Multi-Factor Authentication (MFA)

**Effort:** Medium — 1–2 sprints  
**Supabase Built-in Support:** Yes — Supabase Auth natively supports TOTP-based MFA

**Implementation path:**

```typescript
// Enroll a user in MFA (TOTP)
const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
// data.totp.qr_code — display this QR code to the user to scan with Authenticator app

// Verify MFA challenge on login
const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
const { data: verify } = await supabase.auth.mfa.verify({
  factorId,
  challengeId: challenge.id,
  code: userEnteredOTP,
});
```

Enforce MFA specifically for Admin accounts by checking `profile.role === 'admin'` after initial password authentication and routing to an `MFAVerifyScreen` before granting access to `AdminNavigator`.

---

### 4.3 Push Notifications — Order Status Updates

**Effort:** Medium — 1 sprint  
**Tool:** Expo Notifications + Supabase Edge Functions

When an admin updates an order status, a Supabase Edge Function triggers a push notification to the customer's device via Expo's push notification service. The `profiles` table gains an `expo_push_token` column to store each device's token on login.

---

### 4.4 Product Reviews & Ratings

**Effort:** Medium — 1–2 sprints

A new `reviews` table with columns `(id, user_id, furniture_id, rating INT CHECK(1-5), comment TEXT, created_at)` and appropriate RLS policies (users can only insert/update their own reviews; all authenticated users can read). The `ProductDetailsScreen` gains a reviews section rendered below the color picker.

---

### 4.5 Advanced Analytics Dashboard (Admin)

**Effort:** High — 2–3 sprints

Extending the existing `DashboardScreen` with chart components (using `react-native-chart-kit` or `victory-native`) powered by aggregate Supabase queries:

- Revenue by category over time
- Top-selling products
- Cart abandonment rate (requires a `cart_sessions` table)
- User geographic distribution

---

## Maintenance Schedule Summary

| Frequency | Task |
|---|---|
| **Daily** | Monitor Sentry for new crash types |
| **Weekly** | Review Supabase API error rates; audit `activity_logs` for anomalies |
| **Monthly** | Run `npm audit`; review Supabase Index Advisor; rotate non-critical env vars |
| **Quarterly** | Update dependency minor versions; review RLS policies for new access patterns |
| **Per SDK Release** | Migrate Expo SDK; test all native modules on new OS versions |
| **On Incident** | Execute key rotation protocol; document and notify as required |

---

*Casa is built on a scalable, maintainable foundation. Each architectural decision — from RLS-enforced RBAC to modular Zustand stores — was made with long-term extensibility in mind.*
