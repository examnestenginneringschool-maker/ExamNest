# ExamNest — Comprehensive Project Summary & Architecture Changelog

**Date:** October 26, 2026  
**Project:** ExamNest (Student Academic Companion Platform)  
**Tech Stack:** Next.js 16.3.6 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS, Supabase Native Authentication (`@supabase/ssr`), Supabase (PostgreSQL), Vitest  

---

## 1. Executive Summary

ExamNest is a specialized academic companion web platform designed for university students. Rather than offering generic study material, ExamNest tailors the entire learning experience to a student's exact academic track:

$$\text{University} \longrightarrow \text{College} \longrightarrow \text{Course} \longrightarrow \text{Department} \longrightarrow \text{Semester}$$

Once enrolled, students get immediate access to their curated semester curriculum: syllabus-mapped notes, formulas, important focus topics, previous year questions, and revision modules.

---

## 2. Key Architecture & Security Highlights

### 1. Database Query Waterfall Elimination
* **The Problem:** Visiting the dashboard, a subject, or notes triggered 10 to 12 individual database queries executed sequentially across the internet.
* **The Fix:** Implemented a unified academic data resolution engine in `src/lib/academic/student-context.ts`. It fetches the entire university-to-semester hierarchy in a single relational join (with automatic batch fallbacks), wrapped in React's `cache()` to eliminate redundant queries within the same request lifecycle.

### 2. Supabase Native Auth (`@supabase/ssr`) & 6-Digit Email OTP
* **The Implementation:** Full cookie-based SSR authentication with `createServerSupabaseClient`, `createBrowserSupabaseClient`, and `getAuthenticatedUser()`.
* **Security Hardening:**
  * Disposable/throwaway email domains are blocked at both the client and Zod validation schema levels (`src/lib/validation/auth.ts`).
  * Registration enforces strong passwords and transitions to a 6-digit Email OTP verification screen (`supabase.auth.verifyOtp`).
  * PKCE OAuth / Magic Link callback handler (`src/app/auth/callback/route.ts`) sanitizes `next` redirect paths to prevent Open Redirect attacks.

### 3. Edge Route Protection & Next.js 16 Proxy Convention
* **The Implementation:** `src/proxy.ts` refreshes Supabase Auth tokens on every request via `supabase.auth.getUser()`, redirects unauthenticated visitors away from `/app/*` and `/onboarding/*`, and redirects authenticated users away from `/sign-in` and `/sign-up`.

### 4. Relational Stream Integrity in Onboarding
* **The Fix:** In `src/app/onboarding/actions.ts`, `completeOnboarding` verifies that the submitted `semesterId` and `collegeCourseDepartmentId` belong to the exact same `college_course_id` before saving the student's academic profile.

### 5. Modularization of the Notes Reader
* Decomposed into focused, single-responsibility components in `src/components/notes/`:
  * `NotesHeader.tsx`: Sticky topbar with back link, subject name, ExamNest branding, and `<UserMenu />`.
  * `NotesHero.tsx`: Subject metadata, category, semester badge, and the 3-metric statistics grid.
  * `NotesMobileNav.tsx`: Horizontal scrolling pill navigation for phones.
  * `NotesOutlineSidebar.tsx`: Sticky desktop sidebar locked to the viewport past the hero section.
  * `UnitSection.tsx`: Unit header, syllabus coverage box, focus areas, and modular block rendering.

---

## 3. System Architecture & Routing Map

```
App Router
├── /                                   (Public Marketing Landing Page)
├── /sign-in                            (Supabase Native Sign-In)
├── /sign-up                            (Supabase Native Registration + 6-Digit Email OTP)
├── /auth/callback                      (Supabase PKCE / OAuth Session Exchange)
├── /onboarding                         (6-Step Academic Enrollment Stepper)
└── /app/
    ├── dashboard                       (Student Dashboard & Curriculum Feed)
    └── subjects/[subjectId]/
        ├── page                        (Subject Overview & Workspace Hub)
        └── notes                       (Complete Syllabus Notes Reader)
```

---

## 4. Developer Cheat Sheet

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
