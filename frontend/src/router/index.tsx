import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts
import RootLayout from "@/layouts/RootLayout";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Lazy load pages for better performance
const AuthPage = lazy(() => import("@/pages/auth"));
const WaitListPage = lazy(() => import("@/pages/wait-list-v2"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const TestFileDetailPage = lazy(() => import("@/pages/dashboard/test-file-detail"));
const TestSharePage = lazy(() => import("@/pages/test-share"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

// Wrap lazy components with Suspense
const withSuspense = (
  Component: React.LazyExoticComponent<React.ComponentType>,
) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public routes
      {
        path: "/",
        element: withSuspense(WaitListPage),
      },
      {
        path: "/waitlist",
        element: withSuspense(WaitListPage),
      },

      // Public share page (no auth required)
      {
        path: "/share/:testId",
        element: withSuspense(TestSharePage),
      },

      // Auth routes (redirect to dashboard if logged in)
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/auth",
            element: <Navigate to="/auth/login" replace />,
          },
          {
            path: "/auth/login",
            element: withSuspense(AuthPage),
          },
          {
            path: "/auth/register",
            element: withSuspense(AuthPage),
          },
          {
            path: "/auth/forgot-password",
            element: withSuspense(AuthPage),
          },
        ],
      },

      // Protected routes (require authentication)
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: "/dashboard",
                element: withSuspense(DashboardPage),
              },
              {
                path: "/dashboard/test/:fileId",
                element: withSuspense(TestFileDetailPage),
              },
            ],
          },
        ],
      },

      // 404 fallback
      {
        path: "*",
        element: (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-primary">404</h1>
              <p className="text-muted-foreground mt-2">Page not found</p>
            </div>
          </div>
        ),
      },
    ],
  },
]);
