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
                path: '/',
                element: <Dashboard />,
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