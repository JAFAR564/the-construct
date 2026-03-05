import { supabase, isSupabaseConfigured } from '@/services/supabase';
import type { Session, User as AuthUser } from '@supabase/supabase-js';

export interface AuthResult {
    success: boolean;
    error?: string;
    user?: AuthUser;
    session?: Session;
}

/**
 * Sign up a new user with email + password.
 * Returns the auth user (email confirmation may be required depending on Supabase settings).
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase not configured. Operating in offline mode.' };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        user: data.user ?? undefined,
        session: data.session ?? undefined,
    };
}

/**
 * Sign in an existing user with email + password.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) {
        return { success: false, error: 'Supabase not configured. Operating in offline mode.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        user: data.user ?? undefined,
        session: data.session ?? undefined,
    };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
}

/**
 * Get the current session (null if not authenticated).
 */
export async function getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured) return null;

    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

/**
 * Get the current auth user (null if not authenticated).
 */
export async function getAuthUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured) return null;

    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
    callback: (event: string, session: Session | null) => void
): () => void {
    if (!isSupabaseConfigured) return () => { };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return () => subscription.unsubscribe();
}
