import { createClient } from '@supabase/supabase-js'

function getSupabaseAdminConfig() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl =
    typeof rawUrl === 'string'
      ? rawUrl.trim().replace(/^["']|["']$/g, '')
      : ''
  const serviceRoleKey =
    typeof rawKey === 'string' ? rawKey.trim().replace(/^["']|["']$/g, '') : ''

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin env: set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env'
    )
  }

  const validUrl =
    supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')
  if (!validUrl) {
    throw new Error(
      'Invalid Supabase URL: must be a full URL (e.g. https://xxxx.supabase.co). Check NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL in .env; remove quotes or placeholders.'
    )
  }

  return { supabaseUrl, serviceRoleKey }
}

export function createAdminClient() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig()
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}
