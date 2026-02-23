import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 1. CARREGAR TAREFAS APENAS DO USUÁRIO LOGADO
export const loadTasks = async (userId) => {
  if (!userId) return []

  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('user_id', userId) // Filtra pelo dono
    .order('data', { ascending: true })
  
  if (error) {
    console.error('Erro ao carregar tarefas:', error)
    return []
  }
  return data
}

// 2. SALVAR NOVA TAREFA VINCULADA AO USUÁRIO
export const saveTask = async (novaTarefa, userId) => {
  if (!userId) return null

  const { data, error } = await supabase
    .from('tarefas')
    .insert([{ ...novaTarefa, user_id: userId }]) // Insere o ID do usuário
  
  if (error) console.error('Erro ao salvar:', error)
  return data
}

// 3. ATUALIZAR STATUS (Segurança extra: verifica se a tarefa é do usuário)
export const updateTaskStatus = async (id, concluida, userId) => {
  if (!userId) return

  const { error } = await supabase
    .from('tarefas')
    .update({ concluida })
    .eq('id', id)
    .eq('user_id', userId) // Garante que só o dono atualiza
  
  if (error) console.error('Erro ao atualizar:', error)
}

// 4. EXCLUIR TAREFA (Segurança extra: verifica se a tarefa é do usuário)
export const deleteTask = async (id, userId) => {
  if (!userId) return

  const { error } = await supabase
    .from('tarefas')
    .delete()
    .eq('id', id)
    .eq('user_id', userId) // Garante que só o dono deleta
  
  if (error) console.error('Erro ao eliminar:', error)
}
