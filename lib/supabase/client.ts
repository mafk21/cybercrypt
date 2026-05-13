import { createClient } from '@supabase/supabase-js'

// استخدام قيم افتراضية فارغة لمنع انهيار الـ Build في Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);