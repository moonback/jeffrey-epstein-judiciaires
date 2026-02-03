import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isSupabaseConfigured =
    !!(supabaseUrl &&
        supabaseAnonKey &&
        !supabaseUrl.includes('your_supabase_url') &&
        !supabaseAnonKey.includes('your_supabase_anon'));

if (!isSupabaseConfigured) {
    console.warn('Supabase credentials missing or using placeholders. Local storage only.');
}

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export { isSupabaseConfigured };
