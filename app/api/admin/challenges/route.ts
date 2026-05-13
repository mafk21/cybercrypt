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
    const challengePayload = {
      title,
      description,
      cipher_type,
      ciphertext,
      solution,
      points: Number(points),
      difficulty,
      hints: Array.isArray(hints) ? hints : [],
      tags: Array.isArray(tags) ? tags : [],
      active: active === undefined ? true : active === true || active === 'true',
    }

    if (
      !challengePayload.title ||
      !challengePayload.description ||
      !challengePayload.cipher_type ||
      !challengePayload.ciphertext ||
      !challengePayload.solution ||
      !Number.isFinite(challengePayload.points) ||
      !challengePayload.difficulty
    ) {
      return NextResponse.json({ error: 'Missing required challenge fields' }, { status: 400 })
    }

    console.log('[admin/challenges] create challenge payload', challengePayload)

    const { data: insertedChallenges, error: insertError } = await client
      .from('challenges')
      .insert(challengePayload)
      .select('id,title,cipher_type,points,difficulty,active,tags,hints')

    console.log('[admin/challenges] create challenge result', { insertedChallenges, insertError })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    if (!insertedChallenges || insertedChallenges.length === 0) {
      return NextResponse.json({ error: 'Challenge insertion returned no result' }, { status: 500 })
    }

    return NextResponse.json({ success: true, challenge: insertedChallenges[0] })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
