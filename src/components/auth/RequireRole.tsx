import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useGameStore } from '@/stores/useGameStore';
import type { UserRole } from '@/types';

interface RequireRoleProps {
    allowedRoles: UserRole[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles }) => {
    const user = useGameStore(state => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Treat undefined role as 'PLAYER' (the standard fallback)
    const currentRole = user.role || 'PLAYER';

    // Verify role permissions
    if (!allowedRoles.includes(currentRole)) {
        console.warn(`[SECURITY] Unauthorized access attempt. User ${user.id} (${currentRole}) lacks required role(s): ${allowedRoles.join(', ')}`);
        return <Navigate to="/terminal" replace />;
    }

    return <Outlet />;
};
