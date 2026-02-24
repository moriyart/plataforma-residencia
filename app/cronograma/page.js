"use client";

import { useState, useEffect } from "react";
import { loadTasks, saveTask, updateTaskStatus, deleteTask } from "@/lib/store";
import { useUser, useSession } from "@clerk/nextjs";

export default function Cronograma() {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const [tarefas, setTarefas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState("teoria");
  const [prioridade, setPrioridade] = useState("media");
  const [loading, setLoading] = useState(true);

  const getSupabaseToken = async () => await session?.getToken({ template: "supabase" });

  useEffect(() => {
    async function fetchData() {
      if (isLoaded && user && session) {
        const token = await getSupabaseToken();
        const dados = await loadTasks(user.id, token);
        setTarefas(dados);
        setLoading(false);
      } else if (isLoaded && !user) setLoading(false);
    }
    fetchData();
  }, [user, isLoaded, session]);

  async function adicionarTarefa() {
    if (!titulo || !data || !user) return;
    const token = await getSupabaseToken();
    const nova = { titulo, data, tipo, prioridade, concluida: false };
    await saveTask(nova, user.id, token);
    setTarefas(await loadTasks(user.id, token));
    setTitulo("");
    setData("");
  }

  async function toggleTarefa(id, statusAtual) {
    const token = await getSupabaseToken();
    await updateTaskStatus(id, !statusAtual, user.id, token);
    setTarefas(tarefas.map(t => t.id === id ? { ...t, concluida: !statusAtual } : t));
  }

  async function excluirTarefa(id) {
    if (!confirm("Apagar esta tarefa?")) return;
    const token = await getSupabaseToken();
    await deleteTask(id, user.id, token);
    setTarefas(tarefas.filter(t => t.id !== id));
  }

  if (!isLoaded || loading) return <div className="p-20 text-center font-bold text-slate-400">Carregando cronograma...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Cronograma</h1>
        <p className="text-slate-500 font-medium">Olá, {user?.firstName}! Suas tarefas estão aqui.</p>
      </header>

      {/* FORMULÁRIO */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col gap-4">
          <input 
            placeholder="O que vamos estudar hoje?" 
            value={titulo} 
            onChange={e => setTitulo(e.target.value)}
            className="w-full bg-slate-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="date" value={data} onChange={e => setData(e.target.value)} className="bg-slate-50 p-4 rounded-2xl outline-none" />
            <select value={tipo} onChange={e => setTipo(e.target.value)} className="bg-slate-50 p-4 rounded-2xl outline-none">
              <option value="teoria">📖 Teoria</option>
              <option value="exercicio">✍️ Exercício</option>
            </select>
            <select value={prioridade} onChange={e => setPrioridade(e.target.value)} className="bg-slate-50 p-4 rounded-2xl outline-none">
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🔵 Baixa</option>
            </select>
            <button onClick={adicionarTarefa} className="bg-violet-600 text-white p-4 rounded-2xl font-bold hover:bg-violet-700">
              Agendar
            </button>
          </div>
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-6">
        {tarefas.length === 0 ? (
          <p className="text-slate-400 font-medium py-10">Nenhuma tarefa encontrada.</p>
        ) : (
          tarefas.map((t) => (
            <div key={t.id} className="relative group">
              <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white shadow-sm 
                ${t.prioridade === 'alta' ? 'bg-red-500' : t.prioridade === 'baixa' ? 'bg-blue-400' : 'bg-yellow-400'}`}>
              </div>
              <div className={`flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all ${t.concluida ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => toggleTarefa(t.id, t.concluida)}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                      t.concluida ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200"
                    }`}
                  >
                    {t.concluida && "✓"}
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold ${t.concluida ? "line-through text-slate-300" : "text-slate-700"}`}>
                      {t.titulo}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      📅 {new Date(t.data + "T00:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
                <button onClick={() => excluirTarefa(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2">
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
