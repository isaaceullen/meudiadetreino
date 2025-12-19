
import React, { useState } from 'react';
import { Home, Dumbbell, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { useWorkoutManager } from './hooks/useWorkoutManager';
import { HomeScreen } from './screens/HomeScreen';
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ExercisesScreen } from './screens/ExercisesScreen';
import { ConfigScreen } from './screens/ConfigScreen';
import { CustomDialog } from './components/CustomDialog';

type Screen = 'home' | 'exercises' | 'history' | 'settings';

const App: React.FC = () => {
  const workoutManager = useWorkoutManager();
  const [activeTab, setActiveTab] = useState<Screen>('home');

  if (workoutManager.activeDraft) {
    return (
      <>
        <ActiveWorkoutScreen manager={workoutManager} />
        <CustomDialog {...workoutManager.dialog} />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen manager={workoutManager} />;
      case 'exercises': return <ExercisesScreen manager={workoutManager} />;
      case 'history': return <HistoryScreen manager={workoutManager} />;
      case 'settings': return <ConfigScreen manager={workoutManager} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col max-w-lg mx-auto border-x border-zinc-900 shadow-2xl relative">
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-2xl border-t border-zinc-900 max-w-lg mx-auto z-50">
        <div className="flex justify-around items-center h-20 px-4">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Home size={22} />} 
            label="Início" 
          />
          <NavButton 
            active={activeTab === 'exercises'} 
            onClick={() => setActiveTab('exercises')} 
            icon={<Dumbbell size={22} />} 
            label="Acervo" 
          />
          <NavButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<Calendar size={22} />} 
            label="Evolução" 
          />
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<SettingsIcon size={22} />} 
            label="Ajustes" 
          />
        </div>
      </nav>

      <CustomDialog {...workoutManager.dialog} />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-blue-500 scale-110' : 'text-zinc-600'}`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
