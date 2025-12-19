
// screens/SettingsScreen.tsx
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert, ChevronRight, ChevronLeft } from 'lucide-react';
import { GroupLetter, GROUPS } from '../types';

export const SettingsScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { state, setState } = manager;
  const [activeView, setActiveView] = useState<'main' | 'exercises' | 'categories'>('main');

  if (activeView === 'exercises') return <ExerciseSettings manager={manager} onBack={() => setActiveView('main')} />;
  if (activeView === 'categories') return <CategorySettings manager={manager} onBack={() => setActiveView('main')} />;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black italic uppercase tracking-tighter">Ajustes</h2>

      <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
        <SettingItem 
          label="Gerenciar Exercícios" 
          description={`${state.exercises.length} itens cadastrados`} 
          onClick={() => setActiveView('exercises')} 
        />
        <SettingItem 
          label="Categorias & Grupos" 
          description={`${state.categories.length} categorias ativas`} 
          onClick={() => setActiveView('categories')} 
        />
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 space-y-6">
        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Comportamento</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-sm italic uppercase">Timer Automático</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Disparar ao marcar série</p>
          </div>
          <button 
            onClick={() => setState((prev: any) => ({ ...prev, settings: { ...prev.settings, autoTimer: !prev.settings.autoTimer }}))}
            className={`w-14 h-8 rounded-full transition-all relative ${state.settings.autoTimer ? 'bg-blue-600' : 'bg-zinc-800'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${state.settings.autoTimer ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </section>

      <section className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center gap-2 text-red-500">
          <ShieldAlert size={18} />
          <p className="text-[10px] font-black uppercase tracking-widest">Zona de Perigo</p>
        </div>
        <button 
          onClick={() => { if(confirm('APAGAR TUDO? Esta ação não pode ser desfeita.')) setState({ ...state, sessions: [], exercises: [], categories: [] }); }}
          className="w-full py-4 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          Limpar todos os dados
        </button>
      </section>
    </div>
  );
};

const SettingItem = ({ label, description, onClick }: any) => (
  <button onClick={onClick} className="w-full p-6 text-left hover:bg-zinc-800 transition-all border-b border-zinc-800 last:border-0 flex justify-between items-center group">
    <div>
      <p className="font-black italic uppercase text-white group-hover:text-blue-500 transition-colors">{label}</p>
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{description}</p>
    </div>
    <ChevronRight size={20} className="text-zinc-700 group-hover:text-white transition-all" />
  </button>
);

const CategorySettings = ({ manager, onBack }: any) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState<GroupLetter>('A');
  const [editingId, setEditingId] = useState<string | null>(null);
  const { state, setState } = manager;

  const handleEdit = (cat: any) => {
    setName(cat.name);
    setGroup(cat.groupLetter);
    setEditingId(cat.id);
  };

  const cancelEdit = () => {
    setName('');
    setGroup('A');
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!name) return;

    if (editingId) {
      manager.setState((p: any) => ({
        ...p,
        categories: p.categories.map((c: any) => 
          c.id === editingId ? { ...c, name, groupLetter: group } : c
        )
      }));
    } else {
      manager.setState((p: any) => ({
        ...p,
        categories: [...p.categories, { id: crypto.randomUUID(), name, groupLetter: group }]
      }));
    }
    cancelEdit();
  };

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right duration-300">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-xl"><ChevronLeft size={20}/></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter">
          {editingId ? 'Editar Categoria' : 'Categorias'}
        </h2>
      </header>

      <div className="bg-zinc-900 p-6 rounded-3xl space-y-4 border border-zinc-800">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome da Categoria</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Quadríceps" 
            className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Vincular ao Grupo</label>
          <div className="flex gap-2">
            {GROUPS.map(g => (
              <button 
                key={g} 
                onClick={() => setGroup(g)}
                className={`flex-1 py-3 rounded-xl font-black transition-all border ${group === g ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={handleSubmit}
            className="flex-1 bg-white text-black font-black uppercase py-4 rounded-2xl active:scale-95 transition-all"
          >
            {editingId ? 'Salvar Alterações' : 'Adicionar Categoria'}
          </button>
          {editingId && (
            <button 
              onClick={cancelEdit}
              className="bg-zinc-800 text-white p-4 rounded-2xl active:scale-95 transition-all"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Categorias Criadas</h3>
        {state.categories.map((c: any) => (
          <div key={c.id} className={`bg-zinc-900 p-4 rounded-2xl flex justify-between items-center border transition-all ${editingId === c.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-zinc-800'}`}>
            <div>
              <p className="font-bold italic uppercase">{c.name}</p>
              <p className="text-[10px] font-black text-blue-500 uppercase">Grupo {c.groupLetter}</p>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => handleEdit(c)} 
                className={`p-2 transition-colors ${editingId === c.id ? 'text-blue-500' : 'text-zinc-600 hover:text-blue-400'}`}
              >
                <Edit2 size={18}/>
              </button>
              <button 
                onClick={() => { if(confirm('Excluir esta categoria também apagará os exercícios vinculados. Deseja continuar?')) manager.setState((p: any) => ({ ...p, categories: p.categories.filter((x: any) => x.id !== c.id), exercises: p.exercises.filter((ex: any) => ex.categoryId !== c.id) })) }} 
                className="p-2 text-zinc-600 hover:text-red-500"
              >
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
        {state.categories.length === 0 && (
          <p className="text-center py-8 text-zinc-600 italic text-sm">Nenhuma categoria cadastrada.</p>
        )}
      </div>
    </div>
  );
};

const ExerciseSettings = ({ manager, onBack }: any) => {
  const { state, setState } = manager;
  const [name, setName] = useState('');
  const [catId, setCatId] = useState(state.categories[0]?.id || '');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (ex: any) => {
    setName(ex.name);
    setCatId(ex.categoryId);
    setSets(ex.defaultSets);
    setReps(ex.defaultReps);
    setEditingId(ex.id);
  };

  const cancelEdit = () => {
    setName('');
    setSets(3);
    setReps(10);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!name || !catId) return;

    if (editingId) {
      manager.setState((p: any) => ({
        ...p,
        exercises: p.exercises.map((ex: any) => 
          ex.id === editingId ? { ...ex, name, categoryId: catId, defaultSets: sets, defaultReps: reps } : ex
        )
      }));
    } else {
      manager.setState((p: any) => ({
        ...p,
        exercises: [...p.exercises, { id: crypto.randomUUID(), name, categoryId: catId, defaultSets: sets, defaultReps: reps }]
      }));
    }
    cancelEdit();
  };

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right duration-300">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-xl"><ChevronLeft size={20}/></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter">
          {editingId ? 'Editar Exercício' : 'Exercícios'}
        </h2>
      </header>

      <div className="bg-zinc-900 p-6 rounded-3xl space-y-4 border border-zinc-800">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome do Exercício</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Ex: Supino Reto" 
            className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500 transition-all" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Categoria</label>
          <select 
            value={catId} 
            onChange={e => setCatId(e.target.value)} 
            className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:ring-2 ring-blue-500"
          >
            <option value="">Selecione a Categoria</option>
            {state.categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name} ({c.groupLetter})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center block">Séries</label>
            <input type="number" value={sets} onChange={e => setSets(Number(e.target.value))} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-center outline-none focus:ring-2 ring-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center block">Reps</label>
            <input type="number" value={reps} onChange={e => setReps(Number(e.target.value))} className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-center outline-none focus:ring-2 ring-blue-500" />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white font-black uppercase py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            {editingId ? 'Salvar Alterações' : 'Salvar Exercício'}
          </button>
          {editingId && (
            <button 
              onClick={cancelEdit}
              className="bg-zinc-800 text-white p-4 rounded-2xl active:scale-95 transition-all"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Lista de Exercícios</h3>
        {state.exercises.map((ex: any) => (
          <div key={ex.id} className={`bg-zinc-900 p-4 rounded-2xl flex justify-between items-center border transition-all ${editingId === ex.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-zinc-800'}`}>
            <div>
              <p className="font-bold italic uppercase">{ex.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                {ex.defaultSets}x{ex.defaultReps} • {state.categories.find((c: any) => c.id === ex.categoryId)?.name}
              </p>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => handleEdit(ex)} 
                className={`p-2 transition-colors ${editingId === ex.id ? 'text-blue-500' : 'text-zinc-600 hover:text-blue-400'}`}
              >
                <Edit2 size={18}/>
              </button>
              <button 
                onClick={() => { if(confirm('Excluir este exercício?')) manager.setState((p: any) => ({ ...p, exercises: p.exercises.filter((x: any) => x.id !== ex.id) })) }} 
                className="p-2 text-zinc-600 hover:text-red-500"
              >
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
        {state.exercises.length === 0 && (
          <p className="text-center py-8 text-zinc-600 italic text-sm">Nenhum exercício cadastrado.</p>
        )}
      </div>
    </div>
  );
};
