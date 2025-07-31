import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import App from './index';
import Login from '@/pages/Login';
import FogotPassword from '@/pages/FogorPassword';
import Dashboard from '@/pages/Dashboard';
import Error from '@/pages/Error';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />, // Общий макет с Header
        errorElement: <Error />,
        children: [
            {
                path: '/login',
                element: <Login />, // Login как дочерний маршрут
            },
            {
                path: '/forgot-password',
                element: <FogotPassword />, // FogotPassword как дочерний маршрут
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