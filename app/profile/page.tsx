import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";

export default async function ProfilePage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [profileResult, solvedResult, attemptsResult] = await Promise.all([
    supabase.from("profiles").select("id,username,avatar,points,created_at").eq("id", user.id).single(),
    supabase.from("submissions").select("id", { count: "exact" }).eq("user_id", user.id).eq("correct", true),
    supabase.from("challenge_attempts").select("id", { count: "exact" }).eq("user_id", user.id)
  ]);

  const profile = profileResult.data;
  const solvedCount = solvedResult.count ?? 0;
  const attemptsCount = attemptsResult.count ?? 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
          user profile
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow mt-2">
          PROFILE
        </h1>
        <p className="text-cyan-300/80 text-lg mt-4">
          Your cryptography competition stats and account information
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Stats Section */}
        <div className="space-y-8">
          <div className="cyber-card rounded-2xl border border-cyan-500/20 p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium mb-2">
                  Player Info
                </p>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profile?.username || user.email}
                </h2>
                <p className="text-cyan-300/80">
                  {user.email}
                </p>
              </div>

              <div className="border-t border-cyan-500/20 pt-6">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium mb-4">
                  Statistics
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
                    <p className="text-sm text-purple-300/70">Total Points</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">{profile?.points ?? 0}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                    <p className="text-sm text-cyan-300/70">Solved</p>
                    <p className="text-3xl font-bold text-cyan-400 mt-2">{solvedCount}</p>
                  </div>
                  <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
                    <p className="text-sm text-orange-300/70">Attempts</p>
                    <p className="text-3xl font-bold text-orange-400 mt-2">{attemptsCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="cyber-card rounded-2xl border border-cyan-500/20 p-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-400/70 font-medium">Member Since</p>
              <p className="text-sm font-medium text-white mt-2">
                {new Date(profile?.created_at || user.created_at || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-400/70 font-medium">Rank</p>
              <p className="text-sm font-medium text-cyan-400 mt-2">Hacker</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-400/70 font-medium">Status</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-green-400">Active</p>
              </div>
            </div>
          </div>

          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
