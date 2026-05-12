import { createServerSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
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

  const { data, error } = await supabase
    .from('challenges')
    .select('id,title,cipher_type,points,difficulty,active')
    .order('points', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ challenges: data })
}

export async function POST(req: Request) {
  if (!serviceRole) {
    return NextResponse.json({ error: 'Missing service role' }, { status: 500 })
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

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRole,
    { auth: { persistSession: false } }
  )

  const {
    action,
    challengeId,
    title,
    description,
    cipher_type,
    ciphertext,
    solution,
    points,
    difficulty,
    hints,
    tags,
    active,
  } = body

  if (action === 'toggle-active') {
    const { error } = await client
      .from('challenges')
      .update({ active })
      .eq('id', challengeId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  }

  if (action === 'delete-challenge') {
    const { error } = await client.from('challenges').delete().eq('id', challengeId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'edit-challenge') {
    const payload: any = {
      title,
      description,
      cipher_type,
      ciphertext,
      solution,
      points,
      difficulty,
      hints,
      active,
    }

    if (tags !== undefined) {
      payload.tags = tags
    }

    const { error } = await client.from('challenges').update(payload).eq('id', challengeId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  }

  if (action === 'create-challenge') {
    const { error } = await client.from('challenges').insert({
      title,
      description,
      cipher_type,
      ciphertext,
      solution,
      points,
      difficulty,
      hints,
      tags,
      active: active ?? true,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
