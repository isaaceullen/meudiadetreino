
import React, { useState, useMemo } from 'react';
import { Exercise, DayId, DAY_NAMES } from '../types';
import { Plus, Search, Filter, Edit2, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ExerciseManagerProps {
  exercises: Exercise[];
  onAdd: (ex: Exercise) => void;
  onUpdate: (ex: Exercise) => void;
  onDelete: (id: string) => void;
}

export const ExerciseManager: React.FC<ExerciseManagerProps> = ({ exercises, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterEquip, setFilterEquip] = useState('');
  const [expandedCats, setExpandedCats] = useState<string[]>(['A', 'B', 'C']);

  // Form state
  const [formData, setFormData] = useState<Partial<Exercise>>({
    name: '',
    category: 'A',
    load: 0,
    reps: 0,
    sets: 0,
    weekdays: [],
    equipment: '',
    restTime: 60
  });

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterEquip === '' || ex.equipment.toLowerCase().includes(filterEquip.toLowerCase()))
    );
  }, [exercises, search, filterEquip]);

  const grouped = useMemo(() => {
    return {
      'A': filteredExercises.filter(e => e.category === 'A'),
      'B': filteredExercises.filter(e => e.category === 'B'),
      'C': filteredExercises.filter(e => e.category === 'C'),
    };
  }, [filteredExercises]);

  const handleEdit = (ex: Exercise) => {
    setFormData(ex);
    setEditingId(ex.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ex: Exercise = {
      ...formData as Exercise,
      id: editingId || Date.now().toString(),
    };
    if (editingId) onUpdate(ex);
    else onAdd(ex);
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', category: 'A', load: 0, reps: 0, sets: 0, weekdays: [], equipment: '', restTime: 60 });
  };

  const toggleDay = (day: DayId) => {
    setFormData(prev => ({
      ...prev,
      weekdays: prev.weekdays?.includes(day) 
        ? prev.weekdays.filter(d => d !== day)
        : [...(prev.weekdays || []), day]
    }));
  };

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Exercícios</h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-500 shadow-lg shadow-blue-900/20"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar exercício..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['', 'Barra', 'Halter', 'Polia', 'Máquina', 'Peso do Corpo'].map(eq => (
            <button
              key={eq}
              onClick={() => setFilterEquip(eq)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                filterEquip === eq ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              {eq || 'Todos'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {(Object.keys(grouped) as Array<'A' | 'B' | 'C'>).map(cat => (
          <div key={cat} className="space-y-2">
            <button 
              onClick={() => toggleCat(cat)}
              className="w-full flex justify-between items-center py-2 px-1 border-b border-zinc-800"
            >
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Grupo {cat}</h3>
              {expandedCats.includes(cat) ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
            </button>
            
            {expandedCats.includes(cat) && (
              <div className="space-y-2">
                {grouped[cat].map(ex => (
                  <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white">{ex.name}</h4>
                      <p className="text-xs text-zinc-500">{ex.equipment} • {ex.load}kg</p>
                      <div className="flex gap-1 mt-2">
                        {[0,1,2,3,4,5,6].map(d => (
                          <div key={d} className={`w-5 h-5 flex items-center justify-center rounded-full text-[8px] font-bold ${
                            ex.weekdays.includes(d as DayId) ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-600'
                          }`}>
                            {DAY_NAMES[d as DayId][0]}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(ex)} className="p-2 text-zinc-400 hover:text-white"><Edit2 size={18} /></button>
                      <button onClick={() => onDelete(ex.id)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                {grouped[cat].length === 0 && <p className="text-center py-4 text-zinc-600 text-xs italic">Nenhum exercício neste grupo.</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 p-4 flex flex-col animate-in fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Exercício' : 'Novo Exercício'}</h3>
            <button onClick={() => { setIsFormOpen(false); setEditingId(null); }} className="p-2 text-zinc-400"><X size={24} /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto pb-10 pr-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Nome do Exercício</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Supino Inclinado"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Categoria</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as 'A'|'B'|'C'})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white outline-none"
                >
                  <option value="A">Grupo A</option>
                  <option value="B">Grupo B</option>
                  <option value="C">Grupo C</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Equipamento</label>
                <input 
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white outline-none"
                  placeholder="Ex: Halter"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Carga (kg)</label>
                <input type="number" value={formData.load} onChange={(e) => setFormData({...formData, load: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-2 text-center text-white outline-none"/>
              </div>
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Séries</label>
                <input type="number" value={formData.sets} onChange={(e) => setFormData({...formData, sets: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-2 text-center text-white outline-none"/>
              </div>
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Reps</label>
                <input type="number" value={formData.reps} onChange={(e) => setFormData({...formData, reps: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-2 text-center text-white outline-none"/>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Tempo de Descanso (segundos)</label>
              <input type="number" value={formData.restTime} onChange={(e) => setFormData({...formData, restTime: Number(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white outline-none"/>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Dias da Semana</label>
              <div className="grid grid-cols-7 gap-1">
                {([0,1,2,3,4,5,6] as DayId[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`py-3 rounded-lg text-xs font-bold transition-all ${
                      formData.weekdays?.includes(d) ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {DAY_NAMES[d][0]}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform mt-6">
              {editingId ? 'Salvar Alterações' : 'Criar Exercício'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
