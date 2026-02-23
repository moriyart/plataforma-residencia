"use client";

import { useState, useEffect } from "react";
import { loadTasks } from "@/lib/store";
import { useUser, useSession } from "@clerk/nextjs"; // <--- 1. Importar useSession
import Link from "next/link";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { session } = useSession(); // <--- 2. Ativar a sessão para o token
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // 3. Só buscar se o Clerk carregou, o usuário existe e a sessão está ativa
      if (isLoaded && user && session) {
        try {
          // 4. Pegar o Token do Supabase igual no cronograma
          const token = await session.getToken({ template: "supabase" });
          
          // 5. Passar o ID e o Token para carregar as tarefas
          const dados = await loadTasks(user.id, token);
          setTarefas(dados);
        } catch (error) {
          console.error("Erro ao buscar dados do Dashboard:", error);
        } finally {
          setLoading(false);
          setMounted(true);
        }
      } else if (isLoaded && !user) {
        setLoading(false);
        setMounted(true);
      }
    }
    fetchData();
  }, [user, isLoaded, session]);

  if (!mounted || loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-10">
        <p className="text-slate-600">Por favor, faça login para ver seus dados.</p>
      </div>
    );
  }

  // --- LÓGICA DE DATAS E PROGRESSO (Permanece igual, agora com dados reais) ---
  const hoje = new Date().toLocaleDateString('en-CA'); 
  
  const tarefasHoje = tarefas.filter(t => t.data === hoje);
  const concluidasHoje = tarefasHoje.filter(t => t.concluida).length;
  const porcentagemHoje = tarefasHoje.length > 0 ? Math.round((concluidasHoje / tarefasHoje.length) * 100) : 0;

  const totalGeral = tarefas.length;
  const concluidasGeral = tarefas.filter(t => t.concluida).length;
  const porcentagemGeral = totalGeral > 0 ? Math.round((concluidasGeral / totalGeral) * 100) : 0;

  const proximaTarefa = tarefasHoje.find(t => !t.concluida && t.prioridade === 'alta') || tarefasHoje.find(t => !t.concluida);

  const raioGeral = 58;
  const circGeral = 2 * Math.PI * raioGeral;
  const offsetGeral = circGeral - (porcentagemGeral / 100) * circGeral;

  const raioHoje = 18;
  const circHoje = 2 * Math.PI * raioHoje;
  const offsetHoje = circHoje - (porcentagemHoje / 100) * circHoje;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-0">
      {/* O RESTO DO SEU JSX CONTINUA EXATAMENTE IGUAL */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Olá, {user.firstName || "Estudante"}! 👋
          </h1>
          <p className="text-slate-500 font-medium">
            {porcentagemHoje === 100 ? "Você completou tudo por hoje!" : "Vamos focar nos estudos hoje?"}
          </p>
        </div>
        
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso de Hoje</p>
            <p className="text-lg font-bold text-violet-600">{porcentagemHoje}%</p>
          </div>
          
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r={raioHoje} stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
              <circle 
                cx="24" cy="24" r={raioHoje} stroke="#7c3aed" strokeWidth="4" fill="transparent" 
                strokeDasharray={circHoje}
                strokeDashoffset={offsetHoje}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="text-[10px]">🎯</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {proximaTarefa && (
            <div className="bg-violet-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-violet-200 relative overflow-hidden group">
              <div className="relative z-10">
                <span className="bg-violet-400/30 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Focar Agora</span>
                <h2 className="text-3xl font-bold mt-4 mb-2">{proximaTarefa.titulo}</h2>
                <p className="text-violet-100 mb-6 font-medium uppercase text-xs tracking-wider">
                  Prioridade {proximaTarefa.prioridade} • {proximaTarefa.tipo}
                </p>
                <Link href="/cronograma" className="bg-white text-violet-600 px-8 py-3 rounded-xl font-bold hover:bg-violet-50 transition-all inline-block">
                  Ir para Cronograma
                </Link>
              </div>
              <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 group-hover:scale-110 transition-transform">📚</div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">📅 Planejado para hoje</h3>
            <div className="space-y-4">
              {tarefasHoje.length === 0 ? (
                <p className="text-slate-400 py-4 italic text-sm">Nenhuma tarefa agendada para hoje.</p>
              ) : (
                tarefasHoje.map(t => (
                  <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                    <div className={`w-2 h-10 rounded-full ${t.prioridade === 'alta' ? 'bg-red-400' : 'bg-violet-400'}`}></div>
                    <div className="flex-1">
                      <p className={`font-bold ${t.concluida ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{t.titulo}</p>
                      <span className="text-[10px] font-black uppercase text-slate-400">{t.tipo}</span>
                    </div>
                    {t.concluida && <span className="text-green-500 font-bold text-sm flex items-center gap-1">✓ Feito</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Desempenho Geral</h3>
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r={raioGeral} stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                  <circle 
                    cx="64" cy="64" r={raioGeral} stroke="#7c3aed" strokeWidth="10" fill="transparent" 
                    strokeDasharray={circGeral}
                    strokeDashoffset={offsetGeral}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
                <span className="text-2xl font-black text-slate-800">{porcentagemGeral}%</span>
              </div>
            </div>
            <div className="space-y-3">
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Total</span>
                  <span className="font-bold text-slate-700">{totalGeral}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Concluídas</span>
                  <span className="font-bold text-green-500">{concluidasGeral}</span>
               </div>
            </div>
            <Link href="/progresso">
              <button className="w-full mt-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all border border-slate-100">
                Ver Relatório Completo
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
