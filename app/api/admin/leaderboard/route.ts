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
      await service.from('profiles').update({ points: newPoints }).eq('id', userId)
      await logAction({ newPoints })
    } else if (action === 'remove_user') {
      await service.from('profiles').delete().eq('id', userId)
      await logAction({ removed: true })
    } else if (action === 'recalculate') {
      // Recalculate points based on correct submissions
      const { data: users } = await service.from('profiles').select('id')
      for (const u of users || []) {
        const { count } = await service
          .from('submissions')
          .select('points', { count: 'exact', head: true })
          .eq('user_id', u.id)
          .eq('correct', true)
        await service.from('profiles').update({ points: count || 0 }).eq('id', u.id)
      }
      await logAction({ recalculated: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 })
  }
}