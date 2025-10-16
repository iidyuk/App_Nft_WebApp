import { createClient } from '@supabase/supabase-js'

export const useAuth = () => {
  // Supabaseクライアントの初期化（composable内で実行）
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  // 現在のユーザー状態
  const user = ref(null)
  const loading = ref(true)

  // ユーザー情報の取得
  const getUser = async () => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      if (error) {
        // セッションがない場合は正常な状態として扱う
        if (error.message.includes('Auth session missing')) {
          user.value = null
        } else {
          throw error
        }
      } else {
        user.value = currentUser
      }
    } catch (error) {
      console.error('Error getting user:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // サインアップ（新規アカウント作成）
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      return { data: null, error }
    }
  }

  // サインイン（ログイン）
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      user.value = data.user
      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { data: null, error }
    }
  }

  // サインアウト（ログアウト）
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      
      // ログアウト後にログインページにリダイレクト
      await navigateTo('/auth/signin')
      
      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error }
    }
  }

  // 認証状態の監視
  const initAuth = async () => {
    // 初期ユーザー取得
    await getUser()

    // 認証状態の変更を監視
    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user ?? null
      loading.value = false
      
      // ログアウトイベントが発生した場合、ログインページにリダイレクト
      if (event === 'SIGNED_OUT') {
        await navigateTo('/auth/signin')
      }
    })
  }

  // 認証が必要かどうかのチェック
  const isAuthenticated = computed(() => {
    console.log('isAuthenticated check:', { user: user.value, loading: loading.value })
    return !!user.value && !loading.value
  })

  return {
    user: readonly(user),
    loading: readonly(loading),
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    getUser,
    initAuth
  }
}
