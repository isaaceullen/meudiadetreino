
import React, { useState, useMemo } from 'react';
import { 
  format, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  endOfWeek, 
  startOfMonth, 
  parseISO, 
  startOfWeek 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { ChevronLeft, ChevronRight, X, Clock, Dumbbell, Activity, TrendingUp, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const SessionAccordion: React.FC<{ session: any; index: number; onDelete: (id: string) => void }> = ({ session, index, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden transition-all">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 flex justify-between items-center cursor-pointer active:bg-zinc-800"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 font-black italic">
            {index + 1}
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sessão • {session.durationMinutes}min</p>
            <h4 className="text-lg font-black italic uppercase text-white leading-none">Split {session.groups.join(' + ')}</h4>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <div className="text-zinc-600">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
              <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Início</p>
              <p className="font-black italic text-sm text-white">{format(new Date(session.startTime), 'HH:mm')}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
              <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Volume</p>
              <p className="font-black italic text-sm text-white">{session.volume} kg</p>
            </div>
          </div>

          <div className="space-y-6">
            {session.details.map((d: any, i: number) => (
              <div key={i} className="space-y-2">
                <p className="font-black text-xs text-blue-500 italic uppercase tracking-tight">{d.exerciseName}</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {d.series.map((s: any, sIdx: number) => (
                    <div key={sIdx} className="bg-zinc-800/30 p-2.5 rounded-xl flex justify-between items-center text-[11px] font-black italic">
                      <span className="text-zinc-600">S{sIdx + 1}</span>
                      <div className="flex gap-3">
                        <span className="text-white">{s.load}kg</span>
                        <span className="text-blue-500">{s.reps} reps</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {session.notes && (
            <div className="mt-6 bg-blue-600/5 border border-blue-600/10 p-4 rounded-2xl">
              <p className="text-xs italic text-zinc-400">"{session.notes}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const HistoryScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { state, removeSession, showDialog } = manager;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentMonth)),
      end: endOfWeek(endOfMonth(currentMonth))
    });
  }, [currentMonth]);

  const getSessionsForDay = (date: Date) => {
    return (state.sessions || []).filter((s: any) => isSameDay(parseISO(s.date), date));
  };

  const selectedDaySessions = useMemo(() => {
    if (!selectedDay) return [];
    return getSessionsForDay(selectedDay);
  }, [selectedDay, state.sessions]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(state.exercises[0]?.id || '');

  const volumeChartData = useMemo(() => {
    return (state.sessions || []).slice(-7).map((s: any) => ({
      date: format(parseISO(s.date), 'dd/MM'),
      volume: s.volume
    }));
  }, [state.sessions]);

  const exerciseEvolutionData = useMemo(() => {
    if (!selectedExerciseId) return [];
    
    const relevantSessions = (state.sessions || [])
      .filter((s: any) => s.details.some((d: any) => d.exerciseId === selectedExerciseId))
      .map((s: any) => {
        const detail = s.details.find((d: any) => d.exerciseId === selectedExerciseId);
        return {
          date: format(parseISO(s.date), 'dd/MM'),
          load: detail?.series[0]?.load || 0
        };
      });
    
    return relevantSessions;
  }, [state.sessions, selectedExerciseId]);

  const handleDeleteSession = async (sessionId: string) => {
    const confirm = await showDialog('confirm', 'Excluir Treino?', 'Este registro será removido permanentemente.');
    if (confirm) {
      removeSession(sessionId);
    }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="p-6 space-y-10 animate-in fade-in duration-500 pb-32">
        <header className="flex justify-between items-center pt-4">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Evolução</h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl transition-colors active:bg-zinc-800"><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl transition-colors active:bg-zinc-800"><ChevronRight size={20}/></button>
          </div>
        </header>

        {/* CALENDÁRIO */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 shadow-xl">
          <h3 className="text-xs font-black uppercase italic text-blue-500 mb-6 text-center tracking-widest">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          
          <div className="grid grid-cols-7 gap-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-zinc-600 pb-2">{d}</div>
            ))}
            {monthDays.map((day, i) => {
              const daySessions = getSessionsForDay(day);
              const hasWorkout = daySessions.length > 0;
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              
              return (
                <button
                  key={i}
                  disabled={!hasWorkout && isCurrentMonth}
                  onClick={() => hasWorkout && setSelectedDay(day)}
                  className={`aspect-square rounded-full flex items-center justify-center text-xs font-black transition-all relative
                    ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                    ${hasWorkout ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-zinc-500 hover:bg-zinc-900'}
                  `}
                >
                  {format(day, 'd')}
                  {daySessions.length > 1 && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border border-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* EVOLUÇÃO POR EXERCÍCIO */}
        <section className="space-y-4">
          <div className="flex justify-between items-center ml-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Carga por Exercício</h3>
            </div>
            <select 
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-widest py-1 px-3 text-white outline-none"
            >
              {state.exercises.map((ex: any) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>
          <div className="h-56 w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5">
            {exerciseEvolutionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseEvolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} hide />
                  <YAxis stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="load" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-700 italic text-sm text-center px-6">
                Sem histórico disponível.
              </div>
            )}
          </div>
        </section>

        {/* VOLUME GERAL */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 ml-2">
            <Activity size={16} className="text-blue-500" />
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Volume Semanal</h3>
          </div>
          <div className="h-56 w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5">
            {volumeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData}>
                  <Bar dataKey="volume" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '12px' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-700 italic text-sm">Nenhum volume registrado.</div>
            )}
          </div>
        </section>

        {/* MODAL DE SESSÕES DO DIA */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black/95 z-[100] p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom duration-300">
            <div className="max-w-md mx-auto py-10 pb-32">
              <header className="flex justify-between items-center mb-8">
                <div>
                  <span className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] mb-1 block">Atividade Diária</span>
                  <h3 className="text-3xl font-black italic uppercase text-white">
                    {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                  </h3>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500"><X size={24}/></button>
              </header>

              <div className="space-y-4">
                {selectedDaySessions.length > 0 ? (
                  selectedDaySessions.map((session: any, idx: number) => (
                    <SessionAccordion 
                      key={session.id} 
                      session={session} 
                      index={idx} 
                      onDelete={handleDeleteSession} 
                    />
                  ))
                ) : (
                  <p className="text-center py-20 text-zinc-600 italic">Nenhum treino para este dia.</p>
                )}
              </div>
              
              <button 
                onClick={() => setSelectedDay(null)}
                className="w-full mt-10 bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
