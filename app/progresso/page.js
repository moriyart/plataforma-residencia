"use client";

import { useState, useEffect } from "react";
import { loadTasks } from "@/lib/store";

export default function Progresso() {
  const [tarefas, setTarefas] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTarefas(loadTasks());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // --- LÓGICA DE CÁLCULO ---
  const totalGeral = tarefas.length;
  const concluidasGeral = tarefas.filter(t => t.concluida).length;
  const porcentagemGeral = totalGeral > 0 ? Math.round((concluidasGeral / totalGeral) * 100) : 0;

  const tarefasTeoria = tarefas.filter(t => t.tipo === "teoria");
  const tarefasExercicio = tarefas.filter(t => t.tipo === "exercicio");

  const calcularPorcento = (lista) => {
    if (lista.length === 0) return 0;
    const concluidas = lista.filter(t => t.concluida).length;
    return Math.round((concluidas / lista.length) * 100);
  };

  const pctTeoria = calcularPorcento(tarefasTeoria);
  const pctExercicio = calcularPorcento(tarefasExercicio);

  // --- CONFIGURAÇÃO DO GRÁFICO CIRCULAR ---
  const raio = 70;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia - (porcentagemGeral / 100) * circunferencia;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-800">Seu Desempenho</h1>
        <p className="text-slate-500">Acompanhe sua evolução detalhada</p>
      </header>

      {/* 1. PAINEL PRINCIPAL (LAYOUT LADO A LADO) */}
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          
          {/* LADO ESQUERDO: GRÁFICO CIRCULAR MAIOR */}
          <div className="flex justify-center md:justify-start">
            <div className="relative flex items-center justify-center">
              <svg className="w-64 h-64 transform -rotate-90">
  <circle
    cx="128" cy="128" r="85"  /* Aumentei o raio (r) de 70 para 85 */
    stroke="currentColor" strokeWidth="12"
    fill="transparent" className="text-slate-100"
  />
  <circle
    cx="128" cy="128" r="85"  /* Aumentei o raio (r) de 70 para 85 */
    stroke="currentColor" strokeWidth="12"
    strokeDasharray={2 * Math.PI * 85} /* Ajuste a conta aqui também */
    strokeDashoffset={(2 * Math.PI * 85) - (porcentagemGeral / 100) * (2 * Math.PI * 85)}
    strokeLinecap="round"
    fill="transparent" className="text-violet-600 transition-all duration-1000"
  />
</svg>
              <div className="absolute flex flex-col items-center">
               <span className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter">
  {porcentagemGeral}%
</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total</span>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: DADOS E TAREFAS */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Visão Geral</h2>
              <p className="text-slate-500 text-sm">Você completou mais da metade das suas metas. Continue assim!</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Geral</p>
                <p className="text-3xl font-black text-slate-800">{totalGeral}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                <p className="text-green-600 text-xs font-bold uppercase mb-1">Concluídas</p>
                <p className="text-3xl font-black text-green-600">{concluidasGeral}</p>
              </div>
            </div>

            <div className="bg-violet-50 p-6 rounded-3xl border border-violet-100">
              <p className="text-violet-600 text-xs font-bold uppercase mb-1">Pendentes</p>
              <p className="text-3xl font-black text-violet-600">{totalGeral - concluidasGeral}</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. GRÁFICOS POR CATEGORIA (BARRAS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-black text-slate-800">📖 Teoria</h2>
            <span className="text-2xl font-black text-violet-500">{pctTeoria}%</span>
          </div>
          <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
            <div className="bg-violet-500 h-full transition-all duration-700" style={{ width: `${pctTeoria}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-black text-slate-800">✍️ Exercícios</h2>
            <span className="text-2xl font-black text-blue-500">{pctExercicio}%</span>
          </div>
          <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-700" style={{ width: `${pctExercicio}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}