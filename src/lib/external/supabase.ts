import { createClient } from '@supabase/supabase-js'

export const useSupabaseConfig = () => {
  const config = useRuntimeConfig()
  
  return createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )
} 