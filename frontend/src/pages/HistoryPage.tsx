import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Scan } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Search, Check, Clock, MessageSquare, Activity } from 'lucide-react';

const getSeverityColor = (sev: string, label: string) => {
  const s = (sev || '').toLowerCase();
  const l = (label || '').toLowerCase();
  if (s.includes('severe') || s.includes('high') || l.includes('cancer') || l.includes('malign')) return 'rose';
  if (s.includes('moderate') || s.includes('mild')) return 'amber';
  return 'emerald';
};

const getTypeIcon = (type: string) => {
  if (type === 'caries') return '🦷';
  if (type === 'orthodontic') return '📐';
  return '🔬';
};

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Dentist review state
  const [reviewingScanId, setReviewingScanId] = useState<string | null>(null);
  const [dentistRemarks, setDentistRemarks] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [pdfDownloadingId, setPdfDownloadingId] = useState<string | null>(null);

  const isClinician = user?.role === 'dentist' || user?.role === 'admin';

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = isClinician ? await api.listAllScans() : await api.getHistory();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [user]);

  const handleDownloadPDF = async (scanId: string) => {
    setPdfDownloadingId(scanId);
    try {
      const blob = await api.downloadReport(scanId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DentalAI_Report_${scanId.substring(0, 6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Could not download PDF report.');
    } finally {
      setPdfDownloadingId(null);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent, scanId: string) => {
    e.preventDefault();
    if (!dentistRemarks.trim()) return;

    setSubmittingReview(true);
    try {
      await api.submitDentistReview(scanId, dentistRemarks);
      setReviewingScanId(null);
      setDentistRemarks('');
      await loadRecords();
    } catch (err) {
      console.error(err);
      alert('Failed to submit clinical remarks.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.prediction_result.label.toLowerCase().includes(search.toLowerCase()) ||
      r.scan_type.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || r.scan_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Retrieving diagnostic records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 relative">
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-medical-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7 text-teal-400" />
            {isClinician ? 'Patient Diagnostic Records' : 'My Diagnostic Scan Logs'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isClinician ? 'Review and validate submitted scan reports from patients.' : 'Browse details of your past scans and print reports.'}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${viewMode === 'timeline' ? 'bg-medical-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            🗓️ Timeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${viewMode === 'list' ? 'bg-medical-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scans (e.g. Caries)..."
            className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-medical-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">Filter Scan:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-40 bg-slate-800/40 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-medical-500"
          >
            <option value="all" className="bg-slate-900">All Scan Types</option>
            <option value="caries" className="bg-slate-900">Caries scans</option>
            <option value="orthodontic" className="bg-slate-900">Orthodontic scans</option>
            <option value="oral_cancer" className="bg-slate-900">Oral cancer scans</option>
          </select>
        </div>
      </div>

      {/* TIMELINE VIEW */}
      {viewMode === 'timeline' && filteredRecords.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500/60 via-blue-500/30 to-transparent" />

          <div className="space-y-6 pl-16">
            {filteredRecords.map((rec) => {
              const color = getSeverityColor(rec.prediction_result.severity || '', rec.prediction_result.label);
              const icon = getTypeIcon(rec.scan_type);
              return (
                <div key={rec._id} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[2.75rem] top-4 w-7 h-7 rounded-full bg-${color}-500/20 border-2 border-${color}-500 flex items-center justify-center text-sm shadow-lg shadow-${color}-500/20`}>
                    {icon}
                  </div>

                  <div className={`glass-panel rounded-2xl p-5 border border-slate-800 hover:border-${color}-500/30 transition-colors space-y-4`}>
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="h-16 w-16 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                          <img
                            src={rec.image_url?.startsWith('data:') ? rec.image_url : `/${rec.image_url}`}
                            alt="Thumbnail scan"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              const el = e.target as HTMLImageElement;
                              el.style.display = 'none';
                              el.parentElement!.innerHTML = `<span class="text-2xl">${icon}</span>`;
                            }}
                          />
                        </div>
                        <div>
                          {/* Date + type badges */}
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 capitalize`}>
                              {rec.scan_type.replace('_', ' ')}
                            </span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-${color}-500/5 text-${color}-400/70 border border-${color}-500/10 capitalize`}>
                              {rec.prediction_result.severity || 'Normal'}
                            </span>
                            {rec.dentist_reviewed && (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <Check className="h-2.5 w-2.5" /> Reviewed
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white">{rec.prediction_result.label}</h3>
                          <div className="flex gap-3 items-center mt-1 text-[10px] text-slate-500">
                            <span>{new Date(rec.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className={`font-bold text-${color}-400`}>{rec.prediction_result.confidence}% confidence</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-start flex-wrap">
                        {!rec.dentist_reviewed && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/5 px-2.5 py-1.5 rounded-lg border border-amber-500/10">
                            <Clock className="h-3 w-3" /> Pending Review
                          </div>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(rec._id)}
                          disabled={pdfDownloadingId === rec._id}
                          className="flex items-center justify-center gap-1 border border-slate-700 hover:border-slate-500 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-all disabled:opacity-45"
                        >
                          <FileText className="h-3.5 w-3.5" /> {pdfDownloadingId === rec._id ? 'Compiling...' : 'PDF'}
                        </button>
                        {isClinician && !rec.dentist_reviewed && (
                          <button
                            onClick={() => { setReviewingScanId(reviewingScanId === rec._id ? null : rec._id); setDentistRemarks(''); }}
                            className="bg-medical-600 hover:bg-medical-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-colors"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 shrink-0 w-24">AI Confidence</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full transition-all`}
                          style={{ width: `${rec.prediction_result.confidence}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold text-${color}-400 shrink-0`}>{rec.prediction_result.confidence}%</span>
                    </div>

                    {/* Dentist Notes */}
                    {rec.dentist_reviewed && rec.dentist_notes && (
                      <div className="bg-slate-900/40 border-l-2 border-teal-500 p-3 rounded-r-xl text-xs text-slate-300 flex items-start gap-2.5">
                        <MessageSquare className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-teal-400 block mb-0.5">Dentist Remarks:</span>
                          <p className="leading-relaxed">{rec.dentist_notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Review form */}
                    {reviewingScanId === rec._id && (
                      <form
                        onSubmit={(e) => handleReviewSubmit(e, rec._id)}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3"
                      >
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attending remarks & Notes</label>
                        <textarea
                          rows={3}
                          value={dentistRemarks}
                          onChange={(e) => setDentistRemarks(e.target.value)}
                          placeholder="Input clinical findings or specific treatments required..."
                          className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-medical-500 resize-y"
                          required
                        />
                        <div className="flex justify-end gap-2.5">
                          <button type="button" onClick={() => setReviewingScanId(null)} className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2">Cancel</button>
                          <button type="submit" disabled={submittingReview || !dentistRemarks.trim()} className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-40">
                            {submittingReview ? 'Submitting...' : 'Sign Off Diagnoses'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((rec) => {
              const color = getSeverityColor(rec.prediction_result.severity || '', rec.prediction_result.label);
              const icon = getTypeIcon(rec.scan_type);
              return (
                <div key={rec._id} className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-colors space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                        <img
                          src={rec.image_url?.startsWith('data:') ? rec.image_url : `/${rec.image_url}`}
                          alt="Thumbnail scan"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement;
                            el.style.display = 'none';
                            el.parentElement!.innerHTML = `<span class="text-2xl">${icon}</span>`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-850 text-teal-400 border border-teal-500/10 capitalize">{rec.scan_type.replace('_', ' ')}</span>
                          <span className="text-[10px] text-slate-500">{new Date(rec.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1.5">{rec.prediction_result.label}</h3>
                        <div className="flex gap-4 items-center mt-1 text-[11px] text-slate-400">
                          <span>Confidence: <strong className={`text-${color}-400`}>{rec.prediction_result.confidence}%</strong></span>
                          <span>Severity: <strong className="text-slate-350 capitalize">{rec.prediction_result.severity || 'Mild'}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {rec.dentist_reviewed ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                          <Check className="h-3.5 w-3.5" /> Reviewed
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/5 px-2.5 py-1.5 rounded-lg border border-amber-500/10">
                          <Clock className="h-3.5 w-3.5" /> Pending Remarks
                        </div>
                      )}
                      <button onClick={() => handleDownloadPDF(rec._id)} disabled={pdfDownloadingId === rec._id} className="flex items-center justify-center gap-1 border border-slate-700 hover:border-slate-500 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-all disabled:opacity-45">
                        <FileText className="h-4 w-4" /> {pdfDownloadingId === rec._id ? 'Compiling...' : 'PDF'}
                      </button>
                      {isClinician && !rec.dentist_reviewed && (
                        <button onClick={() => { setReviewingScanId(reviewingScanId === rec._id ? null : rec._id); setDentistRemarks(''); }} className="bg-medical-600 hover:bg-medical-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-colors">Verify Diagnoses</button>
                      )}
                    </div>
                  </div>
                  {rec.dentist_reviewed && rec.dentist_notes && (
                    <div className="bg-slate-900/40 border-l-2 border-teal-500 p-3 rounded-r-xl text-xs text-slate-300 flex items-start gap-2.5">
                      <MessageSquare className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <div><span className="font-bold text-teal-400 block mb-0.5">Dentist Remarks:</span><p className="leading-relaxed">{rec.dentist_notes}</p></div>
                    </div>
                  )}
                  {reviewingScanId === rec._id && (
                    <form onSubmit={(e) => handleReviewSubmit(e, rec._id)} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attending remarks & Notes</label>
                      <textarea rows={3} value={dentistRemarks} onChange={(e) => setDentistRemarks(e.target.value)} placeholder="Input clinical findings or specific treatments required..." className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-medical-500 resize-y" required />
                      <div className="flex justify-end gap-2.5">
                        <button type="button" onClick={() => setReviewingScanId(null)} className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2">Cancel</button>
                        <button type="submit" disabled={submittingReview || !dentistRemarks.trim()} className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-40">{submittingReview ? 'Submitting...' : 'Sign Off Diagnoses'}</button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })
          ) : (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-500 italic text-xs">No diagnostic records found matching search queries.</div>
          )}
        </div>
      )}

      {filteredRecords.length === 0 && viewMode === 'timeline' && (
        <div className="glass-panel rounded-2xl p-8 text-center text-slate-500 italic text-xs">No diagnostic records found matching search queries.</div>
      )}
    </div>
  );
};
