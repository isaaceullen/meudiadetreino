
import React, { useEffect, useState } from 'react';
import { Dumbbell, LayoutDashboard, Settings as SettingsIcon, TrendingUp } from 'lucide-react';
import { Dashboard } from './views/Dashboard';
import { Exercises } from './views/Exercises';
import { Settings } from './views/Settings';
import { Progress } from './views/Progress';
import { AppState, Tab, WorkoutSession, Exercise, Category, GroupId } from './types';
import { generateId } from './utils/helpers';

const STORAGE_KEY = 'meudiadetreino_v2';

// Categorias padrão com Grupos já atribuídos para demonstração
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_chest', name: 'Peito', isDefault: true, group: 'A' },
  { id: 'cat_triceps', name: 'Tríceps', isDefault: true, group: 'A' },
  { id: 'cat_back', name: 'Costas', isDefault: true, group: 'B' },
  { id: 'cat_biceps', name: 'Bíceps', isDefault: true, group: 'B' },
  { id: 'cat_legs', name: 'Pernas', isDefault: true, group: 'C' },
  { id: 'cat_shoulders', name: 'Ombros', isDefault: true, group: 'C' },
  { id: 'cat_abs', name: 'Abdômen', isDefault: true, group: 'D' },
  { id: 'cat_cardio', name: 'Cardio', isDefault: true, group: 'D' },
];

const INITIAL_STATE: AppState = {
  exercises: [],
  sessions: [],
  categories: DEFAULT_CATEGORIES,
  settings: {
    soundEnabled: true,
    restTimerDefault: 60,
    autoTimer: true,
    groupSchedule: {
      'A': 'Monday',
      'B': 'Tuesday',
      'C': 'Wednesday',
      'D': 'Thursday',
      'E': '',
      'F': ''
    }
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage and Migrate logic
  useEffect(() => {
    const oldStorage = localStorage.getItem('irontrack_v1');
    if (oldStorage) {
      localStorage.removeItem('irontrack_v1');
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // MIGRATION LOGIC: Ensure new fields exist
        const mergedCategories = (parsed.categories || DEFAULT_CATEGORIES).map((c: Category) => ({
             ...c,
             // Se não tiver grupo (migração de v1), atribui um aleatório ou default
             group: c.group || 'A' 
        }));

        const mergedSettings = {
            ...INITIAL_STATE.settings,
            ...parsed.settings,
            groupSchedule: parsed.settings?.groupSchedule || INITIAL_STATE.settings.groupSchedule
        };

        const mergedState = {
            ...INITIAL_STATE,
            ...parsed,
            categories: mergedCategories,
            settings: mergedSettings,
        };
        setState(mergedState);
      } catch (e) {
        console.error("Failed to parse storage", e);
        setState(INITIAL_STATE);
      }
    } else {
        setState(INITIAL_STATE);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const handleUpdateExercises = (newExercises: Exercise[]) => {
    setState(prev => ({ ...prev, exercises: newExercises }));
  };

  const handleUpdateCategories = (newCategories: Category[]) => {
    setState(prev => ({ ...prev, categories: newCategories }));
  };

  const handleUpdateSettings = (newSettings: AppState['settings']) => {
      setState(prev => ({ ...prev, settings: newSettings }));
  };

  const handleSaveSession = (session: WorkoutSession) => {
    setState(prev => {
      const existingIdx = prev.sessions.findIndex(s => s.id === session.id);
      let newSessions = [...prev.sessions];
      if (existingIdx >= 0) {
        newSessions[existingIdx] = session;
      } else {
        newSessions.push(session);
      }
      return { ...prev, sessions: newSessions };
    });
  };

  const handleImport = (newState: AppState) => {
    if (!newState.categories) {
        newState.categories = DEFAULT_CATEGORIES;
    }
    setState(newState);
  };

  const handleReset = () => {
    if(confirm('Deletar permanentemente todos os dados?')) {
        setState(INITIAL_STATE);
        localStorage.removeItem(STORAGE_KEY);
        setTimeout(() => {
          window.location.reload();
        }, 100);
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background text-zinc-100 font-sans selection:bg-blue-500/30">
      
      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto min-h-screen relative px-4 pb-24 pt-safe">
        {activeTab === 'dashboard' && (
          <Dashboard 
            exercises={state.exercises} 
            categories={state.categories}
            sessions={state.sessions} 
            settings={state.settings}
            onSaveSession={handleSaveSession}
          />
        )}
        {activeTab === 'exercises' && (
          <Exercises 
            exercises={state.exercises} 
            categories={state.categories}
            settings={state.settings}
            onUpdateExercises={handleUpdateExercises} 
            onUpdateCategories={handleUpdateCategories}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
        {activeTab === 'progress' && (
            <Progress sessions={state.sessions} exercises={state.exercises} categories={state.categories} />
        )}
        {activeTab === 'settings' && (
          <Settings 
            fullState={state} 
            onUpdateSettings={handleUpdateSettings}
            onImport={handleImport}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-surface/80 backdrop-blur-xl border-t border-white/5 pb-safe z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-2">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard size={24} />} 
            label="Hoje" 
          />
          <NavButton 
            active={activeTab === 'exercises'} 
            onClick={() => setActiveTab('exercises')} 
            icon={<Dumbbell size={24} />} 
            label="Exercícios" 
          />
          <NavButton 
            active={activeTab === 'progress'} 
            onClick={() => setActiveTab('progress')} 
            icon={<TrendingUp size={24} />} 
            label="Progresso" 
          />
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<SettingsIcon size={24} />} 
            label="Ajustes" 
          />
        </div>
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
      active ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
        {icon}
    </div>
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;
