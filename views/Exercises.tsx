
import React, { useState } from 'react';
import { Trash2, Edit2, Plus, Dumbbell, Settings2, Search, Filter } from 'lucide-react';
import { Exercise, Category, AppState, GroupId } from '../types';
import { generateId, GROUP_IDS, WEEKDAYS_EN, WEEKDAYS_PT } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

interface ExercisesProps {
  exercises: Exercise[];
  categories: Category[];
  settings: AppState['settings'];
  onUpdateExercises: (exercises: Exercise[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateSettings: (settings: AppState['settings']) => void;
}

const INITIAL_FORM: Omit<Exercise, 'id'> = {
  name: '',
  equipment: '',
  targetSets: 3,
  targetReps: 10,
  videoUrl: '',
  note: '',
  categoryId: ''
};

export const Exercises: React.FC<ExercisesProps> = ({ exercises, categories, settings, onUpdateExercises, onUpdateCategories, onUpdateSettings }) => {
  // Exercise Modal State
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseForm, setExerciseForm] = useState<Omit<Exercise, 'id'>>(INITIAL_FORM);

  // Category Management State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryGroup, setNewCategoryGroup] = useState<GroupId>('A');

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<GroupId | 'ALL'>('ALL');

  // --- Filtering Logic ---
  const filteredExercises = exercises.filter(ex => {
      const cat = categories.find(c => c.id === ex.categoryId);
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = filterGroup === 'ALL' || (cat?.group === filterGroup);
      return matchesSearch && matchesGroup;
  });

  const getExercisesByCategory = (catId: string) => {
      return filteredExercises.filter(ex => ex.categoryId === catId);
  };

  // --- Exercise Handlers ---

  const handleExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExerciseId) {
      onUpdateExercises(exercises.map(ex => ex.id === editingExerciseId ? { ...exerciseForm, id: editingExerciseId } : ex));
    } else {
      onUpdateExercises([...exercises, { ...exerciseForm, id: generateId() }]);
    }
    closeExerciseModal();
  };

  const handleEditExercise = (ex: Exercise) => {
    setExerciseForm({ ...ex, note: ex.note || '' });
    setEditingExerciseId(ex.id);
    setIsExerciseModalOpen(true);
  };

  const handleDeleteExercise = (id: string) => {
    if (confirm('Deletar este exercício?')) {
      onUpdateExercises(exercises.filter(ex => ex.id !== id));
    }
  };

  const closeExerciseModal = () => {
    setIsExerciseModalOpen(false);
    setEditingExerciseId(null);
    setExerciseForm(INITIAL_FORM);
  };

  const openNewExerciseModal = () => {
      setExerciseForm({ ...INITIAL_FORM, categoryId: categories[0]?.id || '' });
      setIsExerciseModalOpen(true);
  };

  // --- Category Handlers ---

  const handleAddCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategoryName.trim()) return;
      onUpdateCategories([...categories, { 
          id: generateId(), 
          name: newCategoryName.trim(), 
          isDefault: false,
          group: newCategoryGroup
      }]);
      setNewCategoryName('');
  };

  const handleDeleteCategory = (id: string) => {
      const linkedExercises = exercises.filter(ex => ex.categoryId === id);
      if (linkedExercises.length > 0) {
          if (!confirm(`Esta categoria tem ${linkedExercises.length} exercícios. Eles também serão excluídos. Continuar?`)) return;
          onUpdateExercises(exercises.filter(ex => ex.categoryId !== id));
      } else {
          if (!confirm('Excluir categoria?')) return;
      }
      onUpdateCategories(categories.filter(c => c.id !== id));
  };

  // --- Schedule Handlers ---
  const handleScheduleChange = (group: GroupId, day: string) => {
      onUpdateSettings({
          ...settings,
          groupSchedule: {
              ...settings.groupSchedule,
              [group]: day
          }
      });
  };

  return (
    <div className="space-y-4">
      {/* Header with Search */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-md z-10 py-4 -mx-4 px-4 border-b border-white/5 space-y-3">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Exercícios</h1>
            <div className="flex gap-2">
                <Button onClick={() => setIsCategoryManagerOpen(true)} variant="secondary" size="sm" className="px-3">
                    <Settings2 size={18} />
                </Button>
                <Button onClick={openNewExerciseModal} size="sm" className="px-3">
                    <Plus size={18} />
                </Button>
            </div>
        </div>
        
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Buscar exercício..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-surface border border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
            </div>
            {/* Simple Filter Dropdown */}
            <select 
                value={filterGroup}
                onChange={e => setFilterGroup(e.target.value as GroupId | 'ALL')}
                className="bg-surface border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="ALL">Todos</option>
                {GROUP_IDS.map(g => <option key={g} value={g}>Grupo {g}</option>)}
            </select>
        </div>
      </div>

      {/* Exercises List Grouped by Category */}
      <div className="space-y-4 min-h-[60vh]">
        {exercises.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl">
                <Dumbbell className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
                <p className="text-zinc-500">Nenhum exercício encontrado.</p>
            </div>
        )}
        
        {categories.map(cat => {
            // Check filters first
            if (filterGroup !== 'ALL' && cat.group !== filterGroup) return null;
            
            const catExercises = getExercisesByCategory(cat.id);
            if (catExercises.length === 0) return null;
            
            return (
                <div key={cat.id} className="space-y-2">
                    <div className="flex items-center gap-2 px-2">
                        <span className="w-5 h-5 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px] font-bold border border-blue-500/20">
                            {cat.group}
                        </span>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{cat.name}</h3>
                    </div>
                    {catExercises.map(ex => (
                        <div key={ex.id} className="bg-surface border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-sm hover:border-white/10 transition-colors">
                            <div>
                                <h3 className="font-semibold text-white">{ex.name}</h3>
                                <p className="text-sm text-zinc-400">{ex.targetSets} × {ex.targetReps} • {ex.equipment}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditExercise(ex)} className="p-2 text-zinc-400 hover:text-blue-400 bg-black/20 rounded-lg"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteExercise(ex.id)} className="p-2 text-zinc-400 hover:text-rose-400 bg-black/20 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )
        })}
      </div>

      {/* MODAL: CREATE/EDIT EXERCISE */}
      <Modal 
        isOpen={isExerciseModalOpen} 
        onClose={closeExerciseModal} 
        title={editingExerciseId ? "Editar Exercício" : "Novo Exercício"}
      >
        <form onSubmit={handleExerciseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nome</label>
            <input 
              required
              value={exerciseForm.name}
              onChange={e => setExerciseForm({ ...exerciseForm, name: e.target.value })}
              className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Ex: Supino Reto"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Categoria</label>
            <select
                required
                value={exerciseForm.categoryId}
                onChange={e => setExerciseForm({ ...exerciseForm, categoryId: e.target.value })}
                className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
            >
                <option value="" disabled>Selecione uma categoria</option>
                {categories.map(c => (
                    <option key={c.id} value={c.id}>[{c.group}] {c.name}</option>
                ))}
            </select>
          </div>

          <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Equipamento</label>
              <input 
              value={exerciseForm.equipment}
              onChange={e => setExerciseForm({ ...exerciseForm, equipment: e.target.value })}
              className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Ex: Barra"
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Séries Alvo</label>
              <input 
                type="number"
                min="1"
                required
                value={exerciseForm.targetSets}
                onChange={e => setExerciseForm({ ...exerciseForm, targetSets: parseInt(e.target.value) })}
                className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Reps Alvo</label>
              <input 
                type="number"
                min="1"
                required
                value={exerciseForm.targetReps}
                onChange={e => setExerciseForm({ ...exerciseForm, targetReps: parseInt(e.target.value) })}
                className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">URL do Vídeo (Opcional)</label>
            <input 
              type="url"
              value={exerciseForm.videoUrl}
              onChange={e => setExerciseForm({ ...exerciseForm, videoUrl: e.target.value })}
              className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nota (Opcional)</label>
            <textarea 
              value={exerciseForm.note || ''}
              onChange={e => setExerciseForm({ ...exerciseForm, note: e.target.value })}
              className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none resize-none h-20"
              placeholder="Dicas de execução..."
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              {editingExerciseId ? 'Salvar Alterações' : 'Criar Exercício'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CATEGORY MANAGER (With Groups & Schedule) */}
      <Modal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        title="Gerenciar Categorias"
      >
          <div className="space-y-6">
              {/* Schedule Section */}
              <div className="bg-zinc-800/30 p-4 rounded-xl border border-white/5 space-y-3">
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Agendamento de Grupos</h3>
                  <div className="grid grid-cols-2 gap-2">
                      {GROUP_IDS.map(group => (
                          <div key={group} className="flex items-center gap-2">
                              <span className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded text-xs font-bold text-white">{group}</span>
                              <select 
                                value={settings.groupSchedule[group] || ''}
                                onChange={(e) => handleScheduleChange(group, e.target.value)}
                                className="flex-1 bg-black/20 border border-zinc-700 rounded text-xs py-1 px-2 text-zinc-300 focus:border-blue-500 outline-none"
                              >
                                  <option value="">Sem dia fixo</option>
                                  {WEEKDAYS_EN.map(day => (
                                      <option key={day} value={day}>{WEEKDAYS_PT[day]}</option>
                                  ))}
                              </select>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Add Category */}
              <form onSubmit={handleAddCategory} className="space-y-2">
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Nome da Categoria..."
                        className="flex-1 bg-black/20 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                      <select 
                        value={newCategoryGroup}
                        onChange={e => setNewCategoryGroup(e.target.value as GroupId)}
                        className="w-20 bg-black/20 border border-zinc-700 rounded-xl px-2 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none text-center"
                      >
                          {GROUP_IDS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <Button type="submit" disabled={!newCategoryName.trim()} className="px-3">
                          <Plus size={20} />
                      </Button>
                  </div>
                  <p className="text-[10px] text-zinc-500">Selecione o Grupo (A-F) para organizar a categoria.</p>
              </form>

              {/* List Categories */}
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-white/5">
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">{cat.group || '?'}</span>
                              <span className="text-white font-medium text-sm">{cat.name}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-zinc-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      </Modal>
    </div>
  );
};
