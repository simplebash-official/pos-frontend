import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import { AppShell } from './layout/AppShell';

const DefaultLoader = () => (
  <Center h="70vh">
    <Loader size="md" color="indigo" />
  </Center>
);

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
    children: [
      {
        index: true,
        element: <Navigate to="/billing" replace />,
      },
      {
        path: 'billing',
        element: (
          <Suspense fallback={<DefaultLoader />}>
            <BillingCounter />
          </Suspense>
        ),
      },
      {
        path: 'repairs',
        element: (
          <Suspense fallback={<DefaultLoader />}>
            <RepairJobList />
          </Suspense>
        ),
      },
      {
        path: 'print-jobs',
        element: (
          <Suspense fallback={<DefaultLoader />}>
            <PrintJobList />
          </Suspense>
        ),
      },
      {
        path: 'inventory',
        element: (
          <Suspense fallback={<DefaultLoader />}>
            <ProductTable />
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<DefaultLoader />}>
            <CustomerList />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<DefaultLoader />}>
            <ReportsDashboard />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<DefaultLoader />}>
        <EmailLoginScreen />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/billing" replace />,
  },
]);
