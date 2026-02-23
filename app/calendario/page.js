"use client";

import { useState, useEffect } from "react";
import { loadTasks, saveTasks } from "@/lib/store";

export default function Calendario() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [tarefas, setTarefas] = useState([]);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [novaTarefa, setNovaTarefa] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTarefas(loadTasks());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveTasks(tarefas);
  }, [tarefas, mounted]);

  if (!mounted) return null;

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  function adicionarTarefa() {
    if (!novaTarefa || !diaSelecionado) return;
    const dataFormatada = `${ano}-${String(mes+1).padStart(2,"0")}-${String(diaSelecionado).padStart(2,"0")}`;
    const nova = { id: Date.now(), titulo: novaTarefa, data: dataFormatada, concluida: false };
    setTarefas([...tarefas, nova]);
    setNovaTarefa("");
    setDiaSelecionado(null);
  }

  function mesAnterior() {
    if (mes === 0) {
      setMes(11);
      setAno(ano - 1);
    } else {
      setMes(mes - 1);
    }
  }

  function proximoMes() {
    if (mes === 11) {
      setMes(0);
      setAno(ano + 1);
    } else {
      setMes(mes + 1);
    }
  }

  const dias = [];
  // Criar espaços vazios para alinhar o dia 1 com o dia da semana correto
  for (let i = 0; i < primeiroDia; i++) {
    dias.push(<div key={"vazio"+i} className="p-2"></div>);
  }

  // Preencher os dias do mês
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dataF = `${ano}-${String(mes+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
    const tarefasDoDia = tarefas.filter(t => t.data === dataF);
    
    dias.push(
      <div 
        key={dia} 
        onClick={() => setDiaSelecionado(dia)} 
        className={`bg-white hover:bg-purple-50 cursor-pointer rounded-xl p-2 shadow-sm border min-h-[100px] transition ${diaSelecionado === dia ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-100'}`}
      >
        <div className="font-bold text-purple-700 mb-1">{dia}</div>
        <div className="space-y-1">
          {tarefasDoDia.map(t => (
            <div key={t.id} className={`text-[10px] p-1 rounded truncate ${t.concluida ? "bg-green-100 text-green-700 line-through" : "bg-purple-100 text-purple-700"}`}>
              {t.titulo}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      
      {/* CABEÇALHO COM NAVEGAÇÃO */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-purple-100">
        <button 
          onClick={mesAnterior}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          ← Anterior
        </button>

        <h1 className="text-2xl font-bold text-purple-900">
          {meses[mes]} de {ano}
        </h1>

        <button 
          onClick={proximoMes}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Próximo →
        </button>
      </div>

      {/* DIAS DA SEMANA */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center font-semibold text-gray-500 text-sm">
        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
      </div>

      {/* GRID DO CALENDÁRIO */}
      <div className="grid grid-cols-7 gap-2">
        {dias}
      </div>

      {/* POPUP DE ADICIONAR TAREFA */}
      {diaSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-purple-800">Nova tarefa para dia {diaSelecionado}</h2>
            <input 
              autoFocus
              value={novaTarefa} 
              onChange={e => setNovaTarefa(e.target.value)} 
              className="border-2 border-purple-100 p-3 w-full mb-4 rounded-xl focus:border-purple-500 outline-none"
              placeholder="Ex: Estudar Next.js"
            />
            <div className="flex gap-2">
              <button 
                onClick={adicionarTarefa} 
                className="bg-purple-600 text-white px-4 py-3 rounded-xl flex-1 font-bold hover:bg-purple-700"
              >
                Salvar
              </button>
              <button 
                onClick={() => setDiaSelecionado(null)} 
                className="bg-gray-100 text-gray-600 px-4 py-3 rounded-xl flex-1 font-bold hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}