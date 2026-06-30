import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Scan, HealthScore } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CircularGauge } from '../components/CircularGauge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusCircle, HelpCircle, Activity, Heart, ShieldCheck, ChevronRight, AlertTriangle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<Scan[]>([]);
  const [trends, setTrends] = useState<HealthScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [scans, scores] = await Promise.all([
          api.getHistory(),
          api.getHealthTrend()
        ]);
        setHistory(scans);
        setTrends(scores);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const latestScan = history[0]; // Sorted by created_at desc
  const latestHealth = trends[trends.length - 1] || {
    total_score: 100,
    status: 'Excellent',
    caries_score: 40,
    orthodontic_score: 30,
    cancer_score: 30
  };

  // Format Recharts data
  const chartData = trends.map(t => ({
    date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Score: t.total_score
  }));

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading diagnostic portal...</span>
        </div>
      </div>
    );
  }

  // Smart Alert: check if latest scan is high risk
  const isHighRiskAlert = (() => {
    if (!latestScan) return false;
    const sev = (latestScan.prediction_result.severity || '').toLowerCase();
    const label = latestScan.prediction_result.label.toLowerCase();
    return sev.includes('severe') || sev.includes('high') || label.includes('cancer') || label.includes('malign');
  })();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-medical-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Smart Alert Banner */}
      {isHighRiskAlert && (
        <div className="relative overflow-hidden bg-rose-500/10 border border-rose-500/40 rounded-2xl p-4 flex items-start gap-4 animate-pulse-slow">
          <div className="shrink-0 w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-rose-300">⚠️ Urgent Clinical Alert</p>
            <p className="text-xs text-rose-200/70 mt-0.5 leading-relaxed">
              Your latest scan — <strong className="text-rose-300">{latestScan?.prediction_result.label}</strong> — has been flagged as <strong className="text-rose-300">high risk</strong>. Please consult a dental specialist immediately. Early intervention significantly improves outcomes.
            </p>
          </div>
          <Link to="/history" className="shrink-0 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
            View Report
          </Link>
          {/* Animated pulse border */}
          <div className="absolute inset-0 rounded-2xl border border-rose-500/20 animate-ping opacity-30 pointer-events-none" />
        </div>
      )}

      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review your dental health indices, scan history, and recommendations.
          </p>
        </div>
        
        <Link
          to="/diagnose"
          className="glow-btn flex items-center justify-center gap-2 bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-medical-600/20 transition-all"
        >
          <PlusCircle className="h-4.5 w-4.5" /> Run New Scan
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Column 1: Dental Health Index Gauge */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-base font-bold text-white mb-6 mr-auto flex items-center gap-2">
            <Heart className="h-5 w-5 text-teal-400" /> Dental Health Index
          </h2>
          <CircularGauge score={latestHealth.total_score} status={latestHealth.status} />
          
          <div className="grid grid-cols-3 gap-3 mt-8 w-full border-t border-slate-800 pt-6">
            <div className="text-center">
              <span className="text-xs text-slate-400 font-medium block">Caries</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{latestHealth.caries_score}/40</span>
            </div>
            <div className="text-center border-x border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Alignment</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{latestHealth.orthodontic_score}/30</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-slate-400 font-medium block">Cancer</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{latestHealth.cancer_score}/30</span>
            </div>
          </div>
        </div>

        {/* Column 2: Health Index Progress Chart */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" /> Health score timeline
            </h2>
            <p className="text-xs text-slate-400">Track your index progress across past uploads</p>
          </div>

          <div className="h-52 w-full mt-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                    itemStyle={{ color: '#fff', fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Score" 
                    stroke="#14b8a6" 
                    strokeWidth={3} 
                    dot={{ fill: '#0d9488', r: 4 }}
                    activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 italic">
                A health index trend will generate once you complete scans.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Recent Scan Findings */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Latest Scan Findings Card */}
        <div className="glass-panel rounded-3xl p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" /> Latest Scan Findings
            </h2>
            
            {latestScan ? (
              <div className="grid sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-slate-400 font-medium w-24">Scan Type:</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-800 text-teal-400 border border-teal-500/20 capitalize">
                      {latestScan.scan_type}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-slate-400 font-medium w-24">AI Finding:</span>
                    <span className="text-sm font-semibold text-white">{latestScan.prediction_result.label}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-slate-400 font-medium w-24">Confidence:</span>
                    <span className="text-sm font-semibold text-white">{latestScan.prediction_result.confidence}%</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-slate-400 font-medium w-24">Severity/Risk:</span>
                    <span className="text-sm font-semibold text-white">{latestScan.prediction_result.severity || 'N/A'}</span>
                  </div>
                </div>

                {latestScan.prediction_result.heatmap_url && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 max-h-36">
                    <img 
                      src={latestScan.prediction_result.heatmap_url} 
                      alt="Grad-CAM Anomaly Heatmap" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[9px] text-teal-300 font-semibold border border-teal-500/20">
                      Grad-CAM Heatmap
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No recent scans logged. Upload your first scan to generate data.</p>
            )}
          </div>
          
          {latestScan && (
            <div className="border-t border-slate-800 pt-5 mt-6 flex justify-between items-center gap-4">
              <span className="text-[10px] text-slate-400">
                Uploaded: {new Date(latestScan.created_at).toLocaleString()}
              </span>
              <Link
                to={`/history`}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 group"
              >
                Full Diagnostic Details <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        {/* AI Recommendations Panel */}
        <div className="glass-panel rounded-3xl p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-400" /> Care Advice
          </h2>
          {latestScan && latestScan.prediction_result.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {latestScan.prediction_result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-300">
                  <span className="text-teal-400 font-extrabold shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No care advice compiles until you run a diagnostic scan.</p>
          )}
        </div>
      </div>
    </div>
  );
};
