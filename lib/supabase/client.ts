import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // نقوم بقراءة المتغيرات داخل الدالة وليس خارجها
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // إذا كنا في مرحلة الـ Build ولم تتوفر القيم، نرجع عميل "وهمي" أو فارغ لمنع الانهيار
  if (!supabaseUrl || !supabaseAnonKey) {
    return {} as any; 
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// تصدير نسخة جاهزة للاستخدام
export const supabase = createClient();