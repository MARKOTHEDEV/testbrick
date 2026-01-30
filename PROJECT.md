# TestBloc - Browser Testing Platform

## Project Vision

TestBloc is a **no-code browser testing tool** that allows QA teams to record, replay, and share automated tests without writing code.

---

## Core Product Flow

### 1. Recording Flow

```
User creates project → Test file auto-created → Browser opens
                                                    ↓
                              User interacts + adds assertions via floating button
                                                    ↓
                              Actions captured → Stored as JSON
```

### 2. Replay/View Flow

- **Re-run tests** from stored JSON
- **Story Mode** - Table view of test steps (built ✓)
- **Block Mode** - Visual block representation using Blockly (built ✓, read-only for v1)
- **Share Page** - Public link for devs to verify fixes without contacting QA (built ✓)

---

## Key Differentiator: Unique Element ID Algorithm

**The Problem:** Traditional selectors (CSS, XPath) are fragile - classes change, DOM shifts, IDs are auto-generated.

**The Solution:** Inject a custom ID generation algorithm into the controlled browser session:

- During **recording**: Generate stable IDs for each interacted element
- During **playback**: Use same algorithm to find elements reliably

This approach is similar to what Testim/Mabl do with "smart locators" but with our own algorithm.

---

## Tech Stack

### Frontend (React + TypeScript)

- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Icons:** Lucide React
- **Routing:** React Router v6
- **State:** React hooks + Zustand (available)
- **Visual Editor:** Blockly.js for block mode
- **Data Fetching:** React Query (configured)

### Design Tokens

- **Primary:** `#6e0699` (Purple)
- **Secondary:** `#5570f1` (Blue)
- **Font:** Plus Jakarta Sans

### Backend (To Be Built)

- Test session management
- Browser automation (Playwright/Puppeteer)
- Test execution queue
- Results storage + video recording
- Unique element ID algorithm injection

---

## Pages Built

| Page             | Route                     | Status | Description                          |
| ---------------- | ------------------------- | ------ | ------------------------------------ |
| Wait List        | `/`                       | ✓      | Landing page for signups             |
| Auth             | `/auth/*`                 | ✓      | Login, Register, Forgot Password     |
| Dashboard        | `/dashboard`              | ✓      | Project/file management with sidebar |
| Test File Detail | `/dashboard/test/:fileId` | ✓      | Story mode + Block mode views        |
| Test Share       | `/share/:testId`          | ✓      | Public page for devs to verify fixes |

---

## Test Share Page Features

1. **Header** - Test name, creator, date, duration, pass/fail badges
2. **Video Player** - Test recording playback (placeholder ready)
3. **Steps Table** (read-only)
   - Columns: Step | Action | Expected Result | Screenshot | Status
   - Screenshot drawer on click
4. **Error Panel** (conditional, hidden by default)
   - Console Errors tab
   - Network Errors tab
5. **Verify Fix Button** - Re-runs test to verify fix without QA involvement

---

## Data Structures

### TestStep

```typescript
type TestStep = {
  id: string;
  stepNumber: number;
  action: string; // "Click login button"
  expectedResult: string; // "User redirected to dashboard"
  screenshot: string; // URL to screenshot
  status: "passed" | "failed";
};
```

### Console Error

```typescript
type ConsoleError = {
  id: string;
  type: "error" | "warning";
  message: string;
  source: string; // filename
  line: number;
  timestamp: string;
};
```

### Network Error

```typescript
type NetworkError = {
  id: string;
  method: string; // "POST", "GET"
  url: string;
  status: number; // 401, 500
  statusText: string; // "Unauthorized"
  duration: string;
  timestamp: string;
};
```

---

## Next Steps

### Backend Development

1. [ ] Set up Node.js/Express or similar
2. [ ] Database schema (projects, tests, steps, results)
3. [ ] Playwright/Puppeteer integration
4. [ ] Test recording endpoint (WebSocket for real-time)
5. [ ] Test playback/execution service
6. [ ] Video recording storage
7. [ ] Unique element ID algorithm implementation

### Frontend Integration

1. [ ] Connect to backend APIs
2. [ ] Real video player integration
3. [ ] WebSocket for live test recording
4. [ ] Real-time test execution status

---

## Folder Structure

```
testbloc/
├── frontend/          # React application (current codebase)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── router/
│   │   └── ...
│   └── package.json
│
├── backend/           # To be built
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── ...
│   └── package.json
│
└── PROJECT.md         # This file
```

---

## Notes for Resuming

- All frontend UI screens are complete
- Share page is at `/share/:testId` (public, no auth)
- Block mode is read-only for v1 to reduce complexity
- User has a unique element ID algorithm to share later
- Backend is the next priority
