import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeEmail, isAdminEmail } from '@/lib/admin'

const ADMIN_ACCOUNTS = [
  {
    email: 'mbm143105@gmail.com',
    username: 'goated-admin',
    password: 'Algaha.saudi507',
  },
  {
    email: 'pepsi0man2345@gmail.com',
    username: 'Goated-admin',
    password: 'Algaha.saudi507',
  },
]

async function ensureAdminAccounts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  const adminAuth = (adminClient.auth.admin as any)

  const { data: userList, error: listError } = await adminAuth.listUsers({ limit: 100 })
  if (listError) {
    return
  }

  for (const account of ADMIN_ACCOUNTS) {
    let user = userList?.users?.find((entry: any) => normalizeEmail(entry.email) === account.email)

    if (!user) {
      const { data: createData, error: createError } = await adminAuth.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: { username: account.username },
      })

      if (createError || !createData?.user) {
        continue
      }

      user = createData.user
    }

    if (!user?.id) {
      continue
    }

    const { data: profile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      await adminClient.from('profiles').insert({
        id: user.id,
        username: account.username,
        points: 0,
        avatar: null,
      })
    }

    await adminClient.from('user_roles').upsert({
      user_id: user.id,
      role: 'admin',
    })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const next = searchParams.get('next') ?? '/dashboard'

  let responseCookies: Array<{ name: string; value: string; options?: any }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          responseCookies = cookiesToSet
        },
      },
    }
  )

  let sessionResult: any = null
  let error: any = null

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code)
    sessionResult = result.data
    error = result.error
  } else if (accessToken && refreshToken) {
    const result = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    sessionResult = result.data
    error = result.error
  }

  if (!error && sessionResult?.session) {
    await ensureAdminAccounts()

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const redirectPath = isAdminEmail(sessionResult?.user?.email) ? '/admin' : next
    const redirectUrl = isLocalEnv
      ? `${origin}${redirectPath}`
      : forwardedHost
      ? `https://${forwardedHost}${redirectPath}`
      : `${origin}${redirectPath}`

    const redirectResponse = NextResponse.redirect(redirectUrl)
    responseCookies.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options)
    })
    return redirectResponse
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}