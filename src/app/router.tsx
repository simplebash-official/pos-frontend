/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { RequireAdmin } from './components/RequireAdmin';
import { RequirePermission } from './components/RequirePermission';
import { GuestOnly } from './components/GuestOnly';
import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { BillingPageSkeleton } from '@/shared/components/BillingPageSkeleton';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { NotFoundPage } from '@/shared/components/NotFoundPage';
import { ROUTES, ROUTE_PATHS } from '@/constants';
import { PERMISSIONS } from '@/constants/permissions';

// Code-split features using direct dynamic imports (avoids barrel re-export bloat)
const BillingCounter = lazy(() =>
  import('@/features/billing/components/BillingCounter').then((m) => ({
    default: m.BillingCounter,
  }))
);
const InvoicesList = lazy(() =>
  import('@/features/invoices/components/InvoicesList').then((m) => ({ default: m.InvoicesList }))
);
const RepairJobList = lazy(() =>
  import('@/features/repairs/components/RepairJobList').then((m) => ({ default: m.RepairJobList }))
);
const PrintJobList = lazy(() =>
  import('@/features/print-jobs/components/PrintJobList').then((m) => ({ default: m.PrintJobList }))
);
const ProductTable = lazy(() =>
  import('@/features/inventory/components/ProductTable').then((m) => ({ default: m.ProductTable }))
);
const CustomerList = lazy(() =>
  import('@/features/customers/components/CustomerList').then((m) => ({ default: m.CustomerList }))
);
const SupplierList = lazy(() =>
  import('@/features/suppliers/components/SupplierList').then((m) => ({ default: m.SupplierList }))
);
const EmployeeList = lazy(() =>
  import('@/features/employees/components/EmployeeList').then((m) => ({ default: m.EmployeeList }))
);
const UsersList = lazy(() =>
  import('@/features/users/components/UsersList').then((m) => ({ default: m.UsersList }))
);
const ReportsDashboard = lazy(() =>
  import('@/features/reports/components/ReportsDashboard').then((m) => ({
    default: m.ReportsDashboard,
  }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings/components/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const EmailLoginScreen = lazy(() =>
  import('@/features/auth/components/EmailLoginScreen').then((m) => ({
    default: m.EmailLoginScreen,
  }))
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
          <RequirePermission permissions={[PERMISSIONS.EMPLOYEES_READ]}>
            <Suspense fallback={<PageSkeleton />}>
              <EmployeeList />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: ROUTE_PATHS.ACCOUNTS,
        element: (
          <RequirePermission
            permissions={[PERMISSIONS.USERS_MANAGE, PERMISSIONS.USERS_MANAGE_STAFF]}
          >
            <Suspense fallback={<PageSkeleton />}>
              <UsersList />
            </Suspense>
          </RequirePermission>
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
