import React, { useState } from 'react';
import { Trash2, Edit2, Plus, Dumbbell, Settings2, X } from 'lucide-react';
import { Exercise, Category } from '../types';
import { generateId } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

interface ExercisesProps {
  exercises: Exercise[];
  categories: Category[];
  onUpdateExercises: (exercises: Exercise[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
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

export const Exercises: React.FC<ExercisesProps> = ({ exercises, categories, onUpdateExercises, onUpdateCategories }) => {
  // Exercise Modal State
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseForm, setExerciseForm] = useState<Omit<Exercise, 'id'>>(INITIAL_FORM);

  // Category Management State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

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
      // Auto select first category if exists
      setExerciseForm({ ...INITIAL_FORM, categoryId: categories[0]?.id || '' });
      setIsExerciseModalOpen(true);
  };

  // --- Category Handlers ---

  const handleAddCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategoryName.trim()) return;
      onUpdateCategories([...categories, { id: generateId(), name: newCategoryName.trim(), isDefault: false }]);
      setNewCategoryName('');
  };

  const handleDeleteCategory = (id: string) => {
      const linkedExercises = exercises.filter(ex => ex.categoryId === id);
      
      if (linkedExercises.length > 0) {
          const confirmMessage = `Esta categoria possui ${linkedExercises.length} exercícios vinculados.\n\nAo excluir a categoria, esses exercícios também serão excluídos permanentemente.\n\nDeseja continuar?`;
          if (!confirm(confirmMessage)) {
              return;
          }
          // Remove exercises linked to this category
          onUpdateExercises(exercises.filter(ex => ex.categoryId !== id));
      } else {
          if (!confirm('Tem certeza que deseja remover esta categoria?')) {
              return;
          }
      }

      onUpdateCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-10 py-4 -mx-4 px-4 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">Exercícios</h1>
        <div className="flex gap-2">
            <Button onClick={() => setIsCategoryManagerOpen(true)} variant="secondary" size="sm">
                <Settings2 size={18} />
            </Button>
            <Button onClick={openNewExerciseModal} size="sm">
                <Plus size={18} className="mr-2" /> Novo
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {exercises.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl">
                <Dumbbell className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
                <p className="text-zinc-500">Nenhum exercício ainda. Adicione um para começar!</p>
            </div>
        )}
        {/* Group by category for cleaner display list */}
        {categories.map(cat => {
            const catExercises = exercises.filter(ex => ex.categoryId === cat.id);
            if (catExercises.length === 0) return null;
            
            return (
                <div key={cat.id} className="space-y-2">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider px-2">{cat.name}</h3>
                    {catExercises.map(ex => (
                        <div key={ex.id} className="bg-surface border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-sm hover:border-white/10 transition-colors">
                            <div>
                                <h3 className="font-semibold text-white">{ex.name}</h3>
                                <p className="text-sm text-zinc-400">{ex.targetSets} séries × {ex.targetReps} reps • {ex.equipment}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditExercise(ex)} className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDeleteExercise(ex.id)} className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )
        })}
        {/* Uncategorized fall back */}
        {exercises.filter(ex => !categories.find(c => c.id === ex.categoryId)).length > 0 && (
             <div className="space-y-2">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider px-2">Sem Categoria</h3>
                {exercises.filter(ex => !categories.find(c => c.id === ex.categoryId)).map(ex => (
                    <div key={ex.id} className="bg-surface border border-white/5 p-4 rounded-xl flex items-center justify-between">
                         <div><h3 className="font-semibold text-white">{ex.name}</h3></div>
                         <div className="flex gap-2">
                                <button onClick={() => handleEditExercise(ex)} className="p-2 text-zinc-400 hover:text-blue-400"><Edit2 size={18} /></button>
                                <button onClick={() => handleDeleteExercise(ex.id)} className="p-2 text-zinc-400 hover:text-rose-400"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
             </div>
        )}
      </div>

      {/* CREATE/EDIT EXERCISE MODAL */}
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
              className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Ex: Supino Reto"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Categoria</label>
            <select
                required
                value={exerciseForm.categoryId}
                onChange={e => setExerciseForm({ ...exerciseForm, categoryId: e.target.value })}
                className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
                <option value="" disabled>Selecione uma categoria</option>
                {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>

          <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Equipamento</label>
              <input 
              value={exerciseForm.equipment}
              onChange={e => setExerciseForm({ ...exerciseForm, equipment: e.target.value })}
              className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">URL do Vídeo (Opcional)</label>
            <input 
              type="url"
              value={exerciseForm.videoUrl}
              onChange={e => setExerciseForm({ ...exerciseForm, videoUrl: e.target.value })}
              className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="https://youtube.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nota (Opcional)</label>
            <textarea 
              value={exerciseForm.note || ''}
              onChange={e => setExerciseForm({ ...exerciseForm, note: e.target.value })}
              className="w-full bg-black/20 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none h-20"
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

      {/* CATEGORY MANAGER MODAL */}
      <Modal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        title="Gerenciar Categorias"
      >
          <div className="space-y-6">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Nova categoria..."
                    className="flex-1 bg-black/20 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <Button type="submit" disabled={!newCategoryName.trim()}>
                      <Plus size={20} />
                  </Button>
              </form>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-white/5">
                          <span className="text-white font-medium">{cat.name}</span>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-zinc-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir categoria"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      </Modal>
    </div>
  );
};