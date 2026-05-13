"use client";

// إجبار الصفحة على الوضع الديناميكي هو المفتاح لتجاوز أخطاء البناء في Vercel
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);

  const updatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // التحقق من تطابق كلمات المرور
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // التحقق من استجابة Supabase
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      
      // توجيه المستخدم بعد النجاح
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="cyber-card rounded-3xl border border-cyan-500/30 bg-black/80 p-8 shadow-[0_0_70px_rgba(0,255,255,0.08)] backdrop-blur-md">
          <div className="text-center space-y-6">
            <header>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium mb-2">
                security protocol
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
                Reset <span className="text-cyan-500">Password</span>
              </h1>
            </header>

            <form onSubmit={updatePassword} className="text-left space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-cyan-300 ml-1">
                  New Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-black/70 border border-cyan-500/30 p-3 rounded-xl text-white placeholder-cyan-400/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-cyan-300 ml-1">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-black/70 border border-cyan-500/30 p-3 rounded-xl text-white placeholder-cyan-400/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all"
                  required
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full relative group overflow-hidden rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3.5 font-bold text-white transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    AUTHORIZING...
                  </span>
                ) : (
                  "UPDATE PASSWORD"
                )}
              </button>
            </form>
            
            <footer className="text-[10px] text-cyan-500/40 pt-2 uppercase tracking-widest">
              Secure encrypted session initialized
            </footer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}