
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { WorkoutLog, GROUPS } from '../types';

export const ProgressScreen: React.FC<{ app: any }> = ({ app }) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const loggedDays = useMemo(() => {
    return app.state.logs.map((l: WorkoutLog) => l.date);
  }, [app.state.logs]);

  // Volume Data for Chart
  const volumeData = useMemo(() => {
    return app.state.logs.slice(-10).map((l: WorkoutLog) => {
      const volume = l.completedExercises.reduce((acc, id) => {
        const ex = app.state.exercises.find((e: any) => e.id === id);
        return acc + (ex ? ex.load * ex.sets * ex.reps : 0);
      }, 0);
      return { date: l.date.split('-').slice(1).join('/'), volume };
    });
  }, [app.state.logs, app.state.exercises]);

  // Category Distribution for Pie Chart
  const splitData = useMemo(() => {
    const counts: any = {};
    app.state.logs.forEach((l: WorkoutLog) => {
      counts[l.groupLetter] = (counts[l.groupLetter] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: `Treino ${key}`, value: counts[key] }));
  }, [app.state.logs]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-4 pt-10 pb-32">
      <h2 className="text-3xl font-black italic uppercase mb-8 px-2">Evolução</h2>

      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 text-center">Calendário de Consistência</h3>
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
            <span key={d} className="text-[10px] font-black text-zinc-700">{d}</span>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${(month+1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
            const isLogged = loggedDays.includes(dateStr);
            return (
              <div key={i} className="flex items-center justify-center relative py-1">
                <span className={`text-sm font-black italic ${isLogged ? 'text-white' : 'text-zinc-800'}`}>{dayNum}</span>
                {isLogged && <div className="absolute inset-0 bg-green-500/20 rounded-full border border-green-500/50 scale-125 z-[-1]" />}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8 h-80">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Volume de Treino (kg)</h3>
        {volumeData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-700 italic text-sm">Dados insuficientes para gerar gráficos.</div>
        )}
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-80">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Distribuição por Grupo</h3>
        {splitData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={splitData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                {splitData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-700 italic text-sm">Finalize seu primeiro treino!</div>
        )}
      </section>
    </div>
  );
};
