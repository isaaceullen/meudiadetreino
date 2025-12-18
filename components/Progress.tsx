
import React, { useMemo, useState } from 'react';
import { WorkoutHistory, Exercise } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart2, PieChart as PieIcon } from 'lucide-react';

interface ProgressProps {
  history: WorkoutHistory[];
  exercises: Exercise[];
}

export const Progress: React.FC<ProgressProps> = ({ history, exercises }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(exercises[0]?.id || '');

  const volumeData = useMemo(() => {
    // Added explicit type casting to string[] to resolve 'unknown' inference for the date variable
    const dates = Array.from(new Set(history.map(h => h.date.split('T')[0]))).sort() as string[];
    return dates.map(date => {
      const volume = history
        .filter(h => h.date.startsWith(date))
        .reduce((sum, curr) => sum + (curr.load * curr.reps * curr.sets), 0);
      return { 
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), 
        volume 
      };
    });
  }, [history]);

  const evolutionData = useMemo(() => {
    return history
      .filter(h => h.exerciseId === selectedExerciseId)
      .map(h => ({
        date: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        load: h.load
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [history, selectedExerciseId]);

  const splitData = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 };
    history.forEach(h => {
      const ex = exercises.find(e => e.id === h.exerciseId);
      if (ex) counts[ex.category]++;
    });
    return [
      { name: 'Grupo A', value: counts.A, color: '#3b82f6' },
      { name: 'Grupo B', value: counts.B, color: '#a855f7' },
      { name: 'Grupo C', value: counts.C, color: '#f97316' },
    ].filter(d => d.value > 0);
  }, [history, exercises]);

  return (
    <div className="p-4 space-y-8 pb-24">
      <h2 className="text-2xl font-bold text-white">Seu Progresso</h2>

      {/* Volume Chart */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <BarChart2 size={18} />
          <h3 className="text-sm font-bold uppercase tracking-wider">Volume Total (kg/dia)</h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Load Evolution */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <TrendingUp size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Evolução de Carga</h3>
          </div>
          <select 
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-black border border-zinc-700 rounded-lg text-xs py-1 px-2 text-white outline-none"
          >
            {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
        </div>
        <div className="h-[200px] w-full">
          {evolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="load" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">Nenhum dado para este exercício.</div>
          )}
        </div>
      </section>

      {/* Split Chart */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <PieIcon size={18} />
          <h3 className="text-sm font-bold uppercase tracking-wider">Distribuição de Treino</h3>
        </div>
        <div className="h-[200px] w-full flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={splitData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {splitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 pr-4">
            {splitData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span className="text-[10px] text-zinc-400 font-bold">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
