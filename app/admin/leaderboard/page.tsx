import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";
import { AdminLeaderboardPanel } from "@/components/admin-leaderboard-panel";

export const dynamic = 'force-dynamic';

export default async function AdminLeaderboardPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  if (!isAdminEmail(user.email)) {
    redirect('/404');
  }

  const { data: leaderboard, error } = await supabase
    .from('leaderboard_cache')
    .select('user_id,username,points')
    .order('points', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[admin/leaderboard/page] leaderboard_cache fetch failed', error.message);
  }

  return (
    <main className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Admin Leaderboard</h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Manage the cached leaderboard, edit individual score entries, and refresh rankings.
        </p>
      </div>

      <AdminLeaderboardPanel initialData={leaderboard || []} />
    </main>
  );
}
