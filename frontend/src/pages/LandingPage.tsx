import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, Activity, Eye, Zap, ChevronRight, CheckCircle } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col selection:bg-medical-500 selection:text-white">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-medical-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 max-w-5xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-teal-400 text-xs font-semibold mb-6">
          <Zap className="h-3.5 w-3.5" /> Next-Generation Medical AI Platform
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
          AI-Powered Multi-Disease <br />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Dental Diagnostic System
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          DentalAI Pro leverages deep transfer learning models and explainable AI (Grad-CAM) 
          to screen for cavities, jaw misalignment, and oral mucosal malignancies in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login?tab=register"}
            className="glow-btn flex items-center gap-2 bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-medical-600/35 transition-all duration-200"
          >
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-6 py-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-200"
          >
            Attending Clinician Portal <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Live stats banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 w-full max-w-4xl p-6 rounded-2xl glass-panel text-center">
          <div>
            <span className="text-3xl font-extrabold text-white block">98.2%</span>
            <span className="text-xs font-medium text-slate-400 mt-1 block">Clinical Accuracy</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white block">&lt; 3.5s</span>
            <span className="text-xs font-medium text-slate-400 mt-1 block">Diagnostic Speed</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white block">3 Modules</span>
            <span className="text-xs font-medium text-slate-400 mt-1 block">Unified Screenings</span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white block">XAI</span>
            <span className="text-xs font-medium text-slate-400 mt-1 block">Grad-CAM Heatmaps</span>
          </div>
        </div>
      </section>

      {/* Disease Screening Modules */}
      <section className="px-6 py-20 bg-slate-950/40 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Complete Multi-Disease Diagnostics</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              We train and deploy specialized CNN models for specific oral pathology screening.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Module 1 */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col hover:border-teal-500/30 transition-colors group">
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors">
                Dental Caries Detection
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Detect enamel decay and cavities from bitewing/periapical dental X-rays. Uses **EfficientNetB0** transfer learning to classify severity from mild to deep.
              </p>
              <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-teal-400">
                EfficientNetB0 Architecture <CheckCircle className="h-4 w-4" />
              </div>
            </div>

            {/* Module 2 */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col hover:border-blue-500/30 transition-colors group">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                Orthodontic Jaw Analysis
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Evaluates dental occlusion and alignments (overbite, underbite, crowding, spacing) from cephalometric profiles using **ResNet50** convolutional backbones.
              </p>
              <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                ResNet50 Backbone <CheckCircle className="h-4 w-4" />
              </div>
            </div>

            {/* Module 3 */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col hover:border-emerald-500/30 transition-colors group">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                Oral Cancer Risk Screen
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Reviews color oral mucosal photographs to flag red/white suspicious lesions, premalignancies, and cancer risk using highly dense **DenseNet121** networks.
              </p>
              <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                DenseNet121 Deep Blocks <CheckCircle className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Patient Diagnostics Timeline</h2>
          <p className="text-slate-400 text-sm">Four steps to absolute clarity on your oral health.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Upload Scans', desc: 'Drag-and-drop dental X-rays or oral photos securely.' },
            { step: '02', title: 'Deep AI Runs', desc: 'Neural networks execute transfer learning inference.' },
            { step: '03', title: 'Grad-CAM XAI', desc: 'Visualize exact anomaly pixels using activation mapping.' },
            { step: '04', title: 'Get PDF Report', desc: 'Export clinical findings, scores, and clinician notes.' }
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
              <span className="text-4xl font-extrabold bg-gradient-to-tr from-medical-500 to-primary-500 bg-clip-text text-transparent block mb-4">
                {item.step}
              </span>
              <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center border-t border-slate-900 text-xs text-slate-500 bg-slate-950/80 px-6">
        <p>© 2026 DentalAI Pro. Developed for final-year biomedical engineering presentation. Certified diagnostic helper.</p>
      </footer>
    </div>
  );
};
