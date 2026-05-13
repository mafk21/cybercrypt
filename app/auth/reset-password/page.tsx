"use client";
export const dynamic = 'force-dynamic'

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);

  const updatePassword = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) return toast.error(error.message);

    toast.success("Password updated successfully");
    location.href = "/dashboard";
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="cyber-card rounded-3xl border border-cyan-500/30 bg-black/80 p-8 shadow-[0_0_70px_rgba(0,255,255,0.08)]">
          <div className="text-center space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium mb-2">
                security
              </p>
              <h1 className="text-3xl font-bold text-white">RESET PASSWORD</h1>
            </div>

            <form onSubmit={updatePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  New Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter new password..."
                  className="w-full bg-black/70 border border-cyan-500/30 p-3 rounded-xl text-white placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-cyan-300 mb-2">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password..."
                  className="w-full bg-black/70 border border-cyan-500/30 p-3 rounded-xl text-white placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}