export const ADMIN_EMAILS = ['mbm143105@gmail.com', 'pepsi0man2345@gmail.com']

export function normalizeEmail(email?: string | null) {
  return String(email ?? '').trim().toLowerCase()
}

export function isAdminEmail(email?: string | null) {
  return ADMIN_EMAILS.includes(normalizeEmail(email))
}
