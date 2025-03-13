import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const AgentDownloadPage = lazy(() => import('src/pages/agent-download'));
export const AgentPage = lazy(() => import('src/pages/agent'));
export const ExecutePage = lazy(() => import('src/pages/execute'));
export const ResultPage = lazy(() => import('src/pages/result'));
export const CredentialPage = lazy(() => import('src/pages/credential'));
export const ActivatePage = lazy(() => import('src/pages/activate'));
export const LicensePage = lazy(() => import('src/pages/license'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <HomePage />, index: true },
        { path: 'agent-download', element: <AgentDownloadPage /> },
        { path: 'agent', element: <AgentPage /> },
        { path: 'execute', element: <ExecutePage /> },
        { path: 'result', element: <ResultPage /> },
        { path: 'credential', element: <CredentialPage /> },
        { path: 'license', element: <LicensePage /> }
      ],
    },
    {
      path: 'activate',
      element: (
        <AuthLayout>
          <ActivatePage />
        </AuthLayout>
      ),
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
