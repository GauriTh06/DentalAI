import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, FileImage, ShieldCheck, Heart, UsersRound, Calendar, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [stats, userList] = await Promise.all([
          api.getAdminAnalytics(),
          api.listAllUsers()
        ]);
        setAnalytics(stats);
        setUsers(userList);
      } catch (err) {
        console.error("Failed to load admin analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  if (loading || !analytics) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading clinician dashboard...</span>
        </div>
      </div>
    );
  }

  // 1. Scan distribution PieChart data
  const scanDistribution = [
    { name: 'Caries scans', value: analytics.distribution.caries_scans },
    { name: 'Orthodontic scans', value: analytics.distribution.ortho_scans },
    { name: 'Oral Cancer scans', value: analytics.distribution.cancer_scans }
  ].filter(d => d.value > 0);

  // Fallback data if empty for visual demo
  const pieData = scanDistribution.length > 0 ? scanDistribution : [
    { name: 'Caries scans', value: 45 },
    { name: 'Orthodontic scans', value: 30 },
    { name: 'Oral Cancer scans', value: 25 }
  ];

  const PIE_COLORS = ['#14b8a6', '#3b82f6', '#10b981'];

  // 2. Pathology statistics BarChart data
  const pathologyData = [
    { name: 'Cavities', Count: analytics.distribution.caries_cases, color: '#f59e0b' },
    { name: 'Misalignments', Count: analytics.distribution.orthodontic_cases, color: '#3b82f6' },
    { name: 'Malignancy Risks', Count: analytics.distribution.cancer_risk_cases, color: '#ef4444' }
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 relative">
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-medical-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Clinical Analytics Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review overall diagnostic scan statistics, model performance tracking, and user registrations.
        </p>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Total Patients', value: analytics.summary.total_patients, icon: Users, color: 'text-teal-400', bg: 'bg-teal-500/5' },
          { title: 'Attending Dentists', value: analytics.summary.total_dentists, icon: UsersRound, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          { title: 'Uploaded Scans', value: analytics.summary.total_scans, icon: FileImage, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { title: 'Avg Health Index', value: `${analytics.summary.avg_health_index}/100`, icon: Heart, color: 'text-amber-400', bg: 'bg-amber-500/5' }
        ].map((item, idx) => (
          <div key={idx} className="glass-panel rounded-2xl p-5 flex items-center justify-between border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{item.title}</span>
              <span className="text-2xl font-extrabold text-white mt-2 block">{item.value}</span>
            </div>
            <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* PieChart: Scan Distribution */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <FileImage className="h-5 w-5 text-teal-400" /> Scan Distribution
            </h2>
            <p className="text-xs text-slate-400">Ratio of uploaded diagnostics by module type</p>
          </div>
          
          <div className="h-56 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: 11 }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BarChart: Detected Pathologies */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-400" /> Flagged Cases
            </h2>
            <p className="text-xs text-slate-400">Frequencies of abnormalities identified by AI models</p>
          </div>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pathologyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: 11 }}
                />
                <Bar dataKey="Count" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                  {pathologyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Monthly Scans Volume Trend & User Registers */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Monthly Trend Chart */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" /> Monthly Scan Volume
            </h2>
            <p className="text-xs text-slate-400">Platform usage and volume trend over the last 6 months</p>
          </div>

          <div className="h-56 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="scans" name="Total Scans" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="caries" name="Caries" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="ortho" name="Orthodontic" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="cancer" name="Cancer" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Management List */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" /> User Registers
            </h2>
            
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {users.map((u) => (
                <div key={u._id} className="flex justify-between items-center bg-slate-900/40 border border-slate-800 p-2.5 rounded-xl text-xs">
                  <div>
                    <span className="font-bold text-white block">{u.name}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{u.email}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                    u.role === 'admin' 
                      ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' 
                      : (u.role === 'dentist' ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' : 'bg-slate-850 text-slate-400 border-slate-700/20')
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-3.5 mt-4 text-[10px] text-slate-500 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Total users indexed: {users.length}
          </div>
        </div>
        
      </div>
    </div>
  );
};
