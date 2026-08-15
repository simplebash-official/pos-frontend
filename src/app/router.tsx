/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { RequireAdmin } from './components/RequireAdmin';
import { GuestOnly } from './components/GuestOnly';
import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { BillingPageSkeleton } from '@/shared/components/BillingPageSkeleton';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { NotFoundPage } from '@/shared/components/NotFoundPage';
import { ROUTES, ROUTE_PATHS } from '@/constants';

// Code-split features using dynamic imports
const BillingCounter = lazy(() =>
  import('@/features/billing').then((m) => ({ default: m.BillingCounter }))
);
const InvoicesList = lazy(() =>
  import('@/features/invoices').then((m) => ({ default: m.InvoicesList }))
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
const SupplierList = lazy(() =>
  import('@/features/suppliers').then((m) => ({ default: m.SupplierList }))
);
const EmployeeList = lazy(() =>
  import('@/features/employees').then((m) => ({ default: m.EmployeeList }))
);
const ReportsDashboard = lazy(() =>
  import('@/features/reports').then((m) => ({ default: m.ReportsDashboard }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings').then((m) => ({ default: m.SettingsPage }))
);
const EmailLoginScreen = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.EmailLoginScreen }))
);
const StandalonePrintView = lazy(() =>
  import('@/features/billing/components/StandalonePrintView').then((m) => ({
    default: m.StandalonePrintView,
  }))
);

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.BILLING} replace />,
      },
      {
        path: ROUTE_PATHS.BILLING,
        element: (
          <Suspense fallback={<BillingPageSkeleton />}>
            <BillingCounter />
          </Suspense>
        ),
      },
      {
        path: ROUTE_PATHS.INVOICES,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <InvoicesList />
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
        path: ROUTE_PATHS.SUPPLIERS,
        element: (
          <RequireAdmin>
            <Suspense fallback={<PageSkeleton />}>
              <SupplierList />
            </Suspense>
          </RequireAdmin>
        ),
      },
      {
        path: ROUTE_PATHS.EMPLOYEES,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <EmployeeList />
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
        path: ROUTE_PATHS.SETTINGS,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <SettingsPage />
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
      <GuestOnly>
        <Suspense fallback={<PageSkeleton />}>
          <EmailLoginScreen />
        </Suspense>
      </GuestOnly>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/print/invoice/:id',
    element: (
      <RequireAuth>
        <Suspense fallback={<PageSkeleton />}>
          <StandalonePrintView />
        </Suspense>
      </RequireAuth>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
