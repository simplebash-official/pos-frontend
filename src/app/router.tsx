import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { BillingCounter } from '@/features/billing';
import { RepairJobList } from '@/features/repairs';
import { PrintJobList } from '@/features/print-jobs';
import { ProductTable } from '@/features/inventory';
import { CustomerList } from '@/features/customers';
import { ReportsDashboard } from '@/features/reports';
import { PinLoginScreen } from '@/features/auth';

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
        element: <BillingCounter />,
      },
      {
        path: 'repairs',
        element: <RepairJobList />,
      },
      {
        path: 'print-jobs',
        element: <PrintJobList />,
      },
      {
        path: 'inventory',
        element: <ProductTable />,
      },
      {
        path: 'customers',
        element: <CustomerList />,
      },
      {
        path: 'reports',
        element: <ReportsDashboard />,
      },
    ],
  },
  {
    path: '/login',
    element: <PinLoginScreen />,
  },
  {
    path: '*',
    element: <Navigate to="/billing" replace />,
  },
]);
