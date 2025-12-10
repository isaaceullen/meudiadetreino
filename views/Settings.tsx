import React, { useRef } from 'react';
import { Download, Upload, Trash, Database, Timer } from 'lucide-react';
import { AppState } from '../types';
import { Button } from '../components/ui/Button';

interface SettingsProps {
  fullState: AppState;
  onUpdateSettings: (settings: AppState['settings']) => void;
  onImport: (state: AppState) => void;
  onReset: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ fullState, onUpdateSettings, onImport, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(fullState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `meudiadetreino-backup-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('Isso substituirá seus dados atuais. Tem certeza?')) {
            onImport(json);
            alert('Dados importados com sucesso!');
        }
      } catch (err) {
        alert('Arquivo JSON inválido');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 bg-background/95 backdrop-blur-md z-10 py-4 -mx-4 px-4 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
      </div>

      {/* Preferences Section */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-4 mb-2">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                <Timer size={24} />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white">Preferências</h3>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl border border-white/5">
              <div>
                  <div className="text-sm font-medium text-white">Timer Automático</div>
                  <div className="text-xs text-zinc-500">Abrir timer ao marcar série como feita</div>
              </div>
              <button 
                onClick={() => onUpdateSettings({ ...fullState.settings, autoTimer: !fullState.settings.autoTimer })}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${fullState.settings.autoTimer ? 'bg-blue-600' : 'bg-zinc-700'}`}
              >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${fullState.settings.autoTimer ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
          </div>
      </div>

      {/* Data Section */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Dados</h3>
            <p className="text-sm text-zinc-400 mt-1">Backup e restauração.</p>
          </div>
        </div>

        <div className="grid gap-3">
          <Button onClick={handleExport} variant="secondary" className="w-full justify-start h-14">
            <Download size={20} className="mr-3 text-zinc-400" />
            <div className="text-left">
                <div className="text-white font-medium">Exportar Dados</div>
                <div className="text-xs text-zinc-500">Baixar JSON</div>
            </div>
          </Button>

          <Button onClick={handleImportClick} variant="secondary" className="w-full justify-start h-14">
            <Upload size={20} className="mr-3 text-zinc-400" />
            <div className="text-left">
                <div className="text-white font-medium">Importar Dados</div>
                <div className="text-xs text-zinc-500">Restaurar JSON</div>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                className="hidden" 
            />
          </Button>
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-rose-500 mb-2">Zona de Perigo</h3>
        <Button onClick={() => { if(confirm('Deletar permanentemente todos os dados?')) onReset() }} variant="danger" className="w-full">
            <Trash size={18} className="mr-2" /> Resetar Tudo
        </Button>
      </div>
    </div>
  );
};