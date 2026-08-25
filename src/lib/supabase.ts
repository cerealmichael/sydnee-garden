import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Bez kluczy w env apka chodzi lokalnie (localStorage) - wygodne w dev. */
export const supabase = url && key ? createClient(url, key) : null
export const hasSupabase = supabase !== null
