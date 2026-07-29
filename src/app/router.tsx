import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { NotFoundPage } from '@/shared/components/NotFoundPage';
import { ROUTES, ROUTE_PATHS } from '@/constants';

// Code-split features using dynamic imports
const BillingCounter = lazy(() =>
  import('@/features/billing').then((m) => ({ default: m.BillingCounter }))
);
const RepairJobList = lazy(() =>
  import('@/features/repairs').then((m) => ({ default: m.RepairJobList }))
);
const PrintJobList = lazy(() =>
  import('@/features/print-jobs').then((m) => ({ default: m.PrintJobList }))
);
const ProductTable = lazy(() =>
  import('@/features/inventory').then((m) => ({ default: m.ProductTable }))
);
const CustomerList = lazy(() =>
  import('@/features/customers').then((m) => ({ default: m.CustomerList }))
);
const ReportsDashboard = lazy(() =>
  import('@/features/reports').then((m) => ({ default: m.ReportsDashboard }))
);
const EmailLoginScreen = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.EmailLoginScreen }))
);

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <AppShell />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.BILLING} replace />,
      },
      {
        path: ROUTE_PATHS.BILLING,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <BillingCounter />
          </Suspense>
        ),
      },
      {
        path: ROUTE_PATHS.REPAIRS,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <RepairJobList />
          </Suspense>
        ),
      },
      {
        path: ROUTE_PATHS.PRINT_JOBS,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <PrintJobList />
          </Suspense>
        ),
      },
      {
        path: ROUTE_PATHS.INVENTORY,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <ProductTable />
          </Suspense>
        ),
      },
      {
        path: ROUTE_PATHS.CUSTOMERS,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <CustomerList />
          </Suspense>
        ),
      },
      {
        path: ROUTE_PATHS.REPORTS,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <ReportsDashboard />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <EmailLoginScreen />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
