import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { NotFoundPage } from '@/shared/components/NotFoundPage';

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
    path: '/',
    element: <AppShell />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/billing" replace />,
      },
      {
        path: 'billing',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <BillingCounter />
          </Suspense>
        ),
      },
      {
        path: 'repairs',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <RepairJobList />
          </Suspense>
        ),
      },
      {
        path: 'print-jobs',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <PrintJobList />
          </Suspense>
        ),
      },
      {
        path: 'inventory',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <ProductTable />
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <CustomerList />
          </Suspense>
        ),
      },
      {
        path: 'reports',
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
    path: '/login',
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
