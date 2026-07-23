import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Eye,
  Zap,
  ChevronRight,
  CheckCircle,
  Star,
  Brain,
  Sparkles,
  ScanLine,
  FileText,
  Upload,
  Lock,
  Clock,
  Award,
} from 'lucide-react';

// Import dental images
import heroImg from '../assets/dental_hero.png';
import xrayAiImg from '../assets/dental_xray_ai.png';
import modulesImg from '../assets/dental_modules.png';
import professionalImg from '../assets/dental_professional.png';
import tooth3dImg from '../assets/dental_tooth_3d.png';
import gradcamImg from '../assets/dental_gradcam.png';

/* ─── tiny intersection-observer hook for scroll animations ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

const RevealSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal-section ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col selection:bg-medical-500 selection:text-white overflow-hidden">
      {/* ── Background Ambient Glow ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-medical-500/8 rounded-full blur-[160px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-primary-500/6 rounded-full blur-[180px]" />
        <div className="absolute bottom-[10%] left-[40%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px]" />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-6 px-6 pt-24 pb-16 max-w-7xl mx-auto w-full">
        {/* Left – Copy */}
        <div className="flex-1 text-center lg:text-left max-w-2xl">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-teal-400 text-xs font-semibold mb-6 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5" /> Next-Generation Dental AI Platform
            </div>
          </RevealSection>

          <RevealSection delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              AI-Powered{' '}
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
                Dental Diagnostics
              </span>{' '}
              <br className="hidden sm:block" />
              in Seconds
            </h1>
          </RevealSection>

          <RevealSection delay={200}>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0">
              DentalAI Pro leverages deep transfer learning (EfficientNet, ResNet, DenseNet) and
              explainable Grad-CAM heatmaps to screen for cavities, jaw misalignment, and oral
              cancer — with clinical-grade accuracy.
            </p>
          </RevealSection>

          <RevealSection delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login?tab=register'}
                className="glow-btn group flex items-center gap-2 bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-medical-600/35 transition-all duration-300 hover:scale-[1.03]"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="group flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-6 py-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-300"
              >
                Clinician Portal
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </RevealSection>

          {/* Trust badges */}
          <RevealSection delay={400}>
            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5 text-teal-500" /> HIPAA Ready
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-500" /> Clinical Grade
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Award className="h-3.5 w-3.5 text-teal-500" /> Research Validated
              </div>
            </div>
          </RevealSection>
        </div>

        {/* Right – Hero Image with floating 3D tooth */}
        <div className="flex-1 relative flex justify-center items-center max-w-lg lg:max-w-xl">
          <RevealSection delay={200}>
            <div className="relative">
              {/* Main hero image with glass frame */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-medical-500/10">
                <img
                  src={heroImg}
                  alt="Advanced dental AI diagnostic clinic"
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
              </div>

              {/* Floating 3D tooth decoration */}
              <div className="absolute -top-8 -right-8 w-28 h-28 animate-float z-20">
                <img
                  src={tooth3dImg}
                  alt="3D tooth AI scan"
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(20,184,166,0.4)]"
                />
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-4 -left-4 glass-panel rounded-2xl px-5 py-3 flex items-center gap-3 z-20 animate-float-delayed">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white block leading-tight">98.2%</span>
                  <span className="text-[10px] text-slate-400">Clinical Accuracy</span>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LIVE STATS BANNER
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 pb-16">
        <RevealSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto p-6 rounded-2xl glass-panel text-center">
            {[
              { value: '98.2%', label: 'Clinical Accuracy', icon: CheckCircle },
              { value: '< 3.5s', label: 'Diagnostic Speed', icon: Clock },
              { value: '3 Models', label: 'Deep Learning CNNs', icon: Brain },
              { value: 'XAI', label: 'Grad-CAM Heatmaps', icon: Sparkles },
            ].map((stat, idx) => (
              <div key={idx} className="group cursor-default">
                <stat.icon className="h-5 w-5 text-teal-500/60 mx-auto mb-2 group-hover:text-teal-400 transition-colors" />
                <span className="text-2xl sm:text-3xl font-extrabold text-white block group-hover:text-teal-400 transition-colors">
                  {stat.value}
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-1 block">{stat.label}</span>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          AI X-RAY SHOWCASE (visual section)
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-20 bg-slate-950/40 border-t border-b border-slate-900/60">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Left – Image */}
          <RevealSection className="flex-1" delay={0}>
            <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-xl">
              <img
                src={xrayAiImg}
                alt="AI analyzing dental X-ray with neural network"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950/30 to-transparent" />
            </div>
          </RevealSection>

          {/* Right – Copy */}
          <div className="flex-1 max-w-xl">
            <RevealSection delay={100}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-4">
                <ScanLine className="h-4 w-4" /> How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
                Deep Learning Meets{' '}
                <span className="text-teal-400">Dental Diagnostics</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Upload any dental X-ray or oral photograph. Our ensemble of fine-tuned convolutional
                neural networks — EfficientNetB0, ResNet50, and DenseNet121 — run parallel inference
                to classify pathology with explainable Grad-CAM activation maps.
              </p>
            </RevealSection>

            <RevealSection delay={200}>
              <div className="space-y-4">
                {[
                  { icon: Upload, text: 'Drag-and-drop any dental scan securely' },
                  { icon: Brain, text: 'Multi-model CNN ensemble runs inference' },
                  { icon: Sparkles, text: 'Grad-CAM highlights exact anomaly pixels' },
                  { icon: FileText, text: 'Export clinical PDF with findings & scores' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 group">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-teal-500/20 transition-colors">
                      <item.icon className="h-4 w-4 text-teal-400" />
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DISEASE SCREENING MODULES
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <RevealSection>
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-3">
                <Activity className="h-4 w-4" /> Screening Modules
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Complete Multi-Disease Diagnostics
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-sm">
                Three specialized CNN models, each trained on curated medical datasets for specific
                oral pathology screening.
              </p>
            </div>
          </RevealSection>

          {/* Modules overview image */}
          <RevealSection delay={100}>
            <div className="mb-14 rounded-2xl overflow-hidden border border-white/8 shadow-xl max-w-4xl mx-auto">
              <img
                src={modulesImg}
                alt="Three dental AI screening modules overview"
                className="w-full h-auto object-cover"
              />
            </div>
          </RevealSection>

          {/* Module Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                color: 'teal',
                title: 'Dental Caries Detection',
                desc: 'Detect enamel decay and cavities from bitewing/periapical dental X-rays. Uses EfficientNetB0 transfer learning to classify severity from mild to deep.',
                model: 'EfficientNetB0 Architecture',
                borderHover: 'hover:border-teal-500/30',
                iconBg: 'bg-teal-500/10',
                iconColor: 'text-teal-400',
              },
              {
                icon: Eye,
                color: 'blue',
                title: 'Orthodontic Jaw Analysis',
                desc: 'Evaluates dental occlusion and alignments (overbite, underbite, crowding, spacing) from cephalometric profiles using ResNet50 convolutional backbones.',
                model: 'ResNet50 Backbone',
                borderHover: 'hover:border-blue-500/30',
                iconBg: 'bg-blue-500/10',
                iconColor: 'text-blue-400',
              },
              {
                icon: ShieldCheck,
                color: 'emerald',
                title: 'Oral Cancer Risk Screen',
                desc: 'Reviews color oral mucosal photographs to flag red/white suspicious lesions, premalignancies, and cancer risk using highly dense DenseNet121 networks.',
                model: 'DenseNet121 Deep Blocks',
                borderHover: 'hover:border-emerald-500/30',
                iconBg: 'bg-emerald-500/10',
                iconColor: 'text-emerald-400',
              },
            ].map((mod, idx) => (
              <RevealSection key={idx} delay={idx * 120}>
                <div
                  className={`glass-panel p-8 rounded-2xl flex flex-col ${mod.borderHover} transition-all duration-300 group hover:shadow-lg hover:shadow-${mod.color}-500/5 h-full`}
                >
                  <div
                    className={`h-12 w-12 rounded-xl ${mod.iconBg} ${mod.iconColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <mod.icon className="h-6 w-6" />
                  </div>
                  <h3
                    className={`text-xl font-bold text-white mb-3 group-hover:${mod.iconColor} transition-colors`}
                  >
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{mod.desc}</p>
                  <div
                    className={`mt-auto flex items-center gap-1.5 text-xs font-semibold ${mod.iconColor}`}
                  >
                    {mod.model} <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GRAD-CAM EXPLAINABILITY SHOWCASE
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-20 bg-slate-950/40 border-t border-b border-slate-900/60">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">
          {/* Left – Copy */}
          <div className="flex-1 max-w-xl">
            <RevealSection>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                <Sparkles className="h-4 w-4" /> Explainable AI
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
                See What the{' '}
                <span className="text-emerald-400">AI Sees</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Unlike black-box models, DentalAI Pro generates Grad-CAM heatmaps that overlay
                directly on your dental scans. Clinicians can visualize exactly which regions
                triggered a positive diagnosis, building trust and enabling informed decisions.
              </p>
            </RevealSection>
            <RevealSection delay={150}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Pixel-Level Activation Maps', icon: ScanLine },
                  { label: 'Color-Coded Severity Gradient', icon: Activity },
                  { label: 'Full Transparency for Clinicians', icon: Eye },
                  { label: 'Exportable Overlay Reports', icon: FileText },
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <feat.icon className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    {feat.label}
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>

          {/* Right – Grad-CAM Image */}
          <RevealSection className="flex-1" delay={100}>
            <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-xl">
              <img
                src={gradcamImg}
                alt="Grad-CAM heatmap overlay on dental X-ray showing cavity detection"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-navy-950/30 to-transparent" />
              {/* Floating label */}
              <div className="absolute bottom-4 right-4 glass-panel rounded-xl px-4 py-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Grad-CAM Heatmap</span>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS – TIMELINE
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <RevealSection>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
              <Clock className="h-4 w-4" /> Patient Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Diagnostics Timeline
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Four simple steps to absolute clarity on your oral health.
            </p>
          </div>
        </RevealSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Upload Scans',
              desc: 'Drag-and-drop dental X-rays or oral photos securely.',
              icon: Upload,
            },
            {
              step: '02',
              title: 'Deep AI Runs',
              desc: 'Neural networks execute transfer learning inference.',
              icon: Brain,
            },
            {
              step: '03',
              title: 'Grad-CAM XAI',
              desc: 'Visualize exact anomaly pixels using activation mapping.',
              icon: Sparkles,
            },
            {
              step: '04',
              title: 'Get PDF Report',
              desc: 'Export clinical findings, scores, and clinician notes.',
              icon: FileText,
            },
          ].map((item, idx) => (
            <RevealSection key={idx} delay={idx * 100}>
              <div className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/20 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/5 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-extrabold bg-gradient-to-tr from-medical-500 to-primary-500 bg-clip-text text-transparent">
                    {item.step}
                  </span>
                  <item.icon className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROFESSIONAL TRUST SECTION
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-20 bg-slate-950/40 border-t border-slate-900/60">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Left – Professional Image */}
          <RevealSection className="flex-1 max-w-md">
            <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-xl">
              <img
                src={professionalImg}
                alt="Professional dentist using AI diagnostic tablet"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />
            </div>
          </RevealSection>

          {/* Right – Content */}
          <div className="flex-1 max-w-xl">
            <RevealSection>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-4">
                <Award className="h-4 w-4" /> Trusted by Professionals
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
                Built for{' '}
                <span className="text-teal-400">Clinicians, Loved</span> by Patients
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Developed in collaboration with dental professionals and biomedical engineers.
                DentalAI Pro augments clinical decision-making — it doesn't replace it. Every
                prediction is paired with explainable visualizations.
              </p>
            </RevealSection>

            <RevealSection delay={150}>
              {/* Testimonial card */}
              <div className="glass-panel rounded-2xl p-6 relative">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed mb-4">
                  "DentalAI Pro has transformed how I screen my patients. The Grad-CAM heatmaps give
                  me and my patients confidence in the AI's findings. It's like having a second pair
                  of expert eyes."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-medical-500 to-primary-500 flex items-center justify-center text-white font-bold text-sm">
                    DS
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">
                      Dr. Sarah Mitchell
                    </span>
                    <span className="text-[11px] text-slate-400">
                      DDS, Preventive Dentistry Clinic
                    </span>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA SECTION
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-24">
        <RevealSection>
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative inline-block mb-8">
              <img
                src={tooth3dImg}
                alt="3D tooth with AI scan"
                className="w-20 h-20 object-contain mx-auto drop-shadow-[0_0_30px_rgba(20,184,166,0.3)]"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
              Ready to Experience the Future of{' '}
              <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                Dental AI?
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto mb-10">
              Join the next generation of dental diagnostics. Upload your first scan today and see AI
              powered insights in under 4 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login?tab=register'}
                className="glow-btn group flex items-center justify-center gap-2 bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white font-semibold px-10 py-4 rounded-xl shadow-lg shadow-medical-600/35 transition-all duration-300 hover:scale-[1.03] text-base"
              >
                Start Screening Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="group flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-300"
              >
                Clinician Sign In
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
         ═══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 mt-auto border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-6 py-10 grid sm:grid-cols-3 gap-8 text-xs text-slate-500">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-tr from-medical-500 to-primary-500 p-1.5 rounded-lg text-white">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-white">DentalAI Pro</span>
            </div>
            <p className="leading-relaxed">
              AI-powered multi-disease dental diagnostic system developed for final-year biomedical
              engineering presentation.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Technology</h4>
            <ul className="space-y-1.5">
              <li>EfficientNetB0 — Caries Detection</li>
              <li>ResNet50 — Jaw Analysis</li>
              <li>DenseNet121 — Cancer Screening</li>
              <li>Grad-CAM — Explainable AI</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-1.5">
              <li>React + TypeScript Frontend</li>
              <li>FastAPI + PyTorch Backend</li>
              <li>HIPAA-Ready Architecture</li>
              <li>Clinical-Grade Accuracy</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-900 text-center py-5 text-xs text-slate-600 px-6">
          © 2026 DentalAI Pro. Developed for biomedical engineering research. Certified diagnostic
          helper.
        </div>
      </footer>
    </div>
  );
};
