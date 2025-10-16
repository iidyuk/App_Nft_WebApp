export default defineNuxtRouteMiddleware(async (to, from) => {
  // クライアントサイドでのみ実行
  if (process.server) return
  
  const { createClient } = await import('@supabase/supabase-js')
  const config = useRuntimeConfig()
  
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )
  
  // 現在のセッションを取得
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // セッションが存在しない場合、ログインページにリダイレクト
  if (!session || error) {
    return navigateTo('/auth/signin')
  }
})