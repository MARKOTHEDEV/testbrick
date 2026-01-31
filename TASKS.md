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
**Status:** READY FOR VERIFICATION

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
- [x] Replace auth page with Clerk SignIn/SignUp components

**Verification:**
- [x] Unauthorized request to protected route returns 401
- [ ] Authorized request returns user data (manual test needed)

---

## Phase 1: Projects CRUD

### Task 1.1: Create Project
**Status:** NOT STARTED

**Backend:**
- [ ] POST /projects endpoint
- [ ] Validate: name (required), description (optional), baseUrl (required)
- [ ] Associate with authenticated user

**Frontend Integration:**
- [ ] Connect "Create Project" modal/form to API
- [ ] Show success/error feedback
- [ ] Refresh project list after creation

**Verification:**
- [ ] Can create project from frontend
- [ ] Project appears in database
- [ ] Project appears in UI list

---

### Task 1.2: List Projects
**Status:** NOT STARTED

**Backend:**
- [ ] GET /projects endpoint
- [ ] Return only current user's projects
- [ ] Include test file count per project

**Frontend Integration:**
- [ ] Fetch projects on dashboard load
- [ ] Display in sidebar/project list

**Verification:**
- [ ] Projects load on dashboard
- [ ] Only shows current user's projects

---

### Task 1.3: Update Project
**Status:** NOT STARTED

**Backend:**
- [ ] PATCH /projects/:id endpoint
- [ ] Verify ownership before update

**Frontend Integration:**
- [ ] Connect "Edit Project" form to API
- [ ] Update UI after successful edit

**Verification:**
- [ ] Can edit project name/description/baseUrl
- [ ] Changes persist and display correctly

---

### Task 1.4: Delete Project
**Status:** NOT STARTED

**Backend:**
- [ ] DELETE /projects/:id endpoint
- [ ] Verify ownership before delete
- [ ] Cascade delete test files, steps, runs

**Frontend Integration:**
- [ ] Connect "Delete Project" button to API
- [ ] Show confirmation dialog
- [ ] Remove from UI after deletion

**Verification:**
- [ ] Can delete project
- [ ] All related data is deleted
- [ ] UI updates correctly

---

## Phase 2: Test Files CRUD

### Task 2.1: Create Test File
**Status:** NOT STARTED

**Backend:**
- [ ] POST /projects/:projectId/tests endpoint
- [ ] Validate: name (required), description (optional)
- [ ] Verify user owns the project

**Frontend Integration:**
- [ ] Connect "Create Test" button to API
- [ ] Refresh test list after creation

**Verification:**
- [ ] Can create test file from frontend
- [ ] Test file appears in project

---

### Task 2.2: List Test Files
**Status:** NOT STARTED

**Backend:**
- [ ] GET /projects/:projectId/tests endpoint
- [ ] Include step count and last run status

**Frontend Integration:**
- [ ] Fetch test files when project is selected
- [ ] Display in test list

**Verification:**
- [ ] Test files load for selected project
- [ ] Shows correct step count and status

---

### Task 2.3: Get Test File Details
**Status:** NOT STARTED

**Backend:**
- [ ] GET /tests/:id endpoint
- [ ] Include all steps with full details
- [ ] Include recent runs summary

**Frontend Integration:**
- [ ] Fetch test details on test file page
- [ ] Populate Story Mode table with steps
- [ ] Populate Block Mode with steps

**Verification:**
- [ ] Test details page loads correctly
- [ ] Steps display in correct order
- [ ] Both Story and Block modes work

---

### Task 2.4: Update Test File
**Status:** NOT STARTED

**Backend:**
- [ ] PATCH /tests/:id endpoint
- [ ] Verify ownership

**Frontend Integration:**
- [ ] Connect edit functionality to API

**Verification:**
- [ ] Can rename test file
- [ ] Changes persist

---

### Task 2.5: Delete Test File
**Status:** NOT STARTED

**Backend:**
- [ ] DELETE /tests/:id endpoint
- [ ] Cascade delete steps and runs

**Frontend Integration:**
- [ ] Connect delete button to API
- [ ] Update UI after deletion

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
| Phase 0: Setup | 3 tasks | IN PROGRESS (2/3) |
| Phase 1: Projects | 4 tasks | NOT STARTED |
| Phase 2: Test Files | 5 tasks | NOT STARTED |
| Phase 3: Steps | 4 tasks | NOT STARTED |
| Phase 4: Recording | 4 tasks | NOT STARTED |
| Phase 5: Execution | 5 tasks | NOT STARTED |
| Phase 6: Share | 3 tasks | NOT STARTED |

**Total: 28 tasks**

---

## Notes

- Each task should be completed in order within its phase
- Phases can sometimes overlap (e.g., Phase 1 & 2 are both CRUD)
- Phase 4 (Recording) and Phase 5 (Execution) are the core features
- Always test with real frontend integration before marking complete
