import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

// Only initialize the client if config is actually present, otherwise app crashes on boot due to module evaluation error.
// The `isSupabaseConfigured` check throughout the app prevents accessing the null client.
export const supabase = isSupabaseConfigured 
    ? createClient<Database>(supabaseUrl, supabaseAnonKey) 
    : null as any; // eslint-disable-line @typescript-eslint/no-explicit-any
