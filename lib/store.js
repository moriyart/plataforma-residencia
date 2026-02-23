import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Função principal para conectar ao Supabase usando o "crachá" do Clerk
const getSupabaseClient = (supabaseToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseToken}`,
      },
    },
  })
}

// 1. CARREGAR TAREFAS
export const loadTasks = async (userId, supabaseToken) => {
  if (!userId || !supabaseToken) return []
  
  const supabase = getSupabaseClient(supabaseToken)
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: true })
  
  if (error) {
    console.error('Erro ao carregar:', error.message)
    return []
  }
  return data
}

// 2. SALVAR TAREFA
export const saveTask = async (novaTarefa, userId, supabaseToken) => {
  if (!userId || !supabaseToken) return null

  const supabase = getSupabaseClient(supabaseToken)
  const { data, error } = await supabase
    .from('tarefas')
    .insert([{ ...novaTarefa, user_id: userId }])
  
  if (error) {
    console.error('Erro ao salvar:', error.message)
    return null
  }
  return data
}

// 3. ATUALIZAR STATUS
export const updateTaskStatus = async (id, concluida, userId, supabaseToken) => {
  if (!userId || !supabaseToken) return

  const supabase = getSupabaseClient(supabaseToken)
  const { error } = await supabase
    .from('tarefas')
    .update({ concluida })
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) console.error('Erro ao atualizar:', error.message)
}

// 4. EXCLUIR TAREFA
export const deleteTask = async (id, userId, supabaseToken) => {
  if (!userId || !supabaseToken) return

  const supabase = getSupabaseClient(supabaseToken)
  const { error } = await supabase
    .from('tarefas')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) console.error('Erro ao eliminar:', error.message)
}
