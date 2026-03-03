import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUIStore } from '@/stores/useUIStore';
import { useGameStore } from '@/stores/useGameStore';

export const BootGuard: React.FC = () => {
    const bootComplete = useUIStore(state => state.bootComplete);
    const user = useGameStore(state => state.user);
    const initializeBootState = useUIStore(state => state.initializeBootState);
    const initializeFromDB = useGameStore(state => state.initializeFromDB);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            initializeBootState(),
            initializeFromDB()
        ]).then(() => {
            setLoading(false);
        });
    }, [initializeBootState, initializeFromDB]);

    if (loading) {
        return <div style={{ backgroundColor: 'var(--bg-dark)', height: '100vh', width: '100vw' }} />;
    }

    if (!bootComplete) {
        return <Navigate to="/" replace />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
