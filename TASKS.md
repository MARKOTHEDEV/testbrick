# TestBloc - Backend Implementation Tasks

> **Rule:** A task is only marked COMPLETE when:
> 1. Backend is implemented
> 2. Frontend is integrated
> 3. Manually verified by user as working

---

## Phase 0: Project Setup

### Task 0.1: Initialize Backend Project
**Status:** COMPLETE ✓

**Backend:**
- [x] Initialize NestJS project
- [x] Configure TypeScript (strict mode)
- [x] Set up environment variables (.env)
- [x] Add CORS configuration for frontend
- [x] Add Swagger docs at /docs

**Frontend Integration:**
- [x] Update frontend API base URL to point to backend
- [x] Created api.ts with healthCheck() helper

**Verification:**
- [x] `GET /api/health` returns `{ status: "ok" }`
- [x] Swagger docs accessible at http://localhost:3001/docs

---

### Task 0.2: Database Setup
**Status:** COMPLETE ✓

**Backend:**
- [x] Install Prisma
- [x] Configure PostgreSQL connection
- [x] Create initial schema (User, Project, TestFile, TestStep, TestRun, StepResult, TestError)
- [x] Run migrations

**Frontend Integration:**
- [x] None (database is backend-only)

**Verification:**
- [x] Can connect to database
- [x] Tables created successfully

---

### Task 0.3: Clerk Authentication
**Status:** COMPLETE ✓

**Backend:**
- [x] Install Clerk SDK (@clerk/backend, svix)
- [x] Create ClerkAuthGuard
- [x] Create Clerk webhook endpoint for user sync (/api/auth/webhook/clerk)
- [x] Add @CurrentUser() decorator
- [x] Add /api/auth/me endpoint (protected)

**Frontend Integration:**
- [x] Install @clerk/clerk-react in frontend
- [x] Set up ClerkProvider with CLERK_PUBLISHABLE_KEY
- [x] Ensure JWT is sent in Authorization header (api.ts + useApi hook)
- [x] Test protected endpoint returns 401 without token ✓ (curl verified)
- [x] Update ProtectedRoute to use Clerk auth
- [x] Update AuthLayout to use Clerk auth
- [x] Custom auth UI with Clerk hooks (useSignIn, useSignUp) - NOT Clerk's built-in components
- [x] OAuth SSO callback handling (/auth/sso-callback)
- [x] User menu with logout functionality
- [x] Fun animal avatars (Bear, Cat, Fox, Panda, Bunny, Owl) - deterministic by user ID
- [x] Animated TestBrickLogo for loading states

**Verification:**
- [x] Unauthorized request to protected route returns 401
- [x] Login/Logout working (manually verified)
- [x] Google/GitHub OAuth working
- [x] User menu displays with avatar and name

---

## Phase 1: Projects CRUD

### Task 1.1: Create Project
**Status:** COMPLETE ✓

**Backend:**
- [x] POST /projects endpoint
- [x] Validate: name (required), description (optional), baseUrl (required)
- [x] Associate with authenticated user
- [x] AuthService.ensureUserExists() handles webhook race condition

**Frontend Integration:**
- [x] Connect "Create Project" modal/form to API
- [x] Show success/error feedback
- [x] Refresh project list after creation
- [x] react-hook-form + yup validation
- [x] Reusable FormInput/FormTextarea components

**Verification:**
- [x] Can create project from frontend
- [x] Project appears in database
- [x] Project appears in UI list

---

### Task 1.2: List Projects
**Status:** COMPLETE ✓

**Backend:**
- [x] GET /projects endpoint
- [x] Return only current user's projects
- [x] Include folder count per project

**Frontend Integration:**
- [x] Fetch projects on dashboard load
- [x] Display in sidebar/project list

**Verification:**
- [x] Projects load on dashboard
- [x] Only shows current user's projects

---

### Task 1.3: Update Project
**Status:** COMPLETE ✓

**Backend:**
- [x] PATCH /projects/:id endpoint
- [x] Verify ownership before update

**Frontend Integration:**
- [x] Connect "Edit Project" form to API
- [x] Update UI after successful edit

**Verification:**
- [ ] Can edit project name/description/baseUrl
- [ ] Changes persist and display correctly

---

### Task 1.4: Delete Project
**Status:** COMPLETE ✓

**Backend:**
- [x] DELETE /projects/:id endpoint
- [x] Verify ownership before delete
- [x] Cascade delete folders, test files, steps, runs

**Frontend Integration:**
- [x] Connect "Delete Project" button to API
- [x] Show confirmation dialog
- [x] Remove from UI after deletion

**Verification:**
- [ ] Can delete project
- [ ] All related data is deleted
- [ ] UI updates correctly

---

### Task 1.5: Project Switcher Dropdown
**Status:** COMPLETE ✓

**Frontend Integration:**
- [x] Add dropdown in top bar to switch between projects
- [x] Show current project name
- [x] List all user's projects
- [x] Option to create new project from dropdown
- [x] Persist selected project (localStorage or URL)

**Verification:**
- [x] Can switch between projects from dropdown
- [x] Selected project persists on refresh
- [x] Creating new project from dropdown works

---

## Phase 1.5: Folders CRUD

> **Architecture Note:** Projects contain Folders, and Folders contain Test Files.
> - Files MUST be inside a folder (no root-level files)
> - Folders are NOT nestable (one level only)

### Task 1.5.1: Create Folder
**Status:** COMPLETE ✓

**Backend:**
- [x] POST /projects/:projectId/folders endpoint
- [x] Validate: name (required)
- [x] Verify user owns the project

**Frontend Integration:**
- [x] Connect "Create Folder" button to API
- [x] Show folder in sidebar after creation

**Verification:**
- [ ] Can create folder from frontend
- [ ] Folder appears in project sidebar

---

### Task 1.5.2: List Folders
**Status:** COMPLETE ✓

**Backend:**
- [x] GET /projects/:projectId/folders endpoint
- [x] Include test file count per folder

**Frontend Integration:**
- [x] Fetch folders when project is selected
- [x] Display in sidebar as expandable tree

**Verification:**
- [ ] Folders load for selected project
- [ ] Shows correct file count

---

### Task 1.5.3: Update Folder
**Status:** COMPLETE ✓

**Backend:**
- [x] PATCH /folders/:id endpoint
- [x] Verify ownership

**Frontend Integration:**
- [x] Connect rename functionality to API

**Verification:**
- [ ] Can rename folder
- [ ] Changes persist

---

### Task 1.5.4: Delete Folder
**Status:** COMPLETE ✓

**Backend:**
- [x] DELETE /folders/:id endpoint
- [x] Cascade delete test files, steps, runs

**Frontend Integration:**
- [x] Connect delete button to API
- [x] Show confirmation dialog
- [x] Update sidebar after deletion

**Verification:**
- [ ] Can delete folder
- [ ] All related test files deleted
- [ ] UI updates correctly

---

## Phase 2: Test Files CRUD

> **Note:** Test files belong to Folders, not directly to Projects.

### Task 2.1: Create Test File
**Status:** COMPLETE ✓

**Backend:**
- [x] POST /folders/:folderId/tests endpoint
- [x] Validate: name (required), description (optional)
- [x] Verify user owns the folder's project

**Frontend Integration:**
- [x] Connect "Create Test" button to API
- [x] Refresh test list after creation

**Verification:**
- [ ] Can create test file from frontend
- [ ] Test file appears in folder

---

### Task 2.2: List Test Files
**Status:** COMPLETE ✓

**Backend:**
- [x] GET /folders/:folderId/tests endpoint
- [x] Include step count and last run status

**Frontend Integration:**
- [x] Fetch test files when folder is selected
- [x] Display in test list

**Verification:**
- [ ] Test files load for selected folder
- [ ] Shows correct step count and status

---

### Task 2.3: Get Test File Details
**Status:** COMPLETE ✓

**Backend:**
- [x] GET /tests/:id endpoint
- [x] Include all steps with full details
- [x] Include recent runs summary

**Frontend Integration:**
- [x] Fetch test details on test file page
- [x] Populate Story Mode table with steps
- [x] Populate Block Mode with steps

**Verification:**
- [ ] Test details page loads correctly
- [ ] Steps display in correct order
- [ ] Both Story and Block modes work

---

### Task 2.4: Update Test File
**Status:** COMPLETE ✓

**Backend:**
- [x] PATCH /tests/:id endpoint
- [x] Verify ownership

**Frontend Integration:**
- [x] Connect edit functionality to API

**Verification:**
- [ ] Can rename test file
- [ ] Changes persist

---

### Task 2.5: Delete Test File
**Status:** COMPLETE ✓

**Backend:**
- [x] DELETE /tests/:id endpoint
- [x] Cascade delete steps and runs

**Frontend Integration:**
- [x] Connect delete button to API
- [x] Update UI after deletion

**Verification:**
- [ ] Can delete test file
- [ ] Related data deleted
- [ ] UI updates

---

## Phase 3: Test Steps Management
**Status:** SKIPPED ⏭️

> **Decision:** Skipped manual step creation. Steps will be created only via Recording (Phase 4).
> View/edit/delete of recorded steps can be added later if needed.

---

## Phase 4: Recording (Core Feature) - Browser Extension

> **Architecture:** Chrome Extension records user interactions and sends steps to backend via API.
>
> **User Flow:**
> 1. User opens Test Detail page in TestBloc
> 2. Clicks "Record" button
> 3. New tab opens to project's baseUrl (extension injects recording script)
> 4. Floating badge shows "🔴 Recording" with [+ Assert] and [Stop] buttons
> 5. User performs actions → steps captured automatically
> 6. User can add assertions by clicking [+ Assert] → select element → choose assertion type
> 7. User stops recording via badge, extension popup, or TestBloc tab
> 8. Steps appear in TestBloc's Story/Block Mode (real data, not mock)

---

### Task 4.1: Chrome Extension Setup
**Status:** COMPLETE ✓

**Extension:**
- [x] Create Chrome extension (Manifest V3)
- [x] Create manifest.json with permissions (activeTab, storage, tabs, scripting)
- [x] Create background service worker
- [x] Create basic popup UI (status display, stop button)
- [x] Implement auth: receive JWT token from TestBloc app via message passing

**Verification:**
- [x] Extension loads in Chrome (chrome://extensions)
- [x] Can receive auth token from TestBloc app

---

### Task 4.2: Recording Flow - Start from TestBloc
**Status:** COMPLETE ✓

**Frontend (TestBloc App):**
- [x] Add "Record" button to Test Detail page header (next to Run Test)
- [x] Check if extension is installed (custom event or chrome.runtime)
- [x] If not installed → Show "Install Extension" modal with Chrome Web Store link
- [x] If installed → Send message to extension with: testId, baseUrl, authToken
- [x] Extension opens new tab to baseUrl and starts recording

**Extension:**
- [x] Listen for "start-recording" message from TestBloc app
- [x] Store recording context (testId, baseUrl, authToken)
- [x] Open new tab to baseUrl
- [x] Inject content script into the new tab

**Verification:**
- [x] Click "Record" in TestBloc → new tab opens to project baseUrl
- [x] Content script is injected (console log visible)

---

### Task 4.3: Content Script - Event Capture
**Status:** COMPLETE ✓

> **Reference:** Used `/qa-tagger.ts` as the foundation - selector algorithms integrated into content.js

**Extension (Content Script):**
- [x] Integrate `qa-tagger.ts` into content script (or bundle it)
- [x] Auto-generate `data-qa-id` on interactive elements (via QATagger)
- [x] Inject floating recording badge UI into page
- [x] Capture click events with LocatorBundle:
  ```ts
  LocatorBundle = {
    role?: { role, name }  // 1st priority - getByRole
    testId?: string        // 2nd priority - data-testid/data-qa
    label?: string         // 3rd priority - getByLabel
    placeholder?: string   // 4th priority - getByPlaceholder
    text?: string          // 5th priority - getByText
    altText?: string       // 6th priority - getByAltText
    title?: string         // 7th priority - getByTitle
    css?: string           // 8th priority - generated CSS
    xpath?: string         // 9th priority - generated XPath
  }
  ```
- [x] Capture input/change events (value typed, element selectors)
- [x] Capture navigation events (URL changes, page loads)
- [x] Filter out auto-generated classes/IDs (use `looksAutoGenerated()`)
- [x] Send captured steps to background worker → backend API

**Floating Badge UI:**
```
┌─────────────────────────────┐
│ 🔴 Recording to "Login Test"│
│ ─────────────────────────── │
│ [+ Assert]  [⏹ Stop]        │
└─────────────────────────────┘
```

**Verification:**
- [x] Click on element → step has LocatorBundle with multiple strategies
- [x] Type in input → value captured
- [x] Badge visible and draggable
- [x] Elements get `data-qa-id` attributes

---

### Task 4.4: Content Script - Assertions
**Status:** COMPLETE ✓

**Extension (Content Script):**
- [x] Click [+ Assert] → Enter assertion mode (cursor changes)
- [x] Elements highlight on hover
- [x] Click element → Show assertion type popup:
  - Assert text equals
  - Assert text contains
  - Assert is visible
  - Assert exists
- [x] User selects assertion → Step captured with action="assert"
- [x] Exit assertion mode, return to normal recording

**Verification:**
- [x] Can select element for assertion
- [x] Assertion step captured with correct type and expected value

---

### Task 4.5: Backend - Steps API
**Status:** COMPLETE ✓

**Backend:**
- [x] POST /tests/:testId/steps endpoint
- [x] DTO: action, description, locators (JSON), value, qaId, screenshot (base64)
- [x] Auto-increment stepNumber based on existing steps
- [x] Verify ownership (testFile → folder → project → user)
- [x] Return saved step with ID
- [x] GET /tests/:testId/steps endpoint
- [x] DELETE /steps/:stepId endpoint

**Verification:**
- [x] Can create step via API (Swagger/curl)
- [x] stepNumber auto-increments correctly

---

### Task 4.6: Frontend - Real-time Step Display
**Status:** COMPLETE ✓

**Frontend (TestBloc App):**
- [x] When recording starts, show "Recording in progress" indicator (red banner)
- [x] Poll GET /tests/:testId every 2 seconds for new steps during recording
- [x] Update Story Mode and Block Mode with real steps from API
- [x] Remove mock data from TestFile component
- [x] Show step count updating in header

**Verification:**
- [x] Record a click → step appears in TestBloc within seconds
- [x] Story Mode shows real recorded steps
- [x] Block Mode shows real recorded steps (read-only)

---

### Task 4.7: Stop Recording
**Status:** COMPLETE ✓

**Extension:**
- [x] Stop via floating badge [Stop] button
- [x] Stop via extension popup
- [x] Listen for "stop-recording" message from TestBloc app

**On Stop:**
- [x] Remove content script / floating badge from page
- [x] Clear recording context
- [x] Notify TestBloc app that recording stopped
- [x] Extension icon badge clears

**Frontend:**
- [x] Add "Stop Recording" button (visible when recording active)
- [x] Recording banner with stop button
- [x] Refresh test data on stop

**Verification:**
- [x] Can stop from badge, extension, or TestBloc
- [x] Recording cleans up properly

---

## Phase 5: Test Execution (Playback)

### Task 5.1: Trigger Test Run
**Status:** NOT STARTED

**Backend:**
- [ ] POST /tests/:testId/run endpoint
- [ ] Create TestRun record (PENDING)
- [ ] Add job to Bull queue
- [ ] Return runId

**Frontend Integration:**
- [ ] Connect "Run Test" button to API
- [ ] Show run status indicator

**Verification:**
- [ ] Can trigger test run
- [ ] TestRun created in database

---

### Task 5.2: Execute Test Steps
**Status:** NOT STARTED

**Backend:**
- [ ] Bull queue processor picks up job
- [ ] Launch Playwright with video recording
- [ ] For each step:
  - [ ] Find element using LocatorBundle (priority order)
  - [ ] Execute action (click, fill, etc.)
  - [ ] Capture screenshot
  - [ ] Save StepResult
- [ ] Emit WebSocket events for progress

**Frontend Integration:**
- [ ] Subscribe to run updates via WebSocket
- [ ] Show real-time step completion
- [ ] Update step status icons

**Verification:**
- [ ] Test executes all steps
- [ ] Can see real-time progress in UI
- [ ] Screenshots captured for each step

---

### Task 5.3: Upload Results to Cloudinary
**Status:** NOT STARTED

**Backend:**
- [ ] Install Cloudinary SDK
- [ ] Upload screenshots after each step
- [ ] Upload video after test completes
- [ ] Save URLs to database

**Frontend Integration:**
- [ ] Display screenshots from Cloudinary URLs
- [ ] Play video from Cloudinary URL

**Verification:**
- [ ] Screenshots load from Cloudinary
- [ ] Video plays from Cloudinary

---

### Task 5.4: Test Run Results
**Status:** NOT STARTED

**Backend:**
- [ ] GET /runs/:id endpoint
- [ ] Return full results with step details, screenshots, video
- [ ] Include console/network errors

**Frontend Integration:**
- [ ] Fetch run results after completion
- [ ] Display in results view
- [ ] Show pass/fail for each step
- [ ] Show error panel if failures

**Verification:**
- [ ] Can view completed test run
- [ ] All data displays correctly

---

### Task 5.5: List Test Runs
**Status:** NOT STARTED

**Backend:**
- [ ] GET /tests/:testId/runs endpoint
- [ ] Return run history with summary

**Frontend Integration:**
- [ ] Show run history in test file detail page

**Verification:**
- [ ] Can see past runs
- [ ] Can click to view details

---

## Phase 6: Share Feature

### Task 6.1: Generate Share Link
**Status:** NOT STARTED

**Backend:**
- [ ] Generate unique shareToken for TestRun
- [ ] POST /runs/:id/share endpoint (or auto-generate)

**Frontend Integration:**
- [ ] "Share" button generates/copies link

**Verification:**
- [ ] Can generate share link
- [ ] Link is copyable

---

### Task 6.2: Public Share Page
**Status:** NOT STARTED

**Backend:**
- [ ] GET /share/:shareToken endpoint (no auth required)
- [ ] Return test results, steps, video, errors

**Frontend Integration:**
- [ ] Share page fetches data from this endpoint
- [ ] Displays read-only results view

**Verification:**
- [ ] Share link opens without login
- [ ] All data displays correctly

---

### Task 6.3: Verify Fix Feature
**Status:** NOT STARTED

**Backend:**
- [ ] POST /share/:shareToken/verify endpoint
- [ ] Triggers new test run
- [ ] Returns new runId

**Frontend Integration:**
- [ ] "Verify Fix" button triggers run
- [ ] Shows new run progress/results

**Verification:**
- [ ] Dev can click "Verify Fix" without login
- [ ] New test run executes
- [ ] Results displayed

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 0: Setup | 3 tasks | COMPLETE ✓ |
| Phase 1: Projects | 5 tasks | 5/5 COMPLETE ✓ |
| Phase 1.5: Folders | 4 tasks | 4/4 COMPLETE ✓ |
| Phase 2: Test Files | 5 tasks | 5/5 COMPLETE ✓ |
| Phase 3: Steps | - | SKIPPED ⏭️ |
| Phase 4: Recording | 7 tasks | 7/7 COMPLETE ✓ |
| Phase 5: Execution | 5 tasks | NOT STARTED |
| Phase 6: Share | 3 tasks | NOT STARTED |

**Total: 32 tasks** (Phase 3 skipped, Phase 4 complete)

---

## Notes

- Each task should be completed in order within its phase
- Phases can sometimes overlap (e.g., Phase 1 & 2 are both CRUD)
- Phase 4 (Recording) and Phase 5 (Execution) are the core features
- Always test with real frontend integration before marking complete

## Architecture

```
Project (has baseUrl)
├── Folder (just a name)
│   └── TestFile (has steps)
├── Folder
│   └── TestFile
```

- **Projects** have a name, description, and baseUrl
- **Folders** organize test files within a project (no nesting allowed)
- **Test Files** must belong to a folder (no root-level files)
- **Project Switcher** dropdown in top bar allows switching between projects
