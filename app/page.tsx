"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12">
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-4xl"
      >
        <div className="cyber-card rounded-3xl border border-cyan-500/40 bg-black/80 backdrop-blur-xl p-8 md:p-12">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
                cyberpunk cryptography arena
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight glow">
                CYBERCRYPT
              </h1>
              <p className="max-w-2xl mx-auto text-cyan-200/80 text-lg leading-relaxed">
                Enter the neon arena, decode live challenges, defend your score,
                and climb the leaderboard in a secure Supabase-powered cyberpunk
                competition platform.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
              <Link
                href="/auth"
                className="group relative overflow-hidden rounded-2xl border border-cyan-500/70 bg-cyan-500/10 px-6 py-4 text-center font-semibold text-cyan-100 transition-all hover:border-cyan-300 hover:bg-cyan-500/20 hover:scale-105"
              >
                <span className="relative z-10">Sign in / Register</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
              <Link
                href="/dashboard"
                className="group relative overflow-hidden rounded-2xl border border-purple-500/70 bg-purple-500/10 px-6 py-4 text-center font-semibold text-purple-200 transition-all hover:border-purple-300 hover:bg-purple-500/20 hover:scale-105"
              >
                <span className="relative z-10">Dashboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-8 border-t border-cyan-500/20">
              <Link
                href="/challenges"
                className="group rounded-xl border border-cyan-500/30 bg-white/5 px-4 py-3 text-center text-sm text-cyan-200 transition-all hover:border-cyan-400 hover:bg-cyan-500/10 hover:scale-105"
              >
                <div className="font-semibold">Challenges</div>
                <div className="text-xs opacity-70">Active Ciphers</div>
              </Link>
              <Link
                href="/leaderboard"
                className="group rounded-xl border border-purple-500/30 bg-white/5 px-4 py-3 text-center text-sm text-purple-200 transition-all hover:border-purple-400 hover:bg-purple-500/10 hover:scale-105"
              >
                <div className="font-semibold">Leaderboard</div>
                <div className="text-xs opacity-70">Top Players</div>
              </Link>
              <Link
                href="/profile"
                className="group rounded-xl border border-cyan-500/30 bg-white/5 px-4 py-3 text-center text-sm text-cyan-200 transition-all hover:border-cyan-400 hover:bg-cyan-500/10 hover:scale-105"
              >
                <div className="font-semibold">Profile</div>
                <div className="text-xs opacity-70">Your Stats</div>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
