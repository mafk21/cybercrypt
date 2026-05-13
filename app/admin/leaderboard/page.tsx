import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";
import { AdminLeaderboardPanel } from "@/components/admin-leaderboard-panel";

export const dynamic = 'force-dynamic';

export default async function AdminLeaderboardPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/404");
  }

  // 🟢 IMPORTANT: using leaderboard VIEW (not profiles)
  const { data: leaderboard, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('points', { ascending: false })
    .limit(100);

  if (error) {
    console.log("Leaderboard error:", error);
  }

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
          administration
        </p>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow mt-2">
          LEADERBOARD CONTROL
        </h1>

        <p className="text-cyan-300/80 text-lg mt-4">
          Manage rankings and user scores
        </p>
      </div>

      <AdminLeaderboardPanel initialData={leaderboard || []} />
    </div>
  );
}