"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/admin";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const signUp = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const email = String(e.target.email.value).trim().toLowerCase();
    const password = e.target.password.value;
    const username = e.target.username.value;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Verification email sent.");
  };

  const login = async (e: any) => {
    e.preventDefault();

    const email = String(e.target.email.value).trim().toLowerCase();
    const password = e.target.password.value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    window.location.href = isAdminEmail(email) ? "/admin" : "/dashboard";
  };

  const resetPassword = async (e: any) => {
    e.preventDefault();

    const email = String(e.target.resetEmail.value).trim().toLowerCase();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password reset email sent.");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="cyber-card rounded-3xl border border-cyan-500/30 bg-black/80 p-8 shadow-[0_0_70px_rgba(0,255,255,0.08)]">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
                secure sign in
              </p>
              <h1 className="text-4xl font-extrabold text-white">CYBERCRYPT</h1>
              <p className="text-cyan-300/80 leading-relaxed">
                Access the challenge arena, track your progress, and compete in a futuristic cryptography race.
              </p>
            </div>

            <div className="rounded-3xl bg-[#060b13]/80 border border-cyan-500/20 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium mb-4">
                quick actions
              </p>
              <div className="space-y-3">
                <button className="w-full rounded-2xl bg-cyan-500/20 px-4 py-3 text-left text-sm text-cyan-100 border border-cyan-500/30 transition hover:bg-cyan-500/30">
                  Sign in to recover access and keep your stats secure.
                </button>
                <button className="w-full rounded-2xl bg-purple-500/20 px-4 py-3 text-left text-sm text-purple-100 border border-purple-500/30 transition hover:bg-purple-500/30">
                  Register a new hacker alias and start solving ciphers.
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-8 mt-10 lg:grid-cols-2">
            <form onSubmit={login} className="space-y-4 bg-[#060b13]/90 rounded-3xl border border-cyan-500/20 p-6">
              <h2 className="text-xl font-bold text-white">Login</h2>
              <input
                name="email"
                placeholder="Email"
                className="w-full bg-black/70 border border-cyan-500/30 p-3 rounded-xl text-white placeholder-cyan-400"
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full bg-black/70 border border-cyan-500/30 p-3 rounded-xl text-white placeholder-cyan-400"
              />

              <button className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400">
                LOGIN
              </button>
            </form>

            <form onSubmit={signUp} className="space-y-4 bg-[#060b13]/90 rounded-3xl border border-purple-500/20 p-6">
              <h2 className="text-xl font-bold text-white">Register</h2>
              <input
                name="username"
                placeholder="Username"
                className="w-full bg-black/70 border border-purple-500/30 p-3 rounded-xl text-white placeholder-purple-400"
              />

              <input
                name="email"
                placeholder="Email"
                className="w-full bg-black/70 border border-purple-500/30 p-3 rounded-xl text-white placeholder-purple-400"
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full bg-black/70 border border-purple-500/30 p-3 rounded-xl text-white placeholder-purple-400"
              />

              <button
                disabled={loading}
                className="w-full rounded-xl bg-purple-500 py-3 font-semibold text-black transition hover:bg-purple-400 disabled:opacity-60"
              >
                REGISTER
              </button>
            </form>
          </div>

          <form onSubmit={resetPassword} className="space-y-4 mt-10 border-t border-cyan-500/20 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Forgot Password?</h3>
                <p className="text-cyan-300/80 text-sm">
                  Send a reset email to recover your account.
                </p>
              </div>
            </div>

            <input
              name="resetEmail"
              placeholder="Email"
              className="w-full bg-black/70 border border-cyan-500/30 p-3 rounded-xl text-white placeholder-cyan-400"
            />
            <button className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400">
              SEND RESET EMAIL
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
