import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import App from './index';
import Registration from '@/pages/Registration';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Error from '@/pages/Error';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <Error />,
        children: [
            {
                path: '/',
                //element: <Landing />,
            },
            {
                path: '/signup',
                element: <Registration />,
            },
            {
                path: '/signin',
                element: <Login />,
            },
            {
                path: '/forgot-password',
                element: <ForgotPassword />,
            },
            {
                path: '/dashboard',
                element: <Dashboard />, // Главная с workspaces
                errorElement: <Error />,
            },
            {
                path: '/dashboard/recent',
                //element: <RecentWorkspaces />, // Недавние workspace'ы
                errorElement: <Error />,
            },
            {
                path: '/dashboard/starred',
                //element: <StarredWorkspaces />, // Избранные workspace'ы
                errorElement: <Error />,
            },
            {
                path: '/dashboard/explorer',
                //element: <WorkspaceExplorer />, // Обзор доступных workspace'ов
                errorElement: <Error />,
            },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);