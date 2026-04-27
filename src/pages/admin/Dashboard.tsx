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
    { name: 'Total Users', value: stats.users, icon: Users, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Command Center</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Real-time performance and system overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white dark:bg-zinc-900 overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 transition-all hover:shadow-md">
            <div className="flex items-center">
              <div className={`rounded-xl p-3 ${item.color} bg-opacity-10 dark:bg-opacity-20`}>
                <item.icon className="h-6 w-6 text-zinc-900 dark:text-white" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{item.name}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Traffic Analysis</h3>
              <p className="text-sm text-zinc-500">Website visits over the last 7 days</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.1} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="visits" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement + Recent Activity */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Engagement</h3>
              <p className="text-sm text-zinc-500">Interaction breakdown</p>
            </div>
            <MousePointer2 className="h-5 w-5 text-amber-500" />
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="interactions">
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#fbbf24' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Recent Activity</h4>
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-zinc-900 dark:text-white capitalize">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">{log.details}</p>
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
