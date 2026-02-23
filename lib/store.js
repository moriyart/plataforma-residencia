import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 1. CARREGAR TAREFAS (Usa a coluna user_id do banco)
export const loadTasks = async (userId) => {
  if (!userId) return []

  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .eq('user_id', userId) // <-- 'user_id' é o nome da coluna no Supabase
    .order('data', { ascending: true })
  
  if (error) {
    console.error('Erro ao carregar tarefas:', error)
    return []
  }
  return data
}

// 2. SALVAR TAREFA (Mapeia o userId do código para a coluna user_id do banco)
export const saveTask = async (novaTarefa, userId) => {
  if (!userId) {
    console.error("Não foi possível salvar: ID do usuário ausente.")
    return null
  }

  const { data, error } = await supabase
    .from('tarefas')
    .insert([{ 
      ...novaTarefa, 
      user_id: userId // <-- Mapeamento correto aqui
    }])
  
  if (error) {
    console.error('Erro ao salvar no Supabase:', error.message)
    return null
  }
  return data
}

// 3. ATUALIZAR STATUS
export const updateTaskStatus = async (id, concluida, userId) => {
  if (!userId) return

  const { error } = await supabase
    .from('tarefas')
    .update({ concluida })
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) console.error('Erro ao atualizar:', error.message)
}

// 4. EXCLUIR TAREFA
export const deleteTask = async (id, userId) => {
  if (!userId) return

  const { error } = await supabase
    .from('tarefas')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) console.error('Erro ao eliminar:', error.message)
}
