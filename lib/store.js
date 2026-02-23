import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// FUNÇÃO PARA CARREGAR TAREFAS DO BANCO
export const loadTasks = async () => {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .order('data', { ascending: true })
  
  if (error) {
    console.error('Erro ao carregar tarefas:', error)
    return []
  }
  return data
}

// FUNÇÃO PARA SALVAR UMA NOVA TAREFA
export const saveTask = async (novaTarefa) => {
  const { data, error } = await supabase
    .from('tarefas')
    .insert([novaTarefa])
  
  if (error) console.error('Erro ao salvar:', error)
  return data
}

// FUNÇÃO PARA ATUALIZAR STATUS (CONCLUÍDA)
export const updateTaskStatus = async (id, concluida) => {
  const { error } = await supabase
    .from('tarefas')
    .update({ concluida })
    .eq('id', id)
  
  if (error) console.error('Erro ao atualizar:', error)
}

// FUNÇÃO PARA EXCLUIR
export const deleteTask = async (id) => {
  const { error } = await supabase
    .from('tarefas')
    .delete()
    .eq('id', id)
  
  if (error) console.error('Erro ao eliminar:', error)
}