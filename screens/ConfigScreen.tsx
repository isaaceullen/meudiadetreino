
import React, { useState, useRef } from 'react';
import { Plus, Trash2, ShieldAlert, Timer, Database, Download, Upload, Edit2, X, Check, Calendar } from 'lucide-react';
import { GROUPS, GroupLetter, DAY_NAMES } from '../types';

export const ConfigScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { state, setState, addCategory, updateCategory, removeCategory, exportData, importData, showDialog } = manager;
  const [catName, setCatName] = useState('');
  const [catGroup, setCatGroup] = useState<GroupLetter>('A');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCat = () => {
    if (!catName) return;
    if (editingId) {
      updateCategory(editingId, { name: catName, groupLetter: catGroup });
      setEditingId(null);
    } else {
      addCategory({ name: catName, groupLetter: catGroup });
    }
    setCatName('');
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setCatName(cat.name);
    setCatGroup(cat.groupLetter);
  };

  // Agendamento Múltiplo
  const toggleSchedule = (dayIdx: number, group: GroupLetter) => {
    const currentSchedule = state.schedule[dayIdx] || [];
    let newDaySchedule;
    
    if (currentSchedule.includes(group)) {
      newDaySchedule = currentSchedule.filter((g: string) => g !== group);
    } else {
      newDaySchedule = [...currentSchedule, group].sort(); // Mantém ordem alfabética
    }

    setState((prev: any) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayIdx]: newDaySchedule
      }
    }));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const jsonStr = event.target?.result as string;
      const success = importData(jsonStr);
      if (success) {
        showDialog('alert', 'Dados Restaurados', 'O backup foi importado com sucesso.');
      } else {
        showDialog('alert', 'Erro na Importação', 'O arquivo JSON parece inválido ou corrompido.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    const confirm = await showDialog('confirm', 'Limpar Tudo?', 'Esta ação é irreversível e apagará todas as sessões e exercícios.');
    if (confirm) {
      setState({ 
        categories: [], 
        exercises: [], 
        sessions: [], 
        settings: { autoTimer: true, restTimeSeconds: 60 },
        schedule: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
        logs: [],
        history: []
      });
    }
  };

  const handleRemoveCat = async (id: string) => {
    const confirm = await showDialog('confirm', 'Excluir Categoria?', 'Isso também removerá a associação desta categoria nos exercícios.');
    if (confirm) removeCategory(id);
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="p-6 space-y-10 animate-in fade-in duration-500 pb-32">
        <header className="pt-4">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Ajustes</h2>
        </header>

        {/* Gerenciar Categorias (Estilo Screenshot) */}
        <section className="bg-[#121214] border border-zinc-800 rounded-[2.5rem] p-6 space-y-8 shadow-2xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Gerenciar Categorias</h3>
            <button className="text-zinc-600"><X size={20} /></button>
          </div>

          {/* AGENDAMENTO DE GRUPOS GRID */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 space-y-4">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Agendamento Semanal</h4>
            <div className="space-y-3">
              {Object.entries(DAY_NAMES).map(([idxStr, name]) => {
                const idx = parseInt(idxStr);
                const activeGroups = state.schedule[idx] || [];
                return (
                  <div key={idx} className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-0">
                    <span className="text-xs font-bold text-zinc-400 w-20">{name.split('-')[0]}</span>
                    <div className="flex gap-1">
                      {GROUPS.map(g => {
                        const isActive = activeGroups.includes(g);
                        return (
                          <button
                            key={g}
                            onClick={() => toggleSchedule(idx, g)}
                            className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                              isActive 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-zinc-600 text-center pt-2">Selecione múltiplos grupos por dia.</p>
          </div>

          {/* ADD CATEGORIA */}
          <div className="flex gap-2">
            <input 
              value={catName} 
              onChange={e => setCatName(e.target.value)} 
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:ring-1 ring-blue-500 text-sm placeholder-zinc-600" 
              placeholder="Nome da Categoria..."
            />
            <select 
              value={catGroup} 
              onChange={e => setCatGroup(e.target.value as GroupLetter)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 text-white outline-none appearance-none font-black"
            >
              {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <button 
              onClick={handleAddCat}
              className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 active:scale-90 transition-all"
            >
              {editingId ? <Check size={20} /> : <Plus size={20} />}
            </button>
          </div>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center mt-[-1rem]">
            Selecione o Grupo (A-F) para organizar a categoria.
          </p>

          {/* LISTA DE CATEGORIAS */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
            {state.categories.map((c: any) => (
              <div key={c.id} className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center transition-all hover:bg-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center font-black text-[10px] text-zinc-500">
                    {c.groupLetter}
                  </div>
                  <span className="font-bold italic uppercase text-zinc-300">{c.name}</span>
                </div>
                <div className="flex gap-1 opacity-100 transition-opacity">
                  <button onClick={() => startEdit(c)} className="p-2 text-zinc-500 hover:text-white"><Edit2 size={16}/></button>
                  <button onClick={() => handleRemoveCat(c.id)} className="p-2 text-zinc-700 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
            {state.categories.length === 0 && (
              <p className="text-center py-10 text-zinc-700 italic text-xs uppercase font-black tracking-widest">Nenhuma Categoria</p>
            )}
          </div>
        </section>

        {/* Preferências */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
             <Timer size={20} className="text-blue-500" />
             <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Preferências</h3>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-sm italic uppercase">Timer Automático</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Abrir timer ao marcar série</p>
            </div>
            <button 
              onClick={() => setState((prev: any) => ({ ...prev, settings: { ...prev.settings, autoTimer: !prev.settings.autoTimer }}))}
              className={`w-14 h-8 rounded-full transition-all relative ${state.settings.autoTimer ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${state.settings.autoTimer ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        {/* Backup e Restauração */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
             <Database size={20} className="text-blue-500" />
             <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Dados</h3>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={exportData}
              className="w-full flex items-center justify-between p-5 bg-zinc-800/50 rounded-2xl hover:bg-zinc-800 transition-all border border-zinc-800 group"
            >
              <div className="flex items-center gap-4">
                <Download size={20} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                <div className="text-left">
                  <p className="font-bold text-sm italic uppercase text-white">Exportar Dados</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Baixar JSON</p>
                </div>
              </div>
            </button>

            <button 
              onClick={handleImportClick}
              className="w-full flex items-center justify-between p-5 bg-zinc-800/50 rounded-2xl hover:bg-zinc-800 transition-all border border-zinc-800 group"
            >
              <div className="flex items-center gap-4">
                <Upload size={20} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                <div className="text-left">
                  <p className="font-bold text-sm italic uppercase text-white">Importar Dados</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Restaurar JSON</p>
                </div>
              </div>
            </button>
            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".json" />
          </div>
        </section>

        <section className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-8 space-y-5">
          <div className="flex items-center gap-3 text-red-500">
             <ShieldAlert size={20} />
             <h3 className="text-xs font-black uppercase tracking-widest">Zona Crítica</h3>
          </div>
          <button 
            onClick={handleReset}
            className="w-full py-5 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            Limpar Base de Dados
          </button>
        </section>
      </div>
    </div>
  );
};
