import { createClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { NextResponse } from 'next/server'

const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

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

  const { data, error } = await supabase.from('admin_settings').select('key,value')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data || [] })
}

export async function POST(req: Request) {
  if (!serviceRole) {
    return NextResponse.json({ error: 'Missing server role key' }, { status: 500 })
  }

  const body = await req.json()
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

  if (body.action === 'save-settings' && body.settings) {
    const entries = Object.entries(body.settings) as Array<[string, string]>
    for (const [key, value] of entries) {
      const { error } = await service.from('admin_settings').upsert({ key, value })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    await service.from('security_logs').insert({
      user_id: user.id,
      action: 'admin:save-settings',
      details: JSON.stringify(body.settings),
      ip_address: ip,
    })

    return NextResponse.json({ success: true, settings: body.settings })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
