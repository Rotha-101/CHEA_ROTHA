import { useEffect, useState } from 'react';
import { Briefcase, FileText, Code2, Users, TrendingUp, MousePointer2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const API_BASE = `/api/db`;

interface Stats {
  projects: number;
  experience: number;
  skills: number;
  blog: number;
  users: number;
}

interface ChartData {
  date: string;
  visits: number;
  interactions: number;
}

interface LogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

const MOCK_CHART: ChartData[] = [
  { date: 'Mon', visits: 120, interactions: 45 },
  { date: 'Tue', visits: 250, interactions: 80 },
  { date: 'Wed', visits: 180, interactions: 60 },
  { date: 'Thu', visits: 310, interactions: 150 },
  { date: 'Fri', visits: 280, interactions: 110 },
  { date: 'Sat', visits: 400, interactions: 200 },
  { date: 'Sun', visits: 350, interactions: 170 },
];

const MOCK_LOGS: LogEntry[] = [
  { id: '1', action: 'system_start', details: 'Local CMS server started.', timestamp: new Date().toISOString() },
  { id: '2', action: 'user_login', details: 'Admin logged in successfully.', timestamp: new Date().toISOString() },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ projects: 0, experience: 0, skills: 0, blog: 0, users: 0 });
  const [chartData, setChartData] = useState<ChartData[]>(MOCK_CHART);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [projects, experience, skills, blog, users] = await Promise.all([
          fetch(`${API_BASE}/projects`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE}/experience`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE}/skills`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE}/blog`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE}/users`).then(r => r.json()).catch(() => []),
        ]);

        setStats({
          projects: Array.isArray(projects) ? projects.length : 0,
          experience: Array.isArray(experience) ? experience.length : 0,
          skills: Array.isArray(skills) ? skills.length : 0,
          blog: Array.isArray(blog) ? blog.length : 0,
          users: Array.isArray(users) ? users.length : 0,
        });

        // Try loading activity logs
        const logsData = await fetch(`${API_BASE}/activity_logs`).then(r => r.json()).catch(() => []);
        if (Array.isArray(logsData) && logsData.length > 0) {
          const sorted = [...logsData]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
          setLogs(sorted);
        }
      } catch (err) {
        console.warn('Dashboard init error — using mock data.', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[400px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl"></div>
        <div className="h-[400px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl"></div>
      </div>
    </div>
  );

  const statCards = [
    { name: 'Total Projects', value: stats.projects, icon: Code2, color: 'bg-blue-500' },
    { name: 'Work Experience', value: stats.experience, icon: Briefcase, color: 'bg-emerald-500' },
    { name: 'Blog Posts', value: stats.blog, icon: FileText, color: 'bg-purple-500' },
    { name: 'Total Users', value: stats.users, icon: Users, color: 'bg-[#ff4d4d]' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff4d4d]">
          <span className="w-8 h-px bg-[#ff4d4d]/30" />
          SYSTEM OVERVIEW
        </div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">Neural Core</h1>
        <p className="text-zinc-500 text-sm font-medium">Real-time performance and repository state.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white/5 backdrop-blur-md overflow-hidden border border-white/5 rounded-3xl p-8 transition-all hover:border-[#ff4d4d]/20 group">
            <div className="flex items-center">
              <div className={`rounded-2xl p-4 ${item.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1">{item.name}</p>
                <p className="text-3xl font-display font-bold text-white">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md p-10 rounded-[40px] border border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d4d]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Traffic Analysis</h3>
              <p className="text-sm text-zinc-500 font-medium tracking-tight">Website visits over the last 7 solar days</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" opacity={0.03} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050810', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#ff4d4d' }}
                />
                <Area type="monotone" dataKey="visits" stroke="#ff4d4d" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement + Recent Activity */}
        <div className="bg-white/5 backdrop-blur-md p-10 rounded-[40px] border border-white/5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Engagement</h3>
              <p className="text-sm text-zinc-500 font-medium tracking-tight">Interaction breakdown</p>
            </div>
            <div className="p-3 bg-[#ff4d4d]/10 rounded-2xl">
              <MousePointer2 className="h-5 w-5 text-[#ff4d4d]" />
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="interactions" radius={[6, 6, 0, 0]}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ff4d4d' : '#cc3d3d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex-1">
            <h4 className="text-xs font-mono font-bold text-[#ff4d4d] uppercase tracking-[0.2em] mb-6">LATEST LOGS</h4>
            <div className="space-y-6">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-4 group">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#ff4d4d] shadow-[0_0_8px_#ff4d4d] flex-shrink-0 group-hover:scale-125 transition-transform" />
                  <div>
                    <p className="text-xs font-bold text-white capitalize tracking-tight mb-1">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-zinc-500 font-medium line-clamp-1">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
