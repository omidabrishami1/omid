import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { Activity, Battery, Moon, Smartphone, TrendingUp, Calendar, Monitor, BookOpen, Weight, Clock } from 'lucide-react';
import { DailyData, TimeRange, ScoringConfig } from '../types';
import { calculateDailyScore } from '../utils/calculations';
import { gregorianToJalaliString } from '../utils/jalali';
import { StatCard } from './StatCard';

interface DashboardProps {
  data: DailyData[];
  config: ScoringConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, config }) => {
  const [range, setRange] = useState<TimeRange>('14d');

  // Process data for charts
  const processedData = useMemo(() => {
    // Sort by date ascending for charts
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Filter based on range
    const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;
    const filtered = sorted.slice(-days);

    return filtered.map(day => {
      const stats = calculateDailyScore(day, config);
      
      // Prefer pre-calculated jalaliDate if available, otherwise calculate on fly
      let jalali = day.jalaliDate;
      if (!jalali) {
        jalali = gregorianToJalaliString(day.date);
      }
      
      // Shorten Jalali date for X-Axis (e.g., 1403/02/15 -> 02/15)
      const shortJalali = jalali.split('/').slice(1).join('/');

      return {
        ...day,
        score: stats.totalScore,
        productivity: stats.productivityPercentage,
        grade: stats.grade,
        formattedDate: shortJalali, // Display Jalali (Month/Day)
        fullJalali: jalali // For Tooltip
      };
    });
  }, [data, range, config]);

  // Sort descending for history table (newest first)
  const historyData = useMemo(() => {
    return [...processedData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [processedData]);

  // Averages for KPIs
  const averages = useMemo(() => {
    if (processedData.length === 0) return null;
    const sum = processedData.reduce((acc, curr) => ({
      score: acc.score + curr.score,
      prod: acc.prod + curr.productivity,
      work: acc.work + curr.workHours,
      phone: acc.phone + curr.phoneMinutes,
      sleep: acc.sleep + curr.sleepHours,
    }), { score: 0, prod: 0, work: 0, phone: 0, sleep: 0 });
    
    const count = processedData.length;
    return {
      score: Math.round(sum.score / count),
      prod: Math.round(sum.prod / count),
      work: (sum.work / count).toFixed(1),
      phone: Math.round(sum.phone / count),
      sleep: (sum.sleep / count).toFixed(1)
    };
  }, [processedData]);

  const latestWeight = processedData.length > 0 ? processedData[processedData.length - 1].weight : 0;
  const prevWeight = processedData.length > 1 ? processedData[0].weight : latestWeight;
  const weightChange = (latestWeight - prevWeight).toFixed(1);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-100">Performance Overview</h2>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          {(['7d', '14d', '30d'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                range === r 
                ? 'bg-brand-500 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Productivity" 
          value={`${averages?.prod || 0}%`} 
          icon={Activity} 
          colorClass="text-emerald-400" 
        />
        <StatCard 
          title="Avg Score" 
          value={averages?.score || 0} 
          icon={TrendingUp} 
          colorClass="text-brand-400" 
        />
         <StatCard 
          title="Work Hours" 
          value={averages?.work || 0} 
          subtitle="Hours / day"
          icon={Monitor} 
          colorClass="text-amber-400" 
        />
         <StatCard 
          title="Phone Usage" 
          value={`${averages?.phone || 0}m`} 
          subtitle="Minutes / day"
          icon={Smartphone} 
          colorClass="text-rose-400" 
        />
         <StatCard 
          title="Weight" 
          value={`${latestWeight}kg`} 
          subtitle={`${Number(weightChange) >= 0 ? '+' : ''}${weightChange}kg in range`}
          icon={Weight} 
          colorClass="text-purple-400" 
        />
      </div>

      {/* Main Chart: Score & Productivity */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="text-brand-400" size={20} />
          Productivity Trends
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="formattedDate" stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis yAxisId="left" stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                     return `Jalali: ${payload[0].payload.fullJalali}`;
                  }
                  return label;
                }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="productivity" 
                name="Productivity %"
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorProd)" 
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="score" 
                name="Total Score"
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts: Activities & Weight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
           <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-amber-400" size={20} />
            Activity Breakdown (Avg)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" tick={{fontSize: 10}} interval={range === '30d' ? 2 : 0} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.2}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                       return `Jalali: ${payload[0].payload.fullJalali}`;
                    }
                    return label;
                  }}
                />
                <Legend />
                <Bar dataKey="workHours" name="Work (Hrs)" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exerciseMinutes" name="Exercise (Min)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="studyMinutes" name="Study (Min)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
           <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Weight className="text-purple-400" size={20} />
            Weight Progression
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" tick={{fontSize: 10}} interval={range === '30d' ? 2 : 0} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                       return `Jalali: ${payload[0].payload.fullJalali}`;
                    }
                    return label;
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#d946ef" strokeWidth={3} dot={{r: 4, fill: '#d946ef'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="text-brand-400" size={20} />
            Detailed History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/50 text-slate-200 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Sleep</th>
                <th className="px-6 py-4 text-amber-400">Work</th>
                <th className="px-6 py-4 text-emerald-400">Exercise</th>
                <th className="px-6 py-4 text-indigo-400">Study</th>
                <th className="px-6 py-4 text-rose-400">Phone</th>
                <th className="px-6 py-4 text-purple-400">Weight</th>
                <th className="px-6 py-4 text-brand-400">Score</th>
                <th className="px-6 py-4">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {historyData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{row.fullJalali}</td>
                  <td className="px-6 py-4">{row.sleepHours}h</td>
                  <td className="px-6 py-4">{row.workHours}h</td>
                  <td className="px-6 py-4">{row.exerciseMinutes}m</td>
                  <td className="px-6 py-4">{row.studyMinutes}m</td>
                  <td className="px-6 py-4">{row.phoneMinutes}m</td>
                  <td className="px-6 py-4">{row.weight}kg</td>
                  <td className="px-6 py-4 font-bold text-slate-100">{row.score}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      row.grade === 'S' ? 'bg-yellow-500/20 text-yellow-400' :
                      row.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400' :
                      row.grade === 'B' ? 'bg-brand-500/20 text-brand-400' :
                      row.grade === 'C' ? 'bg-slate-500/20 text-slate-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {row.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};