"use client";

import { useState, useEffect } from "react";
import { loadTasks, saveTask, updateTaskStatus, deleteTask } from "@/lib/store";
import { useUser, useSession } from "@clerk/nextjs";

const MATERIAS = [
  "Biossegurança", "Coleta de Material", "Qualidade Laboratorial", 
  "Imunologia Clínica", "Hematologia Clínica", "Bioquímica Clínica", 
  "Líquidos Cavitários", "Parasitologia Clínica", "Bacteriologia Clínica", "Uroanálise"
];

export default function Cronograma() {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const [tarefas, setTarefas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [materia, setMateria] = useState(MATERIAS[0]);
  const [tipo, setTipo] = useState("teoria");
  const [prioridade, setPrioridade] = useState("media");
  const [filtroAtivo, setFiltroAtivo] = useState("todos");
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
    // Adicionamos 'materia' ao objeto da tarefa
    const nova = { titulo, data, tipo, prioridade, materia, concluida: false };
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

  // --- LÓGICA DE FILTROS E ORGANIZAÇÃO ---
  const hoje = new Date().toLocaleDateString('en-CA');
  
  const tarefasFiltradas = tarefas.filter(t => filtroAtivo === "todos" || t.tipo === filtroAtivo);
  
  const teóricas = tarefasFiltradas.filter(t => t.tipo === "teoria");
  const exercícios = tarefasFiltradas.filter(t => t.tipo === "exercicio");

  const calcProgresso = (lista) => {
    if (lista.length === 0) return 0;
    const concluidas = lista.filter(t => t.concluida).length;
    return Math.round((concluidas / lista.length) * 100);
  };

  if (!isLoaded || loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Organizando sua bancada...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Meu Cronograma</h1>
          <p className="text-slate-500 font-medium italic">Foco nos estudos, {user?.firstName}! 🔬</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Geral</p>
          <p className="text-2xl font-black text-violet-600">{calcProgresso(tarefas)}%</p>
        </div>
      </header>

      {/* FORMULÁRIO AVANÇADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              placeholder="O que vamos estudar?" 
              value={titulo} 
              onChange={e => setTitulo(e.target.value)}
              className="flex-1 bg-slate-50 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-violet-400 font-bold text-slate-700"
            />
            <select 
              value={materia} 
              onChange={e => setMateria(e.target.value)}
              className="md:w-64 bg-slate-100 p-5 rounded-2xl outline-none font-bold text-slate-600 cursor-pointer"
            >
              {MATERIAS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="date" value={data} onChange={e => setData(e.target.value)} className="bg-slate-50 p-4 rounded-2xl outline-none text-slate-500 font-bold" />
            <select value={tipo} onChange={e => setTipo(e.target.value)} className="bg-slate-50 p-4 rounded-2xl outline-none text-slate-600 font-bold">
              <option value="teoria">📖 Teoria</option>
              <option value="exercicio">✍️ Exercício</option>
            </select>
            <select value={prioridade} onChange={e => setPrioridade(e.target.value)} className="bg-slate-50 p-4 rounded-2xl outline-none text-slate-600 font-bold">
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Média</option>
              <option value="baixa">🔵 Baixa</option>
            </select>
            <button onClick={adicionarTarefa} className="bg-violet-600 text-white p-4 rounded-2xl font-black hover:bg-violet-700 transition-all shadow-lg shadow-violet-200">
              AGENDAR
            </button>
          </div>
        </div>
      </div>

      {/* FILTROS E PROGRESSO */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          {["todos", "teoria", "exercicio"].map((f) => (
            <button key={f} onClick={() => setFiltroAtivo(f)} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${filtroAtivo === f ? "bg-white text-violet-600 shadow-sm" : "text-slate-500"}`}>
              {f} ({tarefas.filter(t => f === "todos" || t.tipo === f).length})
            </button>
          ))}
        </div>
      </div>

      {/* LISTAGEM POR CICLOS */}
      <div className="grid grid-cols-1 gap-12">
        
        {/* CICLO DE TEORIA */}
        {(filtroAtivo === "todos" || filtroAtivo === "teoria") && (
          <section className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-violet-600 text-white p-2 rounded-lg text-xl shadow-lg shadow-violet-100">📖</div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Ciclo de Teoria</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 block mb-1">PROGRESSO DO CICLO</span>
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-600 transition-all duration-1000" style={{ width: `${calcProgresso(teóricas)}%` }}></div>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {teóricas.length === 0 ? <p className="italic text-slate-400 text-sm p-4">Nenhuma teoria para este filtro.</p> : 
               teóricas.sort((a,b) => a.data.localeCompare(b.data)).map(t => (
                <TarefaCard key={t.id} t={t} onToggle={toggleTarefa} onDelete={excluirTarefa} hoje={hoje} />
              ))}
            </div>
          </section>
        )}

        {/* CICLO DE EXERCÍCIOS */}
        {(filtroAtivo === "todos" || filtroAtivo === "exercicio") && (
          <section className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 text-white p-2 rounded-lg text-xl shadow-lg shadow-emerald-100">✍️</div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Prática e Exercícios</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 block mb-1">PROGRESSO DO CICLO</span>
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${calcProgresso(exercícios)}%` }}></div>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {exercícios.length === 0 ? <p className="italic text-slate-400 text-sm p-4">Nenhum exercício para este filtro.</p> : 
               exercícios.sort((a,b) => a.data.localeCompare(b.data)).map(t => (
                <TarefaCard key={t.id} t={t} onToggle={toggleTarefa} onDelete={excluirTarefa} hoje={hoje} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TarefaCard({ t, onToggle, onDelete, hoje }) {
  const isAtrasada = t.data < hoje && !t.concluida;
  const isHoje = t.data === hoje;

  return (
    <div className={`group relative flex items-center justify-between bg-white p-5 rounded-[2rem] border transition-all hover:shadow-xl ${t.concluida ? 'opacity-50 border-transparent bg-slate-50' : 'border-slate-100 shadow-sm'}`}>
      <div className="flex items-center gap-5">
        <button 
          onClick={() => onToggle(t.id, t.concluida)}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
            t.concluida ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-100" : "bg-white border-slate-200 hover:border-violet-400"
          }`}
        >
          {t.concluida && "✓"}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${t.concluida ? "line-through text-slate-400" : "text-slate-700"}`}>
              {t.titulo}
            </span>
            {isAtrasada && <span className="bg-red-100 text-red-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Atrasada</span>}
            {isHoje && !t.concluida && <span className="bg-violet-100 text-violet-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Hoje</span>}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-tight">
              {t.materia}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              📅 {new Date(t.data + "T00:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
            <div className={`w-2 h-2 rounded-full ${t.prioridade === 'alta' ? 'bg-red-500' : t.prioridade === 'baixa' ? 'bg-blue-400' : 'bg-yellow-400'}`} title={`Prioridade ${t.prioridade}`}></div>
          </div>
        </div>
      </div>

      <button onClick={() => onDelete(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2 transition-all">
        🗑️
      </button>
    </div>
  );
}
