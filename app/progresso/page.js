"use client";

import { useState, useEffect } from "react";
import { loadTasks } from "@/lib/store";
import { useUser } from "@clerk/nextjs"; // Importamos o hook do Clerk

export default function Progresso() {
  const { user, isLoaded } = useUser(); // Pegamos o usuário logado
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Só buscamos os dados se o Clerk já carregou o usuário
      if (isLoaded && user) {
        const dados = await loadTasks(user.id); // Passamos o ID para a store
        setTarefas(dados);
        setLoading(false);
      } else if (isLoaded && !user) {
        // Se carregou e não tem usuário, paramos o loading
        setLoading(false);
      }
    }
    fetchData();
  }, [user, isLoaded]);

  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  // Se o usuário não estiver logado por algum motivo, mostramos um aviso
  if (!user) {
    return (
      <div className="text-center p-10">
        <p className="text-slate-600">Por favor, faça login para ver seu progresso.</p>
      </div>
    );
  }

  // Cálculos de Estatísticas (Agora filtrados pelo seu ID)
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.concluida).length;
  const progressoTotal = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const teoria = tarefas.filter((t) => t.tipo === "teoria").length;
  const teoriaConcluida = tarefas.filter((t) => t.tipo === "teoria" && t.concluida).length;
  
  const exercicio = tarefas.filter((t) => t.tipo === "exercicio").length;
  const exercicioConcluido = tarefas.filter((t) => t.tipo === "exercicio" && t.concluida).length;

  // Configurações do Gráfico Circular
  const raio = 36;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia - (progressoTotal / 100) * circunferencia;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Seu Progresso</h1>
        <p className="text-slate-500 font-medium italic">
          Olá, {user.firstName || "Estudante"}! Seus dados estão seguros ☁️
        </p>
      </header>

      {/* CARDS PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total de Tarefas</p>
          <p className="text-4xl font-black text-slate-800">{total}</p>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Concluídas</p>
          <p className="text-4xl font-black text-green-500">{concluidas}</p>
        </div>

        {/* CARD COM GRÁFICO CIRCULAR */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Progresso Geral</p>
          
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={raio}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="48"
                cy="48"
                r={raio}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circunferencia}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="text-violet-600 transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-xl font-black text-slate-800">{progressoTotal}%</span>
          </div>
        </div>
      </div>

      {/* ANÁLISE POR CATEGORIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold text-slate-800">📖 Teoria</h3>
            <span className="text-sm font-bold text-slate-400">{teoriaConcluida}/{teoria}</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
            <div 
              className="bg-violet-500 h-full transition-all duration-1000" 
              style={{ width: `${teoria > 0 ? (teoriaConcluida / teoria) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold text-slate-800">✍️ Exercícios</h3>
            <span className="text-sm font-bold text-slate-400">{exercicioConcluido}/{exercicio}</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-1000" 
              style={{ width: `${exercicio > 0 ? (exercicioConcluido / exercicio) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-slate-800 p-10 rounded-[3rem] text-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Continue firme! 🚀</h2>
          <p className="text-slate-400">Cada clique no seu progresso é um passo rumo à vaga.</p>
        </div>
        <div className="absolute -left-10 -bottom-10 text-9xl opacity-5">🏆</div>
      </div>
    </div>
  );
}
