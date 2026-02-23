"use client";

import { useState, useEffect } from "react";
import { loadTasks, saveTask, updateTaskStatus, deleteTask } from "@/lib/store";

export default function Cronograma() {
  const [tarefas, setTarefas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState("teoria");
  const [prioridade, setPrioridade] = useState("media");
  const [filtroAtivo, setFiltroAtivo] = useState("todos");
  const [loading, setLoading] = useState(true);

  // 1. CARREGAR TAREFAS DO BANCO DE DADOS
  useEffect(() => {
    async function fetchData() {
      const dados = await loadTasks();
      setTarefas(dados);
      setLoading(false);
    }
    fetchData();
  }, []);

  // 2. ADICIONAR NO BANCO DE DADOS
  async function adicionarTarefa() {
    if (!titulo || !data) return;
    const nova = { titulo, data, tipo, prioridade, concluida: false };
    
    await saveTask(nova); // Salva na nuvem
    const dadosAtualizados = await loadTasks(); // Recarrega a lista atualizada
    setTarefas(dadosAtualizados);
    
    setTitulo("");
    setData("");
  }

  // 3. ATUALIZAR STATUS NO BANCO
  async function toggleTarefa(id, statusAtual) {
    await updateTaskStatus(id, !statusAtual);
    setTarefas(tarefas.map(t => t.id === id ? { ...t, concluida: !statusAtual } : t));
  }

  // 4. EXCLUIR NO BANCO
  async function excluirTarefa(id) {
    if (confirm("Apagar esta tarefa?")) {
      await deleteTask(id);
      setTarefas(tarefas.filter(t => t.id !== id));
    }
  }

  const tarefasFiltradas = tarefas.filter(t => {
    if (filtroAtivo === "todos") return true;
    return t.tipo === filtroAtivo;
  });

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Carregando seu cronograma...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Cronograma</h1>
        <p className="text-slate-500 font-medium">Sincronizado na nuvem</p>
      </header>

      {/* FORMULÁRIO */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
        <div className="flex flex-col gap-4">
          <input 
            placeholder="O que vamos estudar hoje?" 
            value={titulo} 
            onChange={e => setTitulo(e.target.value)}
            className="w-full bg-slate-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-violet-400 font-medium text-slate-700"
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input 
              type="date" value={data} onChange={e => setData(e.target.value)}
              className="bg-slate-50 p-4 rounded-2xl outline-none text-slate-500 font-medium"
            />
            <select value={tipo} onChange={e => setTipo(e.target.value)} className="bg-slate-50 p-4 rounded-2xl outline-none text-slate-600 font-medium">
              <option value="teoria">📖 Teoria</option>
              <option value="exercicio">✍️ Exercício</option>
            </select>
            <select value={prioridade} onChange={e => setPrioridade(e.target.value)} className="bg-slate-50 p-4 rounded-2xl outline-none text-slate-600 font-medium">
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🔵 Baixa</option>
            </select>
            <button onClick={adicionarTarefa} className="bg-violet-600 text-white p-4 rounded-2xl font-bold hover:bg-violet-700 transition-all">
              Agendar
            </button>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {["todos", "teoria", "exercicio"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltroAtivo(f)}
            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
              filtroAtivo === f ? "bg-white text-violet-600 shadow-sm" : "text-slate-500"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LISTAGEM */}
      <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-6">
        {tarefasFiltradas.length === 0 ? (
          <p className="text-slate-400 font-medium py-10">Nenhuma tarefa encontrada.</p>
        ) : (
          tarefasFiltradas.map((t) => (
            <div key={t.id} className="relative group">
              <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white shadow-sm 
                ${t.prioridade === 'alta' ? 'bg-red-500' : t.prioridade === 'baixa' ? 'bg-blue-400' : 'bg-yellow-400'}`}>
              </div>
              
              <div className={`flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all ${t.concluida ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => toggleTarefa(t.id, t.concluida)}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                      t.concluida ? "bg-green-500 border-green-500" : "bg-white border-slate-200"
                    }`}
                  >
                    {t.concluida && <span className="text-white font-bold text-sm">✓</span>}
                  </button>

                  <div className="flex flex-col">
                    <span className={`text-lg font-bold ${t.concluida ? "line-through text-slate-300" : "text-slate-700"}`}>
                      {t.titulo}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${t.tipo === 'teoria' ? 'bg-violet-50 text-violet-500' : 'bg-blue-50 text-blue-500'}`}>
                        {t.tipo}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        📅 {new Date(t.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={() => excluirTarefa(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2 transition-all">
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