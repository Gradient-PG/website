### Gradient Science Club Website — Development Roadmap

This roadmap will guide the build of a small, maintainable website for a science club. It prioritizes simplicity, low maintenance, and a minimal CMS for updating Projects and Board Members. We'll update this document as we progress.

---

### Goals
- **Showcase club initiatives and projects**: Simple pages with project listings and details.
- **Introduce the club**: Board members page with roles and bios.
- **Minimal CMS**: Single-admin, basic CRUD for Projects and Board Members.
- **Keep it simple**: Prefer boring, proven tools new members can maintain.

### Non‑Goals
- **No complex auth**: Only one admin account; no multi-user, roles, or OAuth.
- **No advanced CMS features**: No media library, workflows, or versioning (beyond Git).
- **No external databases**: Use a single local SQLite file; no managed DB.
- **No heavy backend**: Keep everything inside the existing Next.js app.

---

### Proposed Architecture (simple by design)
- **Frontend and CMS**: Next.js (App Router) + TypeScript + Tailwind CSS (already present in `frontend/`).
- **Data storage**: 
  - **Current (Phase 1-2)**: JSON files for development and prototyping (`projects.json`, `board_members.json`)
  - **Target (Phase 3+)**: MongoDB Atlas free cluster (cloud-hosted, managed database)
- **Data access**: Repository pattern with simple data-access layer. Currently using direct JSON file operations, will migrate to MongoDB with `mongoose` for CMS functionality.
- **Admin access**: HTTP Basic Auth via Next.js `middleware` using env variables (`ADMIN_USER`, `ADMIN_PASS`). Protects `/admin` routes and admin API endpoints.
- **Images**: Use external image URLs to avoid upload/storage complexity for now. Can add uploads later if needed.
- **Deployment**: Single Docker service with a bind-mounted `data/` volume. Serve a production build (`npm run build` + `npm run start`).

Why not a headless CMS (Strapi, Sanity) or Git-based CMS (Decap)? They add setup, auth, hosting, or learning overhead. For a tiny site with one admin, an in-app minimal CMS is easier to own and hand over.

**Note**: The current JSON-based storage is a temporary solution for development. The CMS (Phase 3) will migrate to MongoDB Atlas for professional database features, cloud backup, scalability, and admin interface reliability.

---

### Tech Stack
- **Runtime**: Node.js 20 (LTS)
- **Web**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **DB**: 
  - **Current**: JSON files (`frontend/data/*.json`)
  - **Target**: MongoDB Atlas (free tier, cloud-hosted)
- **DB Access**: 
  - **Current**: Direct JSON file operations via `fs`
  - **Target**: `mongoose` ODM (for CMS)
- **Auth**: HTTP Basic Auth (env-configured)
- **Container**: Docker (multi-stage build) + Docker Compose (single service, volume for `data/`)

---

### Data Model (initial)
- **Project**
  - `id` (integer, PK)
  - `title` (text)
  - `slug` (text, unique)
  - `description` (text)
  - `imageUrl` (text)
  - `tags` (text, comma/JSON)
  - `status` (text; e.g., planned/active/completed)
  - `links` (text, JSON-encoded)
  - `displayOrder` (integer)
  - `createdAt` (datetime)
  - `updatedAt` (datetime)
- **BoardMember**
  - `id` (integer, PK)
  - `name` (text)
  - `role` (text)
  - `photoUrl` (text)
  - `bio` (text)
  - `socials` (text, JSON-encoded)
  - `displayOrder` (integer)
  - `active` (boolean)
  - `createdAt` (datetime)
  - `updatedAt` (datetime)

---

### Routing Plan
- **Public**
  - `/` — Home: brief intro, featured projects
  - `/projects` — List all projects
  - `/projects/[slug]` — Project detail
  - `/board` — Board members
  - `/about` — Club description (optional)
- **Admin (protected)**
  - `/admin` — Dashboard
  - `/admin/projects` — List + create/edit/delete projects
  - `/admin/board` — List + create/edit/delete board members

---

### Security
- **HTTP Basic Auth** for `/admin` and `/api/admin/*` via `middleware.ts`.
- **HTTPS in production** via hosting/proxy (out of scope for this repo).
- **CSRF**: Keep admin within same origin; use POST for mutations; no cross-origin.
- **Secrets**: `ADMIN_USER`, `ADMIN_PASS` stored in environment (not committed).

---

### Deployment
- **Compose**: One service (Next.js app), bind-mount `./frontend/data/` to persist `site.db`.
- **Prod run**: Build once, run with `npm run start` (not dev server).
- **Backups**: Copy `frontend/data/site.db` periodically.

---

### Project Structure (planned)
- `frontend/app/(public)/*` — Public pages
- `frontend/app/(admin)/*` — Admin UI
- `frontend/app/api/*` — API routes (public read + admin CRUD under `/api/admin/*`)
- `frontend/lib/db.ts` — SQLite connection helper
- `frontend/lib/repositories/*` — Data-access functions
- `frontend/data/` — SQLite file (`site.db`), schema and seed scripts
- `frontend/middleware.ts` — Basic Auth protection

---

### Phased Task Breakdown

- **Phase 0: Repo & Build Hardening**
  - [x] Switch Docker to production build/run: `npm ci && npm run build` then `npm run start`.
  - [x] Add `frontend/data/` directory and ensure it is persisted via Docker volume.
  - [x] Document `.env` with `ADMIN_USER` and `ADMIN_PASS`.

- **Phase 1: Data Layer** ✅ COMPLETED (JSON-based interim solution)
  - [x] Add schema SQL for `projects` and `board_members` tables (for future SQLite migration).
  - [x] Implement `frontend/lib/db.ts` using JSON file operations (temporary solution).
  - [x] Implement repositories: `projectsRepo`, `boardMembersRepo` with CRUD.
  - [x] Seed script to create JSON files and seed sample data.

- **Phase 2: Public Pages** ✅ COMPLETED
  - [x] `/projects` list page (static + revalidate) using DB reads.
  - [x] `/projects/[slug]` detail page.
  - [x] `/board` page with member cards.
  - [x] Home page with featured projects (updated existing components).

- **Phase 3: Admin CMS**
  - **Phase 3.1: Database Migration & Auth Foundation** ✅ COMPLETED
    - [x] Set up MongoDB Atlas free cluster and obtain connection string (requires user setup)
    - [x] Install and configure `mongoose` package
    - [x] Create MongoDB connection and database models
    - [x] Migrate repository layer from JSON to MongoDB operations
    - [x] Create data migration script (JSON → MongoDB)
    - [x] Test database operations and ensure data integrity (requires MongoDB setup)
    - [x] Implement HTTP Basic Auth middleware for `/admin` routes
    - [x] Create admin environment variables and configuration
  - **Phase 3.2: Admin UI Foundation** ✅ COMPLETED
    - [x] Create admin layout component with navigation
    - [x] Set up admin routing structure (`/admin`, `/admin/projects`, `/admin/board`)
    - [x] Create admin dashboard with overview stats
    - [x] Implement auth-protected admin pages
    - [x] Add admin-specific styling and components
  - **Phase 3.3: Projects Management** ✅ COMPLETED
    - [x] Admin API routes for projects CRUD (`/api/admin/projects/*`)
    - [x] Projects list page with table view and actions
    - [x] Create project form with validation
    - [x] Edit project form with pre-populated data
    - [x] Delete project with confirmation modal
    - [x] Bulk actions (delete multiple, change status)
    - [x] Client-side filtering and search functionality
    - [x] Toast notifications for user feedback
    - [x] Bulk status updates for multiple projects
  - **Phase 3.4: Board Members Management** ✅ COMPLETED
    - [x] Admin API routes for board members CRUD (`/api/admin/board/*`)
    - [x] Board members list page with table view and interactive functionality
    - [x] Create board member form with validation and preview
    - [x] Edit board member form with pre-populated data and preview
    - [x] Delete board member with confirmation modal
    - [x] Bulk actions (delete, activate/deactivate multiple members)
    - [x] Client-side filtering and search functionality (by name, role, status)
    - [x] Toast notifications for user feedback
    - [x] Statistics dashboard (active members, leadership count, etc.)
  - **Phase 3.5: Form Validation & UX** ✅ COMPLETED
    - [x] Client-side form validation with error messages
    - [x] Server-side validation and error handling
    - [x] Success/error toast notifications
    - [x] Loading states and form submission feedback
    - [x] Auto-save drafts functionality
    - [x] Form field helpers (slug generation, etc.)
  - **Phase 3.6: Image Upload & Management** ✅ COMPLETED
    - [x] Update database schema to support base64 image storage (BoardMember + Project)
    - [x] Add image upload component with drag & drop functionality
    - [x] Implement client-side image cropping and resizing (200x200 for profiles, 400x400 for projects)
    - [x] Priority system: base64 images override external URLs
    - [x] Add image upload to board member forms (create/edit)
    - [x] Add image upload to project forms (create/edit)
    - [x] Update Avatar component to handle base64 images
    - [x] Update all project displays to prioritize base64 images
    - [x] Add image validation (file type, size limits)
    - [x] Implement image compression for optimal storage (JPEG 80% quality)
    - [x] Enhanced avatar placeholders with initials and color-coded backgrounds

- **Phase 4: Polish & Docs**
  - [ ] SEO: `<head>` tags, OpenGraph, sitemap, robots.
  - [ ] Error boundaries and not-found pages.
  - [ ] README for onboarding and operations (backups, env, updating content).

- **Phase 5: Deploy**
  - [ ] Update `docker-compose.yml` to mount `./frontend/data:/app/data` (or equivalent internal path).
  - [ ] Run migrations/seed in entrypoint if DB is missing.
  - [ ] Verify admin protection and content updates in prod.

---

### Hand‑over Notes (for future club members)
- **Update content** via `/admin` using the single admin account.
- **Back up** the `site.db` file; that’s where all content lives.
- **No need** to learn a big CMS; this is intentionally small.
- **If needs grow**, consider a hosted headless CMS and swap repositories later.

---

### Open Questions
- Do we need image uploads, or are URLs sufficient for now?
- Any must-have fields for projects or board members beyond the current model?
- Hosting environment and HTTPS termination preferences?

---

### Change Log
- 2025-09-23: Initial roadmap created. Chose in-app minimal CMS with SQLite and Basic Auth for simplicity. 
- 2025-09-24: **Phase 1 & 2 Completed**:
  - Implemented data layer with JSON-based storage (interim solution for development)
  - Created repository pattern for CRUD operations with file-based storage
  - Developed comprehensive seed script with sample data
  - Created public pages: `/projects`, `/projects/[slug]`, `/board`
  - Updated existing home page components to use database
  - Added responsive UI with Tailwind CSS and shadcn/ui components
  - Integrated Lucide React icons for modern iconography
  - Implemented proper TypeScript typing throughout
  - Added SEO metadata and OpenGraph support
  - Built error handling and graceful fallbacks
  - Fixed build compatibility issues and ensured production-ready deployment
  - Fixed navigation between home and projects pages
  - **Note**: JSON storage is temporary; Phase 3 will migrate to MongoDB Atlas for CMS functionality
- 2025-09-25: **Phase 3.1-3.6 Completed**:
  - Successfully migrated from JSON to MongoDB Atlas for production-ready data storage
  - Implemented comprehensive admin CMS with HTTP Basic Auth protection
  - Built full CRUD functionality for projects and board members management
  - Added bulk operations, filtering, and search capabilities
  - Created enhanced image upload system with base64 storage and automatic cropping
  - Implemented intelligent avatar placeholders with initials and color-coded backgrounds
  - Added drag & drop image upload with client-side processing and validation
  - Base64 images take priority over external URLs for better reliability
  - Profile photos automatically cropped and resized to 200x200px at 80% JPEG quality
  - Project images automatically cropped and resized to 720x720px at 80% JPEG quality
  - Comprehensive image management for both board members and projects
  - All displays (home, list pages, detail pages) prioritize uploaded images over external URLs
- 2025-09-25: **Phase 3.5 Completed**: 
  - Implemented comprehensive form validation library with client-side and server-side validation
  - Created enhanced FormField component with real-time validation, loading states, and character counting
  - Added auto-save draft functionality with localStorage persistence and restore notifications
  - Enhanced API endpoints with detailed validation error responses and better error handling
  - Implemented intelligent slug generation and uniqueness validation for projects
  - Added toast notifications for all form actions (success, error, auto-save, restore)
  - Created debounced validation for improved UX performance
  - Added form submission feedback with loading states and comprehensive error messages
  - Enhanced both project and board member creation/edit forms with new validation system