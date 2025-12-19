
import React, { useRef } from 'react';
import { AppState } from '../types';
import { Download, Upload, Trash2, ShieldAlert, Github, Info } from 'lucide-react';

interface SettingsProps {
  data: AppState;
  onImport: (data: AppState) => void;
  onReset: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ data, onImport, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meudiadetreino-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImport(json);
        alert('Dados importados com sucesso!');
      } catch (err) {
        alert('Erro ao importar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-8 pb-24">
      <h2 className="text-2xl font-bold text-white">Configurações</h2>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Backup e Dados</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <button 
            onClick={handleExport}
            className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800 transition-colors text-white border-b border-zinc-800"
          >
            <Download size={20} className="text-blue-500" />
            <div className="text-left">
              <p className="font-bold">Exportar JSON</p>
              <p className="text-xs text-zinc-500">Salve seu progresso em um arquivo.</p>
            </div>
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800 transition-colors text-white border-b border-zinc-800"
          >
            <Upload size={20} className="text-purple-500" />
            <div className="text-left">
              <p className="font-bold">Importar JSON</p>
              <p className="text-xs text-zinc-500">Restaurar dados de um backup anterior.</p>
            </div>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />

          <button 
            onClick={() => { if(confirm('Tem certeza? Isso apagará todo seu progresso.')) onReset(); }}
            className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800 transition-colors text-red-500"
          >
            <Trash2 size={20} />
            <div className="text-left">
              <p className="font-bold">Limpar Tudo</p>
              <p className="text-xs text-zinc-600">Redefine o app para os dados iniciais.</p>
            </div>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sobre o App</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-800 p-3 rounded-xl">
              <Info size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Meu Dia de Treino</p>
              <p className="text-xs text-zinc-500">Versão 2.0.0 (2025)</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Desenvolvido para entusiastas do fitness que buscam simplicidade e eficácia no controle de seus treinos diários.
          </p>
          <div className="pt-2 border-t border-zinc-800 flex justify-between">
            <a href="#" className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors">
              <Github size={14} /> GitHub Repo
            </a>
            <span className="text-xs text-zinc-700">Privacidade • Termos</span>
          </div>
        </div>
      </section>

      <div className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-4 flex gap-3">
        <ShieldAlert size={20} className="text-blue-500 shrink-0" />
        <p className="text-xs text-blue-400">
          Seus dados são armazenados localmente no seu dispositivo e nunca saem daqui. Lembre-se de exportar backups regularmente!
        </p>
      </div>

      <div className="text-center py-6">
          <h4 className="text-sm font-bold text-white mb-2">Deseja instalar na Tela Inicial?</h4>
          <ol className="text-[10px] text-zinc-500 space-y-1">
            <li>1. No Safari/Chrome, toque em "Compartilhar" (Ícone <Upload size={10} className="inline"/>)</li>
            <li>2. Role para baixo e escolha "Adicionar à Tela de Início"</li>
            <li>3. O app aparecerá como um app nativo!</li>
          </ol>
      </div>
    </div>
  );
};
