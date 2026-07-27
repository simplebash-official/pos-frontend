import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import { AppShell } from './layout/AppShell';

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

const PageLoader = () => (
  <Center h="70vh">
    <Loader size="lg" color="indigo" />
  </Center>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/billing" replace />,
      },
      {
        path: 'billing',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BillingCounter />
          </Suspense>
        ),
      },
      {
        path: 'repairs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <RepairJobList />
          </Suspense>
        ),
      },
      {
        path: 'print-jobs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PrintJobList />
          </Suspense>
        ),
      },
      {
        path: 'inventory',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProductTable />
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CustomerList />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ReportsDashboard />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <EmailLoginScreen />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/billing" replace />,
  },
]);
