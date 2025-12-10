
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { WorkoutSession, Exercise, SessionExercise, Category } from '../types';
import { ChevronLeft, ChevronRight, Activity, CheckCircle, FileText, Clock } from 'lucide-react';
import { formatDuration } from '../utils/helpers';

interface ProgressProps {
  sessions: WorkoutSession[];
  exercises: Exercise[];
  categories: Category[];
}

type ChartMode = 'general' | 'exercise' | 'category';
type CalendarMode = 'monthly' | 'annual';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const Progress: React.FC<ProgressProps> = ({ sessions, exercises, categories }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [chartMode, setChartMode] = useState<ChartMode>('general');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('monthly');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(exercises[0]?.id || '');

  // --- CALENDAR LOGIC (MONTHLY) ---
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const sessionMap = useMemo(() => {
    const map = new Map<string, WorkoutSession>();
    sessions.forEach(s => map.set(s.date, s));
    return map;
  }, [sessions]);

  // Annual Stats
  const annualStats = useMemo(() => {
      const year = currentDate.getFullYear();
      const stats = Array(12).fill(0);
      let totalAnnual = 0;
      sessions.forEach(s => {
          const d = new Date(s.date);
          if (d.getFullYear() === year) {
              stats[d.getMonth()]++;
              totalAnnual++;
          }
      });
      return { monthlyCounts: stats, total: totalAnnual };
  }, [sessions, currentDate]);

  // Monthly Duration Stat
  const monthlyTotalDuration = useMemo(() => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      let totalMs = 0;
      sessions.forEach(s => {
          const d = new Date(s.date);
          if (d.getFullYear() === year && d.getMonth() === month) {
              if (s.endTime && s.startTime) {
                  totalMs += (s.endTime - s.startTime);
              }
          }
      });
      return totalMs;
  }, [sessions, currentDate]);

  const prevDate = () => {
      if (calendarMode === 'monthly') {
          setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      } else {
          setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
      }
  };
  
  const nextDate = () => {
      if (calendarMode === 'monthly') {
          setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      } else {
          setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
      }
  };

  const handleDayClick = (dateStr: string) => {
      setSelectedDateKey(dateStr);
  };

  let daysWentMonth = 0;
  if (calendarMode === 'monthly') {
      daysInMonth.forEach(date => {
          const dateStr = date.toISOString().split('T')[0];
          if (sessionMap.has(dateStr)) daysWentMonth++;
      });
  }

  // --- CHART DATA GENERATION ---
  const generalData = useMemo(() => {
    return sessions
        .sort((a,b) => a.date.localeCompare(b.date))
        .slice(-14)
        .map(session => {
            let totalVolume = 0;
            const exercisesList = Object.values(session.exercises) as SessionExercise[];
            exercisesList.forEach((ex) => {
                ex.sets.forEach(s => { if (s.completed) totalVolume += (s.weight * s.reps); });
            });
            return {
                date: new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                volume: totalVolume,
            };
        });
  }, [sessions]);

  const exerciseData = useMemo(() => {
    if (!selectedExerciseId) return [];
    return sessions
        .filter(s => s.exercises[selectedExerciseId])
        .sort((a,b) => a.date.localeCompare(b.date))
        .map(s => {
            const exData = s.exercises[selectedExerciseId] as SessionExercise;
            const maxWeight = Math.max(...exData.sets.filter(s => s.completed).map(set => set.weight || 0), 0);
            return {
                date: new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                weight: maxWeight
            };
        });
  }, [sessions, selectedExerciseId]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => {
        Object.keys(s.exercises).forEach(exId => {
            const exerciseDef = exercises.find(e => e.id === exId);
            if (exerciseDef) {
                const category = categories.find(c => c.id === exerciseDef.categoryId);
                const catName = category ? category.name : 'Outros';
                const exData = s.exercises[exId] as SessionExercise;
                const setsCount = exData.sets.filter(x => x.completed).length;
                counts[catName] = (counts[catName] || 0) + setsCount;
            }
        });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [sessions, exercises, categories]);

  // Render Session Details
  const renderSessionDetails = () => {
      if (!selectedDateKey) return null;
      const session = sessionMap.get(selectedDateKey);
      
      if (!session) {
          return (
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 text-center text-zinc-500 text-sm">
                  Nenhum treino registrado em {new Date(selectedDateKey).toLocaleDateString('pt-BR')}
              </div>
          );
      }

      let totalSets = 0;
      let totalVolume = 0;
      Object.values(session.exercises).forEach((ex: SessionExercise) => {
          ex.sets.forEach(s => {
              if (s.completed) {
                  totalSets++;
                  totalVolume += s.weight * s.reps;
              }
          });
      });
      
      const duration = (session.endTime && session.startTime) ? (session.endTime - session.startTime) : 0;

      return (
          <div className="bg-zinc-800/50 rounded-xl border border-white/5 p-4 space-y-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="font-semibold text-white">Treino de {new Date(selectedDateKey).toLocaleDateString('pt-BR')}</h3>
                      <div className="text-xs text-zinc-400 mt-1 flex gap-3 items-center">
                          <span>{totalSets} Séries</span>
                          <span>{(totalVolume/1000).toFixed(1)}k Vol</span>
                          {duration > 0 && (
                            <span className="flex items-center gap-1"><Clock size={10} /> {formatDuration(duration)}</span>
                          )}
                      </div>
                  </div>
                  <div className="bg-green-500/10 text-green-400 p-2 rounded-lg">
                      <CheckCircle size={20} />
                  </div>
              </div>
              
              {session.note ? (
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
                          <FileText size={12} /> Nota do Treino:
                      </div>
                      <p className="text-sm text-zinc-200 whitespace-pre-wrap">{session.note}</p>
                  </div>
              ) : (
                  <div className="text-xs text-zinc-500 italic">Sem notas para este treino.</div>
              )}
          </div>
      );
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 -mx-4 px-4 border-b border-white/5 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Progresso</h1>
        <div className="flex bg-zinc-800 rounded-lg p-1">
            <button 
                onClick={() => setCalendarMode('monthly')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${calendarMode === 'monthly' ? 'bg-zinc-600 text-white' : 'text-zinc-400'}`}
            >Mensal</button>
            <button 
                onClick={() => setCalendarMode('annual')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${calendarMode === 'annual' ? 'bg-zinc-600 text-white' : 'text-zinc-400'}`}
            >Anual</button>
        </div>
      </div>

      {/* --- CALENDAR SECTION --- */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-white/5">
            <button onClick={prevDate} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft size={20} className="text-zinc-400" /></button>
            <h2 className="text-lg font-semibold text-white capitalize">
                {calendarMode === 'monthly' 
                    ? currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                    : currentDate.getFullYear()
                }
            </h2>
            <button onClick={nextDate} className="p-2 hover:bg-white/5 rounded-full"><ChevronRight size={20} className="text-zinc-400" /></button>
        </div>
        
        <div className="p-4">
            {calendarMode === 'monthly' ? (
                <>
                    <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                        {['D','S','T','Q','Q','S','S'].map((d, i) => (
                            <div key={i} className="text-[10px] text-zinc-500 font-bold">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        
                        {daysInMonth.map((date) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const hasWorkout = sessionMap.has(dateStr);
                            const isSelected = selectedDateKey === dateStr;
                            const isToday = new Date().toISOString().split('T')[0] === dateStr;

                            let statusClass = 'bg-zinc-800/30 text-zinc-600 border-transparent';
                            if (hasWorkout) {
                                statusClass = 'bg-green-500/20 text-green-400 border-green-500/30';
                            }
                            if (isSelected) {
                                statusClass += ' ring-2 ring-white ring-offset-2 ring-offset-surface z-10';
                            } else if (isToday) {
                                statusClass += ' ring-2 ring-blue-500 ring-offset-2 ring-offset-surface';
                            }

                            return (
                                <button 
                                    key={dateStr} 
                                    onClick={() => handleDayClick(dateStr)}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium relative border transition-all hover:scale-105 active:scale-95
                                        ${statusClass}
                                    `}
                                >
                                    {date.getDate()}
                                    {hasWorkout && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500"></div>}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* DETAILS SECTION BELOW CALENDAR */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                        {renderSessionDetails()}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 px-2">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-xs text-zinc-300"><strong>{daysWentMonth}</strong> treinos</span>
                        </div>
                        {monthlyTotalDuration > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Clock size={16} className="text-blue-500" />
                                <span className="text-xs text-zinc-300">Tempo Total: <strong>{formatDuration(monthlyTotalDuration)}</strong></span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                // ANNUAL VIEW
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {MONTHS_PT.map((month, idx) => {
                            const count = annualStats.monthlyCounts[idx];
                            const isCurrentMonth = new Date().getMonth() === idx && new Date().getFullYear() === currentDate.getFullYear();
                            
                            return (
                                <div key={month} className={`p-2 rounded-xl border flex flex-col items-center justify-center h-20 ${isCurrentMonth ? 'bg-zinc-800 border-blue-500/50' : 'bg-zinc-900/50 border-white/5'}`}>
                                    <span className={`text-[10px] uppercase font-bold mb-1 ${isCurrentMonth ? 'text-blue-400' : 'text-zinc-500'}`}>{month.slice(0,3)}</span>
                                    <span className={`text-xl font-bold ${count > 0 ? 'text-green-400' : 'text-zinc-600'}`}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5 text-center">
                         <span className="text-sm text-zinc-400 uppercase tracking-wider">Total em {currentDate.getFullYear()}</span>
                         <div className="text-3xl font-bold text-white mt-1">{annualStats.total} <span className="text-sm text-zinc-500 font-normal">treinos</span></div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="bg-surface border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            <button 
                onClick={() => setChartMode('general')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${chartMode === 'general' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-zinc-700 text-zinc-400 hover:text-white'}`}
            >
                Volume Geral
            </button>
            <button 
                onClick={() => setChartMode('exercise')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${chartMode === 'exercise' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-zinc-700 text-zinc-400 hover:text-white'}`}
            >
                Por Carga
            </button>
            <button 
                onClick={() => setChartMode('category')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${chartMode === 'category' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-zinc-700 text-zinc-400 hover:text-white'}`}
            >
                Por Categoria
            </button>
        </div>

        <div className="h-64 w-full">
            {chartMode === 'general' && (
                <div className="h-full">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><Activity size={16} /> Volume Total (kg levantados)</h3>
                    {generalData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={generalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', fontSize: '12px' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-zinc-500 text-sm">Realize mais treinos para ver dados.</div>}
                </div>
            )}
            
            {/* Same charts as before for exercise/category... */}
            {chartMode === 'exercise' && (
                <div className="h-full flex flex-col">
                    <div className="mb-4">
                        <select 
                            className="w-full bg-black/20 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                            value={selectedExerciseId}
                            onChange={(e) => setSelectedExerciseId(e.target.value)}
                        >
                            {exercises.length === 0 && <option>Nenhum exercício cadastrado</option>}
                            {exercises.map(ex => (
                                <option key={ex.id} value={ex.id}>{ex.name}</option>
                            ))}
                        </select>
                    </div>
                    {exerciseData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="80%">
                            <LineChart data={exerciseData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'auto']} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', fontSize: '12px' }}
                                />
                                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{r:3}} activeDot={{r:5}} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-zinc-500 text-sm p-4 text-center">Necessário registrar cargas em pelo menos 2 dias diferentes para este exercício.</div>}
                </div>
            )}

            {chartMode === 'category' && (
                <div className="h-full flex items-center justify-center">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-zinc-500 text-sm">Sem dados de categoria.</div>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
