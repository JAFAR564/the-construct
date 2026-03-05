import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUIStore } from '@/stores/useUIStore';
import { useGameStore } from '@/stores/useGameStore';
import { isSupabaseConfigured } from '@/services/supabase';
import * as auth from '@/services/auth';
import * as db from '@/services/supabaseDB';

export const BootGuard: React.FC = () => {
    const bootComplete = useUIStore(state => state.bootComplete);
    const user = useGameStore(state => state.user);
    const setUser = useGameStore(state => state.setUser);
    const initializeBootState = useUIStore(state => state.initializeBootState);
    const initializeFromDB = useGameStore(state => state.initializeFromDB);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await initializeBootState();

            // Try Supabase auth first
            if (isSupabaseConfigured) {
                try {
                    const authUser = await auth.getAuthUser();
                    if (authUser) {
                        const dbUser = await db.getUser(authUser.id);
                        if (dbUser) {
                            setUser(dbUser);
                            setLoading(false);
                            return;
                        }
                    }
                } catch (e) {
                    console.warn('[BootGuard] Supabase auth check failed:', e);
                }
            }

            // Fallback to local DB
            await initializeFromDB();
            setLoading(false);
        };

        init();
    }, [initializeBootState, initializeFromDB, setUser]);

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
