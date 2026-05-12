import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/404");
  }

  const [
    { count: totalUsers },
    { count: admins },
    { count: activeChallenges },
    { count: totalSolves },
    { data: settings },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("challenges").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("submissions").select("id", { count: "exact", head: true }).eq("correct", true),
    supabase.from("admin_settings").select("key,value"),
  ]);

  const settingsMap = (settings || []).reduce<Record<string, string>>((acc, item: any) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  const submissionsLocked = settingsMap["submissions_locked"] === "true";
  const announcement = settingsMap["announcement"] || "No live announcements.";

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
          administrator access
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow mt-2">
          ADMIN DASHBOARD
        </h1>
        <p className="text-cyan-300/80 text-lg mt-4">
          Live platform metrics, challenge operations, and secure controls.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="cyber-card rounded-3xl border border-cyan-500/20 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">Players</p>
          <p className="mt-4 text-5xl font-bold text-white">{totalUsers ?? 0}</p>
          <p className="mt-2 text-cyan-300/80 text-sm">Active profiles registered</p>
        </div>

        <div className="cyber-card rounded-3xl border border-purple-500/20 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-purple-300/70">Admins</p>
          <p className="mt-4 text-5xl font-bold text-white">{admins ?? 0}</p>
          <p className="mt-2 text-purple-300/80 text-sm">Administrative accounts</p>
        </div>

        <div className="cyber-card rounded-3xl border border-green-500/20 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-green-300/70">Challenges</p>
          <p className="mt-4 text-5xl font-bold text-white">{activeChallenges ?? 0}</p>
          <p className="mt-2 text-green-300/80 text-sm">Live puzzles currently available</p>
        </div>

        <div className="cyber-card rounded-3xl border border-orange-500/20 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-orange-300/70">Solves</p>
          <p className="mt-4 text-5xl font-bold text-white">{totalSolves ?? 0}</p>
          <p className="mt-2 text-orange-300/80 text-sm">Correct submissions since launch</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="cyber-card rounded-3xl border border-slate-700/50 p-8 bg-slate-950/40">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">Announcement</p>
          <p className="mt-4 text-white text-base leading-7">{announcement}</p>
        </div>
        <div className="cyber-card rounded-3xl border border-red-500/20 p-8 bg-slate-950/40">
          <p className="text-sm uppercase tracking-[0.35em] text-orange-300/70">Submission Lock</p>
          <p className="mt-4 text-3xl font-bold text-white">{submissionsLocked ? 'PAUSED' : 'OPEN'}</p>
          <p className="mt-2 text-orange-300/80 text-sm">Real-time platform submission control.</p>
        </div>
        <div className="cyber-card rounded-3xl border border-cyan-500/20 p-8 bg-slate-950/40">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">Quick Actions</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/admin/users" className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white text-center hover:bg-cyan-500 transition-colors">Manage Users</Link>
            <Link href="/admin/challenges" className="rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white text-center hover:bg-purple-500 transition-colors">Manage Challenges</Link>
            <Link href="/admin/analytics" className="rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white text-center hover:bg-green-500 transition-colors">View Analytics</Link>
            <Link href="/admin/leaderboard" className="rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white text-center hover:bg-orange-500 transition-colors">Leaderboard Control</Link>
            <Link href="/admin/logs" className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white text-center hover:bg-red-500 transition-colors">Security Logs</Link>
            <Link href="/admin/settings" className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white text-center hover:bg-sky-400 transition-colors">Platform Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
