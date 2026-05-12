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

  const { action, userId, role, banned } = body
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  const logAction = async (details: object) => {
    await service.from('security_logs').insert({
      user_id: user.id,
      action: `admin:user:${action}`,
      details: JSON.stringify({ target: userId, ...details }),
      ip_address: ip,
    })
  }

  if (action === 'toggle-role') {
    const targetRole = role === 'admin' ? 'user' : 'admin'
    const { error } = await service.from('user_roles').upsert({ user_id: userId, role: targetRole })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAction({ role: targetRole })
    return NextResponse.json({ success: true, role: targetRole })
  }

  if (action === 'delete-user') {
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot delete the current admin account' }, { status: 400 })
    }

    const { error } = await service.from('profiles').delete().eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await service.from('user_roles').delete().eq('user_id', userId)
    await service.from('submissions').delete().eq('user_id', userId)
    await service.from('challenge_attempts').delete().eq('user_id', userId)
    await logAction({ deleted: true })

    return NextResponse.json({ success: true })
  }

  if (action === 'ban-user') {
    const { error } = await service.from('profiles').update({ banned: !!banned }).eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAction({ banned })
    return NextResponse.json({ success: true, banned })
  }

  if (action === 'reset-points') {
    const { error } = await service.from('profiles').update({ points: 0 }).eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAction({ resetPoints: true })
    return NextResponse.json({ success: true })
  }

  if (action === 'reset-progress') {
    const { error: deleteSubmissionsError } = await service.from('submissions').delete().eq('user_id', userId)
    const { error: deleteAttemptsError } = await service.from('challenge_attempts').delete().eq('user_id', userId)
    const { error: resetPointsError } = await service.from('profiles').update({ points: 0 }).eq('id', userId)

    if (deleteSubmissionsError || deleteAttemptsError || resetPointsError) {
      return NextResponse.json({ error: (deleteSubmissionsError || deleteAttemptsError || resetPointsError)?.message || 'Failed to reset progress' }, { status: 500 })
    }

    await logAction({ resetProgress: true })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
