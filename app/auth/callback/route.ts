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
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      await ensureAdminAccounts()

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const redirectPath = isAdminEmail(sessionData?.user?.email) ? '/admin' : next
      const redirectUrl = isLocalEnv
        ? `${origin}${redirectPath}`
        : forwardedHost
        ? `https://${forwardedHost}${redirectPath}`
        : `${origin}${redirectPath}`

      response = NextResponse.redirect(redirectUrl)
      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}