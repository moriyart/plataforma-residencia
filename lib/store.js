import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const getSupabaseClient = (supabaseToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseToken}`,
      },
    },
  })
}

export const loadTasks = async (userId, supabaseToken) => {
  if (!userId || !supabaseToken) return []
  const supabase = getSupabaseClient(supabaseToken)
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: true })
  
  if (error) return []
  return data
}

export const saveTask = async (novaTarefa, userId, supabaseToken) => {
  if (!userId || !supabaseToken) return null
  const supabase = getSupabaseClient(supabaseToken)
  const { data, error } = await supabase
    .from('tarefas')
    .insert([{ ...novaTarefa, user_id: userId }])
    .select()
  
  if (error) return null
  return data
}

export const updateTaskStatus = async (id, concluida, userId, supabaseToken) => {
  const supabase = getSupabaseClient(supabaseToken)
  await supabase.from('tarefas').update({ concluida }).eq('id', id).eq('user_id', userId)
}

export const deleteTask = async (id, userId, supabaseToken) => {
  const supabase = getSupabaseClient(supabaseToken)
  await supabase.from('tarefas').delete().eq('id', id).eq('user_id', userId)
}
