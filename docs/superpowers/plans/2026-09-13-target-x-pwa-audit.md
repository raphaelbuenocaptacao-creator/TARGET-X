# TARGET-X PWA Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify TARGET-X as a secure installable PWA, fix only proven regressions, and require matching CI/deploy evidence before marking it complete.

**Architecture:** TARGET-X is a static GitHub Pages app with `index.html`, `app.js`, `manifest.webmanifest`, PNG icons and `sw.js`. The audit will validate manifest/installability, service-worker privacy/cache rules, exact SW version registration, mobile metadata and the published Pages HEAD.

**Tech Stack:** Static HTML/CSS/JavaScript, Web App Manifest, Service Worker, GitHub Actions, GitHub Pages.

**Spec:** User requirement supplied in the recurring PWA-hardening task.

## Global Constraints

- Keep existing working behavior and data flows intact.
- Never cache tokens, passwords, authenticated responses, private/no-store responses, cookies, Range/If-Range responses or partial content.
- Require explicit service-worker versioning and stale-cache cleanup.
- Preserve offline shell fallback without intercepting private/API traffic.
- Require 192x192 and 512x512 install icons and maskable 512x512 when applicable.
- Do not mark complete until audit and deploy evidence exist for the same HEAD.

---

### Task 1: Establish regression audit

**Files:**
- Create: `.github/workflows/pwa-audit.yml`
- Read: `manifest.webmanifest`, `sw.js`, `index.html`, `app.js`

**Interfaces:**
- Consumes: static PWA files in repository root.
- Produces: GitHub Actions check named `TARGET-X PWA Audit`.

- [ ] **Step 1: Write the failing audit**
  Validate required manifest fields/icons, mobile/theme metadata, install prompt support, secure service-worker cache exclusions, stale-cache cleanup, and exact SW version in the registration URL.
- [ ] **Step 2: Run audit and verify RED if any requirement is missing**
  Expected: failure must name the exact unmet requirement; if already compliant, record that no production fix is needed.
- [ ] **Step 3: Apply the smallest production fix**
  Modify only the file proven by the failing assertion, normally `index.html`, `app.js`, `manifest.webmanifest` or `sw.js`.
- [ ] **Step 4: Re-run audit and verify GREEN**
  Expected: `TARGET-X PWA Audit` succeeds with zero failed checks.
- [ ] **Step 5: Commit**
  Use a focused commit message describing the proven PWA correction.

### Task 2: Verify production deployment

**Files:**
- Read: `.github/workflows/*`

**Interfaces:**
- Consumes: corrected HEAD from Task 1.
- Produces: public HTTPS GitHub Pages URL on that same HEAD.

- [ ] **Step 1: Inspect Pages/deploy workflows for the corrected HEAD**
- [ ] **Step 2: Verify deployment finishes successfully**
- [ ] **Step 3: Verify the public URL is HTTPS and references the expected repository path**
- [ ] **Step 4: Report PWA ✅ only with green audit and Deploy ✅ only with green publication evidence for the same HEAD**
