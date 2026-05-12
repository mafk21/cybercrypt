import { createServerSupabase } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  // Fetch analytics data
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

  return NextResponse.json({
    totalUsers,
    totalSubmissions,
    correctSubmissions,
    solveRate: solveRate.toFixed(2),
    difficultyStats,
    activeUsers,
  })
}