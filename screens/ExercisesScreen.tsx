
import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, Link2, Info, X, Check, Filter, SlidersHorizontal, Activity, Dumbbell } from 'lucide-react';
import { Exercise, GROUPS, GroupLetter } from '../types';

export const ExercisesScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { state, addExercise, updateExercise, removeExercise, showDialog } = manager;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estados de Filtro
  const [selectedGroups, setSelectedGroups] = useState<GroupLetter[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  // State do Formulário
  const [formData, setFormData] = useState<Omit<Exercise, 'id' | 'sortOrder'>>({
    name: '',
    categoryIds: [],
    type: 'strength',
    defaultSets: 3,
    defaultReps: 10,
    initialLoad: 0,
    viewUrl: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categoryIds.length === 0) return showDialog('alert', 'Atenção', 'Selecione pelo menos uma categoria.');
    
    if (editingId) {
      updateExercise(editingId, formData);
    } else {
      addExercise(formData);
    }
    
    closeModal();
  };

  const openModal = (ex?: Exercise) => {
    if (ex) {
      setEditingId(ex.id);
      setFormData({
        name: ex.name,
        categoryIds: ex.categoryIds || (ex.categoryId ? [ex.categoryId] : []),
        type: ex.type || 'strength',
        defaultSets: ex.defaultSets,
        defaultReps: ex.defaultReps,
        initialLoad: ex.initialLoad,
        viewUrl: ex.viewUrl || '',
        notes: ex.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        categoryIds: state.categories[0] ? [state.categories[0].id] : [],
        type: 'strength',
        defaultSets: 3,
        defaultReps: 10,
        initialLoad: 0,
        viewUrl: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const toggleCategorySelection = (catId: string) => {
    setFormData(prev => {
      if (prev.categoryIds.includes(catId)) {
        return { ...prev, categoryIds: prev.categoryIds.filter(id => id !== catId) };
      } else {
        return { ...prev, categoryIds: [...prev.categoryIds, catId] };
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleRemove = async (id: string) => {
    const confirm = await showDialog('confirm', 'Excluir Exercício?', 'Esta ação removerá o exercício do seu acervo permanentemente.');
    if (confirm) removeExercise(id);
  };

  const toggleGroupFilter = (g: GroupLetter) => {
    setSelectedGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleCatFilter = (id: string) => {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const resetFilters = () => {
    setSelectedGroups([]);
    setSelectedCats([]);
    setSearch('');
  };

  // Lógica de Filtro Atualizada para categoryIds
  const filtered = state.exercises.filter((ex: Exercise) => {
    const exCatIds = ex.categoryIds || (ex.categoryId ? [ex.categoryId] : []);
    
    // Check Search
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    
    // Check Groups (Se qualquer categoria do exercício pertencer a um grupo selecionado)
    const exGroups = state.categories
      .filter((c: any) => exCatIds.includes(c.id))
      .map((c: any) => c.groupLetter);
      
    const matchesGroup = selectedGroups.length === 0 || exGroups.some((g: any) => selectedGroups.includes(g));

    // Check Specific Categories
    const matchesCat = selectedCats.length === 0 || exCatIds.some(id => selectedCats.includes(id));

    return matchesSearch && matchesGroup && matchesCat;
  });

  const activeFiltersCount = selectedGroups.length + selectedCats.length;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center pt-4">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Acervo</h2>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">{state.exercises.length} Cadastrados</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 p-5 rounded-3xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            placeholder="Filtrar por nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] py-5 pl-14 pr-6 text-white placeholder-zinc-600 outline-none focus:ring-2 ring-blue-500 transition-all"
          />
        </div>
        <button 
          onClick={() => setIsFilterOpen(true)}
          className={`px-5 rounded-[2rem] border transition-all flex items-center justify-center relative ${
            activeFiltersCount > 0 ? 'bg-blue-600 border-blue-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
          }`}
        >
          <SlidersHorizontal size={20} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border border-zinc-900">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <div className="space-y-4 pb-20">
        {filtered.map((ex: Exercise) => {
          const catIds = ex.categoryIds || (ex.categoryId ? [ex.categoryId] : []);
          const cats = state.categories.filter((c: any) => catIds.includes(c.id));
          
          return (
            <div key={ex.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex justify-between items-center group transition-all hover:border-zinc-700">
              <div className="max-w-[70%]">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {ex.type === 'cardio' && <span className="text-[8px] bg-pink-500/20 text-pink-500 font-black px-1.5 py-0.5 rounded uppercase">Cardio</span>}
                  {cats.map((c: any) => (
                    <span key={c.id} className="text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-800 px-1.5 py-0.5 rounded">
                      {c.name} ({c.groupLetter})
                    </span>
                  ))}
                </div>
                <h4 className="text-lg font-black italic uppercase text-white leading-tight">{ex.name}</h4>
                {ex.type === 'strength' && (
                  <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{ex.defaultSets}x{ex.defaultReps} • {ex.initialLoad}kg</p>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(ex)} className="p-3 text-zinc-500 hover:text-white transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleRemove(ex.id)} className="p-3 text-zinc-700 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/30 rounded-[2.5rem] border-2 border-dashed border-zinc-800/50">
            <p className="text-zinc-700 font-black uppercase text-xs tracking-widest italic">Nenhum exercício encontrado</p>
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} className="mt-4 text-blue-500 font-black uppercase text-[10px] tracking-widest underline decoration-2 underline-offset-4">Limpar Filtros</button>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE FILTROS */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-end animate-in fade-in duration-300">
          <div className="w-full bg-[#121214] border-t border-zinc-800 rounded-t-[3rem] p-8 pb-12 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-500">
            <header className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black italic uppercase">Filtrar Acervo</h3>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Personalize sua visualização</p>
              </div>
              <button onClick={() => setIsFilterOpen(false)} className="p-4 bg-zinc-900 rounded-2xl text-zinc-500"><X size={24} /></button>
            </header>

            <div className="space-y-10">
              <section className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Por Letra / Grupo</h4>
                  {selectedGroups.length > 0 && <button onClick={() => setSelectedGroups([])} className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Limpar</button>}
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {GROUPS.map(g => (
                    <button 
                      key={g} 
                      onClick={() => toggleGroupFilter(g)}
                      className={`py-4 rounded-xl font-black italic transition-all border ${
                        selectedGroups.includes(g) ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Por Categoria</h4>
                  {selectedCats.length > 0 && <button onClick={() => setSelectedCats([])} className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Limpar</button>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.categories.map((c: any) => (
                    <button 
                      key={c.id} 
                      onClick={() => toggleCatFilter(c.id)}
                      className={`px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest border transition-all ${
                        selectedCats.includes(c.id) ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                  {state.categories.length === 0 && (
                    <p className="text-zinc-700 italic text-xs py-4 px-2 uppercase font-black">Nenhuma categoria cadastrada</p>
                  )}
                </div>
              </section>

              <div className="flex gap-3 pt-6 border-t border-zinc-800/50">
                <button 
                  onClick={resetFilters}
                  className="flex-1 bg-zinc-900 text-zinc-500 font-black uppercase py-5 rounded-3xl text-xs tracking-widest border border-zinc-800"
                >
                  Resetar Tudo
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 bg-white text-black font-black uppercase py-5 rounded-3xl text-xs tracking-widest shadow-2xl active:scale-95 transition-all"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ADIÇÃO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black z-[100] animate-in slide-in-from-bottom duration-300 overflow-y-auto">
          <div className="p-8 pb-32 max-w-lg mx-auto">
            <header className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black italic uppercase">{editingId ? 'Editar' : 'Novo'} Exercício</h3>
              <button onClick={closeModal} className="bg-zinc-900 p-4 rounded-2xl text-zinc-500"><X size={24} /></button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* TIPO */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-zinc-900 rounded-[2rem]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'strength' })}
                  className={`py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${formData.type === 'strength' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600'}`}
                >
                  <Dumbbell size={16} /> Força
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'cardio' })}
                  className={`py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${formData.type === 'cardio' ? 'bg-zinc-800 text-pink-500 shadow-lg' : 'text-zinc-600'}`}
                >
                  <Activity size={16} /> Cardio
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Identificação</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 outline-none focus:ring-2 ring-blue-500 transition-all" placeholder="Nome do Exercício" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Categorias (Multi-seleção)</label>
                <div className="flex flex-wrap gap-2">
                  {state.categories.map((c: any) => {
                    const isSelected = formData.categoryIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCategorySelection(c.id)}
                        className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                      >
                        {c.name} ({c.groupLetter})
                      </button>
                    )
                  })}
                </div>
                {state.categories.length === 0 && <p className="text-zinc-600 text-xs italic">Crie categorias primeiro.</p>}
              </div>

              {formData.type === 'strength' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Carga Inicial</label>
                      <input type="number" value={formData.initialLoad} onChange={e => setFormData({...formData, initialLoad: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3 text-center">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Séries Padrão</label>
                      <input type="number" value={formData.defaultSets} onChange={e => setFormData({...formData, defaultSets: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center" />
                    </div>
                    <div className="space-y-3 text-center">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reps Padrão</label>
                      <input type="number" value={formData.defaultReps} onChange={e => setFormData({...formData, defaultReps: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center" />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Link2 size={14} className="text-blue-500"/> Link YouTube/Execução</label>
                <input value={formData.viewUrl} onChange={e => setFormData({...formData, viewUrl: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 outline-none" placeholder="https://..." />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Info size={14} className="text-blue-500"/> Notas Técnicas</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 outline-none resize-none" placeholder="Cotovelos alinhados, foco no pico de contração..." />
              </div>

              <button type="submit" className="w-full bg-blue-600 py-6 rounded-[2rem] font-black italic uppercase text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                {editingId ? <><Check size={20}/> Salvar Alterações</> : <><Plus size={20}/> Registrar no Acervo</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
