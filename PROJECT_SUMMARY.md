# ExamNest — Comprehensive Project Summary & Architecture Changelog

**Date:** October 2, 2026  
**Project:** ExamNest (Student Academic Companion Platform)  
**Tech Stack:** Next.js 16.3.6 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS, Clerk Authentication, Supabase (PostgreSQL), Vitest  

---

## 1. Executive Summary

ExamNest is a specialized academic companion web platform designed for university students. Rather than offering generic study material, ExamNest tailors the entire learning experience to a student's exact academic track:

$$\text{University} \longrightarrow \text{College} \longrightarrow \text{Course} \longrightarrow \text{Department} \longrightarrow \text{Semester}$$

Once enrolled, students get immediate access to their curated semester curriculum: syllabus-mapped notes, formulas, important focus topics, previous year questions, and revision modules.

Today, the codebase underwent a comprehensive optimization, security hardening, modular refactoring, and test suite setup.

---

## 2. Key Challenges Identified & Fixed Today

### 1. Database Query Waterfall (10–12 Sequential Round-Trips)
* **The Problem:** Visiting the dashboard, a subject, or notes triggered 10 to 12 individual database queries executed sequentially across the internet. This added 2 to 3 seconds of network latency to every page load.
* **The Fix:** Implemented a unified academic data resolution engine in `src/lib/academic/student-context.ts`. It fetches the entire university-to-semester hierarchy in a single relational join (with automatic batch fallbacks), wrapped in React's `cache()` to eliminate redundant queries within the same request lifecycle.

### 2. Infinite Redirect Loop (`ERR_TOO_MANY_REDIRECTS`)
* **The Problem:** If a student's profile flag indicated onboarding was completed, but their academic placement record was missing or incomplete, the dashboard redirected to onboarding, while onboarding redirected back to the dashboard, creating an infinite browser loop.
* **The Fix:** Synchronized both `/onboarding` and the `/app` layout to evaluate the presence of the verified academic context before making routing decisions. In `src/app/onboarding/actions.ts` and `src/app/onboarding/page.tsx`, guaranteed base `profiles` record existence first to satisfy PostgreSQL foreign key constraints (`student_profiles_user_id_fkey`), saved `student_profiles`, and only then marked `onboarding_completed: true`.

### 3. Edge Route Protection & Next.js 16 Proxy Convention
* **The Problem:** Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. Furthermore, unauthenticated visitors previously reached the Node.js SSR runtime before being redirected, and onboarding server actions lacked authentication checks.
* **The Fix:** Migrated to `src/proxy.ts` using Clerk's `createRouteMatcher(["/app(.*)", "/onboarding(.*)"])` with `auth.protect()` to intercept unauthorized traffic at the edge. Added authentication checks (`const { userId } = await auth()`) to all onboarding server actions.

### 4. Hydration Mismatch Caused by Browser Extensions
* **The Problem:** Browser extensions (such as Grammarly and Liner) injected attributes and inline styles into `<html>` and `<body>` prior to client hydration, triggering React console errors.
* **The Fix:** Added `suppressHydrationWarning` to the root `<html>` and `<body>` tags in `src/app/layout.tsx`.

### 5. Latency Reduction in Inner App Routes
* **The Problem:** Subject overview and notes pages were invoking Clerk's remote `currentUser()` helper (which makes an external HTTPS request across the web) solely to retrieve `user.id`.
* **The Fix:** Replaced with lightweight, instant `auth()`, saving 100–300ms on every navigation.

### 6. Type-Safe Form Validation with Zod
* **The Problem:** Zod was installed in `package.json` but unused; input IDs were handled as unvalidated raw strings.
* **The Fix:** Created `src/lib/validation/onboarding.ts`. Added pre-submission validation on the client stepper and strict server-side validation on all onboarding server actions.

### 7. Modularization of the Notes Reader (From 954 Lines to 171 Lines)
* **The Problem:** `src/app/app/subjects/[subjectId]/notes/page.tsx` was a monolithic 954-line file containing the header, desktop sidebar, hero section, mobile pill navigation, and block rendering.
* **The Fix:** Decomposed into focused, single-responsibility components in `src/components/notes/`:
  * `NotesHeader.tsx`: Sticky topbar with back link, subject name, ExamNest branding, and `<UserButton />`.
  * `NotesHero.tsx`: Subject metadata, category, semester badge, and the 3-metric statistics grid.
  * `NotesMobileNav.tsx`: Horizontal scrolling pill navigation for phones.
  * `NotesOutlineSidebar.tsx`: Sticky desktop sidebar locked to the viewport past the hero section, featuring interactive accordion unit expansion, direct topic-to-topic jumping, and real-time scroll spy tracking.
  * `UnitSection.tsx`: Unit header, syllabus coverage box, focus areas, and modular block rendering.

### 8. Zero-Layout-Shift (CLS) Loading Skeletons
* **The Problem:** Notes and onboarding showed blank screens while loading. On the subject page, the skeleton dimensions did not match the real page, causing visual jumps.
* **The Fix:** Created matching skeleton layouts:
  * `src/app/app/subjects/[subjectId]/notes/loading.tsx`
  * `src/app/onboarding/loading.tsx`
  * Updated `src/app/app/subjects/[subjectId]/loading.tsx` to match the exact 1500px 2-column layout.

### 9. Diagnostic Route Cleanup
* **The Problem:** A temporary database test route (`/app/test-db`) remained in the production router.
* **The Fix:** Removed `src/app/app/test-db` from the router and preserved the diagnostic tool as a developer CLI script in `scripts/test-db.ts`.

### 10. Automated Testing Suite Setup
* **The Problem:** The repository lacked automated tests to guard against regressions.
* **The Fix:** Configured Vitest in `vitest.config.mts` with Node 22 native ESM path aliases (`@/`). Added 14 unit tests in `tests/` covering schema validation, subject text formatting, and note block contracts.

---

## 3. System Architecture & Routing Map

```
App Router
├── /                                   (Public Marketing Landing Page)
├── /sign-in                            (Clerk Authentication Sign-In)
├── /sign-up                            (Clerk Authentication Registration)
├── /onboarding                         (6-Step Academic Enrollment Stepper)
└── /app/
    ├── dashboard                       (Student Dashboard & Curriculum Feed)
    └── subjects/[subjectId]/
        ├── page                        (Subject Overview & Workspace Hub)
        └── notes                       (Complete Syllabus Notes Reader)
```

---

## 4. Verification & Quality Health Check

All checks pass with zero warnings and zero errors:

| Check | Tool / Command | Result |
| :--- | :--- | :---: |
| **Unit Test Suite** | `npm test` (Vitest) | **14 / 14 Passed (100%)** |
| **Type Integrity** | `npx tsc --noEmit` | **0 Errors** |
| **Linting & Code Quality** | `npm run lint` (ESLint) | **0 Warnings / 0 Errors** |
| **Production Build** | `npm run build` (Turbopack) | **Compiled Cleanly (0 warnings)** |

---

## 5. Developer Cheat Sheet

```bash
# Start development server
npm run dev

# Run automated test suite
npm test

# Run code linter
npm run lint

# Run TypeScript typecheck
npx tsc --noEmit

# Run production build with Turbopack
npm run build

# Run database diagnostic CLI script
npx tsx scripts/test-db.ts
```
