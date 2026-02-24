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

  const [filtroAtivo, setFiltroAtivo] = useState("todos");

  const [loading, setLoading] = useState(true);



  const getSupabaseToken = async () => {

    return await session?.getToken({ template: "supabase" });

  };



  useEffect(() => {

    async function fetchData() {

      if (isLoaded && user && session) {

        const token = await getSupabaseToken();

        const dados = await loadTasks(user.id, token);

        setTarefas(dados);

        setLoading(false);

      } else if (isLoaded && !user) {

        setLoading(false);

      }

    }

    fetchData();

  }, [user, isLoaded, session]);



  async function adicionarTarefa() {

    if (!titulo || !data || !user) return;

    const token = await getSupabaseToken();

    const nova = { titulo, data, tipo, prioridade, concluida: false };

    

    await saveTask(nova, user.id, token);

    const dadosAtualizados = await loadTasks(user.id, token); 

    setTarefas(dadosAtualizados);

    

    setTitulo("");

    setData("");

  }



  async function toggleTarefa(id, statusAtual) {

    if (!user) return;

    const token = await getSupabaseToken();

    await updateTaskStatus(id, !statusAtual, user.id, token);

    setTarefas(tarefas.map(t => t.id === id ? { ...t, concluida: !statusAtual } : t));

  }



  async function excluirTarefa(id) {

    if (!user) return;

    if (confirm("Apagar esta tarefa?")) {

      const token = await getSupabaseToken();

      await deleteTask(id, user.id, token);

      setTarefas(tarefas.filter(t => t.id !== id));

    }

  }



  const tarefasFiltradas = tarefas.filter(t => {

    if (filtroAtivo === "todos") return true;

    return t.tipo === filtroAtivo;

  });



  // Separação das tarefas por categoria para a listagem organizada

  const tarefasTeoria = tarefasFiltradas.filter(t => t.tipo === 'teoria');

  const tarefasExercicio = tarefasFiltradas.filter(t => t.tipo === 'exercicio');



  if (!isLoaded || loading) return <div className="p-20 text-center font-bold text-slate-400">Carregando seu cronograma...</div>;

  if (!user) return <div className="p-20 text-center font-bold text-slate-400">Por favor, faça login para acessar.</div>;



  return (

    <div className="max-w-4xl mx-auto p-4 md:p-8">

      <header className="mb-10">

        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Cronograma</h1>

        <p className="text-slate-500 font-medium italic">Olá, {user.firstName}! Organize seus ciclos de estudo 🧠</p>

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



      {/* FILTROS RÁPIDOS */}

      <div className="flex gap-2 mb-10 bg-slate-100 p-1.5 rounded-2xl w-fit">

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



      {/* LISTAGEM ORGANIZADA */}

      <div className="space-y-12">

        

        {/* SEÇÃO: TEORIA */}

        {(filtroAtivo === "todos" || filtroAtivo === "teoria") && (

          <section>

            <div className="flex items-center gap-3 mb-6">

              <div className="bg-violet-100 p-2 rounded-xl text-violet-600 font-bold text-xl">📖</div>

              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Ciclo de Teoria</h2>

            </div>

            <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-4">

              {tarefasTeoria.length === 0 ? (

                <p className="text-slate-400 py-4 italic text-sm">Nenhum estudo teórico encontrado.</p>

              ) : (

                tarefasTeoria.map((t) => (

                  <TarefaCard key={t.id} t={t} onToggle={toggleTarefa} onDelete={excluirTarefa} />

                ))

              )}

            </div>

          </section>

        )}



        {/* SEÇÃO: EXERCÍCIOS */}

        {(filtroAtivo === "todos" || filtroAtivo === "exercicio") && (

          <section>

            <div className="flex items-center gap-3 mb-6">

              <div className="bg-blue-100 p-2 rounded-xl text-blue-600 font-bold text-xl">✍️</div>

              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Prática e Exercícios</h2>

            </div>

            <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-4">

              {tarefasExercicio.length === 0 ? (

                <p className="text-slate-400 py-4 italic text-sm">Nenhum exercício agendado.</p>

              ) : (

                tarefasExercicio.map((t) => (

                  <TarefaCard key={t.id} t={t} onToggle={toggleTarefa} onDelete={excluirTarefa} />

                ))

              )}

            </div>

          </section>

        )}



      </div>

    </div>

  );

}



// COMPONENTE DE CARD REUTILIZÁVEL

function TarefaCard({ t, onToggle, onDelete }) {

  return (

    <div className="relative group">

      <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white shadow-sm 

        ${t.prioridade === 'alta' ? 'bg-red-500' : t.prioridade === 'baixa' ? 'bg-blue-400' : 'bg-yellow-400'}`}>

      </div>

      

      <div className={`flex items-center justify-between bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all ${t.concluida ? 'opacity-50' : ''}`}>

        <div className="flex items-center gap-5">

          <button 

            onClick={() => onToggle(t.id, t.concluida)}

            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${

              t.concluida ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200"

            }`}

          >

            {t.concluida && <span className="text-sm">✓</span>}

          </button>



          <div className="flex flex-col">

            <span className={`text-lg font-bold ${t.concluida ? "line-through text-slate-300" : "text-slate-700"}`}>

              {t.titulo}

            </span>

            <div className="flex items-center gap-3 mt-1">

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">

                📅 {new Date(t.data + "T00:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}

              </span>

              <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${

                t.prioridade === 'alta' ? 'border-red-100 text-red-400' : 'border-slate-100 text-slate-400'

              } uppercase`}>

                {t.prioridade}

              </span>

            </div>

          </div>

        </div>



        <button onClick={() => onDelete(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2 transition-all">

          🗑️

        </button>

      </div>

    </div>

  );

}
