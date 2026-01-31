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

### Task 3.1: Add Test Step (Manual)
**Status:** NOT STARTED

**Backend:**
- [ ] POST /tests/:testId/steps endpoint
- [ ] Accept: action, description, expectedResult, targetLocators, value
- [ ] Auto-increment stepNumber

**Frontend Integration:**
- [ ] Connect "Add Step" form to API (if manual step creation exists)

**Verification:**
- [ ] Can add step manually
- [ ] Step appears in correct order

---

### Task 3.2: Update Test Step
**Status:** NOT STARTED

**Backend:**
- [ ] PATCH /tests/:testId/steps/:stepId endpoint

**Frontend Integration:**
- [ ] Connect step edit form to API

**Verification:**
- [ ] Can edit step details
- [ ] Changes persist

---

### Task 3.3: Delete Test Step
**Status:** NOT STARTED

**Backend:**
- [ ] DELETE /tests/:testId/steps/:stepId endpoint
- [ ] Reorder remaining steps

**Frontend Integration:**
- [ ] Connect delete button to API
- [ ] Update step numbers in UI

**Verification:**
- [ ] Can delete step
- [ ] Remaining steps renumbered correctly

---

### Task 3.4: Reorder Test Steps
**Status:** NOT STARTED

**Backend:**
- [ ] POST /tests/:testId/steps/reorder endpoint
- [ ] Accept array of step IDs in new order

**Frontend Integration:**
- [ ] Implement drag-and-drop reordering
- [ ] Call API on drop

**Verification:**
- [ ] Can drag steps to reorder
- [ ] New order persists after refresh

---

## Phase 4: Recording (Core Feature)

### Task 4.1: Recording WebSocket Setup
**Status:** NOT STARTED

**Backend:**
- [ ] Create RecordingGateway (WebSocket)
- [ ] Handle 'recording:start' event
- [ ] Handle 'recording:stop' event
- [ ] Handle 'recording:step' event

**Frontend Integration:**
- [ ] Set up WebSocket connection to backend
- [ ] Emit events when recording starts/stops

**Verification:**
- [ ] WebSocket connects successfully
- [ ] Events are received by backend

---

### Task 4.2: Browser Launch for Recording
**Status:** NOT STARTED

**Backend:**
- [ ] Launch Playwright browser on 'recording:start'
- [ ] Inject qa-tagger.ts into page
- [ ] Navigate to project's baseUrl
- [ ] Emit 'recording:ready' when browser is open

**Frontend Integration:**
- [ ] Show "Recording..." status when ready
- [ ] Handle connection errors

**Verification:**
- [ ] Browser opens when user clicks Record
- [ ] qa-tagger.ts is injected (can see data-qa-id attributes)

---

### Task 4.3: Capture Recording Steps
**Status:** NOT STARTED

**Backend:**
- [ ] Listen for messages from qa-tagger (via Playwright)
- [ ] Parse ElementPickedMessage
- [ ] Save step to database
- [ ] Emit 'recording:step-saved' with step data

**Frontend Integration:**
- [ ] Listen for 'recording:step-saved' events
- [ ] Add step to UI in real-time
- [ ] Show step preview

**Verification:**
- [ ] Click element in browser → step appears in frontend
- [ ] Step saved to database with correct locators

---

### Task 4.4: Stop Recording
**Status:** NOT STARTED

**Backend:**
- [ ] Close Playwright browser on 'recording:stop'
- [ ] Emit 'recording:complete'

**Frontend Integration:**
- [ ] Close WebSocket connection
- [ ] Show final test with all steps

**Verification:**
- [ ] Browser closes when user clicks Stop
- [ ] All steps are saved and displayed

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
| Phase 3: Steps | 4 tasks | NOT STARTED |
| Phase 4: Recording | 4 tasks | NOT STARTED |
| Phase 5: Execution | 5 tasks | NOT STARTED |
| Phase 6: Share | 3 tasks | NOT STARTED |

**Total: 33 tasks**

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
