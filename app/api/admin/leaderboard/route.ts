import { createServerSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/admin'
import { NextResponse } from 'next/server'

const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

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

      const { error } = await service.from('profiles').update({ points: score }).eq('id', userId)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      await logAction({ newPoints: score })
    } else if (action === 'remove_user') {
      const { error: deleteSubmissionsError } = await service.from('submissions').delete().eq('user_id', userId)
      const { error: deleteAttemptsError } = await service.from('challenge_attempts').delete().eq('user_id', userId)
      const { error: deleteRolesError } = await service.from('user_roles').delete().eq('user_id', userId)
      const { error: deleteProfileError } = await service.from('profiles').delete().eq('id', userId)

      if (deleteSubmissionsError || deleteAttemptsError || deleteRolesError || deleteProfileError) {
        return NextResponse.json({ error: (deleteSubmissionsError || deleteAttemptsError || deleteRolesError || deleteProfileError)?.message || 'Failed to remove user' }, { status: 500 })
      }

      await logAction({ removed: true })
    } else if (action === 'recalculate') {
      const { data: users, error: usersError } = await service.from('profiles').select('id')
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

        const totalPoints = (submissions || []).reduce((sum: number, row: any) => sum + (row.points_awarded || 0), 0)
        await service.from('profiles').update({ points: totalPoints }).eq('id', u.id)
      }

      await logAction({ recalculated: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/leaderboard] action error', error)
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 })
  }
}