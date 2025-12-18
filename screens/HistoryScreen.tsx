
import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, X, Clock, Dumbbell, Activity } from 'lucide-react';

export const HistoryScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { state } = manager;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const getSessionsForDay = (date: Date) => {
    return (state.sessions || []).filter((s: any) => isSameDay(parseISO(s.date), date));
  };

  const chartData = useMemo(() => {
    return (state.sessions || []).slice(-7).map((s: any) => ({
      date: format(parseISO(s.date), 'dd/MM'),
      volume: s.volume
    }));
  }, [state.sessions]);

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-32">
        <header className="flex justify-between items-center pt-4">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Evolução</h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl transition-colors active:bg-zinc-800"><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl transition-colors active:bg-zinc-800"><ChevronRight size={20}/></button>
          </div>
        </header>

        <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 shadow-xl">
          <h3 className="text-xs font-black uppercase italic text-blue-500 mb-6 text-center">
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
                  disabled={!hasWorkout}
                  onClick={() => setSelectedSession(daySessions[0])}
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

        <section className="space-y-4">
          <div className="flex items-center gap-2 ml-2">
            <Activity size={16} className="text-blue-500" />
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Progressão de Volume</h3>
          </div>
          <div className="h-56 w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Bar dataKey="volume" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '12px' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-700 italic text-sm">Ainda sem dados para o gráfico</div>
            )}
          </div>
        </section>

        {selectedSession && (
          <div className="fixed inset-0 bg-black/95 z-[100] p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom duration-300">
            <div className="max-w-md mx-auto py-10 pb-32">
              <header className="flex justify-between items-center mb-10">
                <div>
                  <span className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] mb-1 block">Relatório de Combate</span>
                  <h3 className="text-3xl font-black italic uppercase text-white">
                    {format(parseISO(selectedSession.date), "dd 'de' MMMM", { locale: ptBR })}
                  </h3>
                </div>
                <button onClick={() => setSelectedSession(null)} className="p-4 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] text-zinc-500"><X size={24}/></button>
              </header>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem]">
                  <Clock size={16} className="text-blue-500 mb-2" />
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Tempo</p>
                  <p className="font-black italic text-lg text-white">{selectedSession.durationMinutes} min</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem]">
                  <Dumbbell size={16} className="text-blue-500 mb-2" />
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Volume</p>
                  <p className="font-black italic text-lg text-white">{selectedSession.volume} kg</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Detalhamento por Exercício</h4>
                  <div className="space-y-8">
                    {selectedSession.details.map((d: any, i: number) => (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                           <p className="font-black text-lg text-white italic uppercase tracking-tight leading-none">{d.exerciseName}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2 pl-4">
                          {d.series.map((s: any, sIdx: number) => (
                            <div key={sIdx} className="bg-zinc-800/40 border border-zinc-800 p-3 rounded-2xl flex justify-between items-center">
                              <span className="text-[10px] font-black text-zinc-600 uppercase">Série {sIdx + 1}</span>
                              <div className="flex gap-4">
                                <span className="text-xs font-black text-white">{s.load}kg</span>
                                <span className="text-xs font-black text-blue-500">{s.reps} reps</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSession.notes && (
                  <div className="bg-blue-600/5 border border-blue-600/20 rounded-[2rem] p-8">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Reflexões</h4>
                    <p className="text-sm italic text-zinc-300 leading-relaxed font-medium">"{selectedSession.notes}"</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setSelectedSession(null)}
                className="w-full mt-10 bg-zinc-900 border border-zinc-800 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest text-zinc-500"
              >
                Fechar Histórico
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
