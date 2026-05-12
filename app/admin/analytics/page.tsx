import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";
import { AdminAnalyticsPanel } from "@/components/admin-analytics-panel";

export default async function AdminAnalyticsPage() {
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
    { count: totalSubmissions },
    { count: correctSubmissions },
    { data: challengeStats },
    { data: userActivity },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('submissions').select('id', { count: 'exact', head: true }),
    supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('correct', true),
    supabase.from('challenges').select('id, difficulty, points, active'),
    supabase.from('profiles').select('id, last_login, created_at'),
  ])

  const totalSubmissionsValue = totalSubmissions ?? 0
  const correctSubmissionsValue = correctSubmissions ?? 0
  const solveRate = totalSubmissionsValue > 0 ? (correctSubmissionsValue / totalSubmissionsValue) * 100 : 0

  const difficultyStats = challengeStats?.reduce((acc: any, ch: any) => {
    acc[ch.difficulty] = (acc[ch.difficulty] || 0) + 1
    return acc
  }, {})

  const activeUsers = userActivity?.filter((u: any) => {
    const lastLogin = new Date(u.last_login || u.created_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return lastLogin > weekAgo
  }).length

  const analytics = {
    totalUsers: totalUsers ?? 0,
    totalSubmissions: totalSubmissions ?? 0,
    correctSubmissions: correctSubmissions ?? 0,
    solveRate: solveRate.toFixed(2),
    difficultyStats,
    activeUsers: activeUsers ?? 0,
  }

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70 font-medium">
          administration
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white glow mt-2">
          ANALYTICS
        </h1>
        <p className="text-cyan-300/80 text-lg mt-4">
          Platform statistics and performance metrics
        </p>
      </div>

      <AdminAnalyticsPanel initialData={analytics} />
    </div>
  );
}