
import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, X } from 'lucide-react';

interface CustomDialogProps {
  isOpen: boolean;
  type: 'alert' | 'confirm';
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({ 
  isOpen, type, title, message, onConfirm, onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg ${
            type === 'confirm' ? 'bg-blue-600/20 text-blue-500' : 'bg-red-600/20 text-red-500'
          }`}>
            {type === 'confirm' ? <HelpCircle size={32} /> : <AlertCircle size={32} />}
          </div>
          
          <h3 className="text-xl font-black italic uppercase text-white mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">{message}</p>
          
          <div className="flex gap-3 w-full">
            {type === 'confirm' && (
              <button 
                onClick={onCancel}
                className="flex-1 bg-zinc-800 text-zinc-400 font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl active:scale-95 transition-all"
              >
                Cancelar
              </button>
            )}
            <button 
              onClick={onConfirm}
              className={`flex-1 font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl active:scale-95 transition-all ${
                type === 'confirm' ? 'bg-blue-600 text-white' : 'bg-white text-black'
              }`}
            >
              {type === 'confirm' ? 'Confirmar' : 'Entendido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
