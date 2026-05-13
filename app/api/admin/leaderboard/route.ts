import { createServerSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/admin'
import { NextResponse } from 'next/server'

const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  const supabase = createServerSupabase()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { data: leaderboard, error } = await supabase
    .from('leaderboard_cache')
    .select('user_id,username,points')
    .order('points', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ leaderboard: leaderboard || [] })
}

export async function POST(req: Request) {
  const body = await req.json()

  if (!serviceRole) {
    return NextResponse.json({ error: 'Missing server role key' }, { status: 500 })
  }

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

  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRole,
    { auth: { persistSession: false } }
  )

  const { action, userId, newPoints } = body
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  const logAction = async (details: object) => {
    await service.from('security_logs').insert({
      user_id: user.id,
      action: `admin:leaderboard:${action}`,
      details: JSON.stringify({ target: userId, ...details }),
      ip_address: ip,
    })
  }

  try {
    if (action === 'update_score') {
      const score = Number(newPoints)
      if (!Number.isFinite(score)) {
        return NextResponse.json({ error: 'Invalid score value' }, { status: 400 })
      }

      const { data: profileData, error: profileError } = await service
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      const { error: profileUpdateError } = await service
        .from('profiles')
        .update({ points: score })
        .eq('id', userId)

      if (profileUpdateError) {
        return NextResponse.json({ error: profileUpdateError.message }, { status: 500 })
      }

      const { error: cacheError } = await service.from('leaderboard_cache').upsert(
        {
          user_id: userId,
          username: profileData?.username || 'unknown',
          points: score,
          updated_at: new Date().toISOString(),
        },
        { onConflict: ['user_id'] }
      )

      if (cacheError) {
        return NextResponse.json({ error: cacheError.message }, { status: 500 })
      }

      await logAction({ newPoints: score })
    } else if (action === 'remove_user') {
      const { error: cacheError } = await service.from('leaderboard_cache').delete().eq('user_id', userId)
      if (cacheError) {
        return NextResponse.json({ error: cacheError.message }, { status: 500 })
      }

      await logAction({ removed: true })
    } else if (action === 'recalculate') {
      const { data: users, error: usersError } = await service.from('profiles').select('id,username')
      if (usersError) {
        return NextResponse.json({ error: usersError.message }, { status: 500 })
      }

      for (const u of users || []) {
        const { data: submissions, error: submissionsError } = await service
          .from('submissions')
          .select('points_awarded')
          .eq('user_id', u.id)
          .eq('correct', true)

        if (submissionsError) {
          continue
        }

        const totalPoints = (submissions || []).reduce(
          (sum: number, row: any) => sum + (row.points_awarded || 0),
          0
        )

        const { error: upsertError } = await service.from('leaderboard_cache').upsert(
          {
            user_id: u.id,
            username: u.username || 'unknown',
            points: totalPoints,
            updated_at: new Date().toISOString(),
          },
          { onConflict: ['user_id'] }
        )

        if (upsertError) {
          console.error('Failed to upsert leaderboard cache for user', u.id, upsertError.message)
        }
      }

      await logAction({ recalculated: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/leaderboard] action error', error)
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 })
  }
}
