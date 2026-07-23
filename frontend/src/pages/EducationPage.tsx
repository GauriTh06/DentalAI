import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Eye,
  ShieldCheck,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Zap,
  Info,
  Stethoscope,
  ChevronRight,
  ScanLine
} from 'lucide-react';

// Re-use generated dental assets
import xrayAiImg from '../assets/dental_xray_ai.png';
import modulesImg from '../assets/dental_modules.png';
import gradcamImg from '../assets/dental_gradcam.png';
import tooth3dImg from '../assets/dental_tooth_3d.png';

type TabType = 'all' | 'caries' | 'ortho' | 'cancer';

export const EducationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setSelectedFaq(selectedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 selection:bg-medical-500 selection:text-white pb-20">
      {/* ── Background Glow ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-medical-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 space-y-12">
        {/* ── Header Banner ── */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 opacity-20 pointer-events-none hidden md:block">
            <img src={tooth3dImg} alt="3D Tooth" className="w-full h-full object-contain" />
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
              <BookOpen className="h-3.5 w-3.5" /> Clinical Pathology & AI Education Guide
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Understanding Dental Pathology &{' '}
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
                AI Diagnostic Models
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore in-depth medical explanations of the three primary disease modules analyzed by DentalAI Pro: 
              Dental Caries (Decay), Orthodontic Malocclusion, and Oral Mucosal Malignancies. Learn how deep learning 
              architectures interpret X-rays and tissue photography.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/diagnose"
                className="glow-btn inline-flex items-center gap-2 bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                Run AI Screening Now <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#diseases"
                className="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-all"
              >
                Explore Diseases Below <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Tab Filter Bar ── */}
        <div id="diseases" className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-medical-600 to-primary-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Zap className="h-4 w-4" /> All Diseases
            </button>
            <button
              onClick={() => setActiveTab('caries')}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'caries'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-teal-400 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="h-4 w-4 text-teal-400" /> Dental Caries (Decay)
            </button>
            <button
              onClick={() => setActiveTab('ortho')}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'ortho'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800/50'
              }`}
            >
              <Eye className="h-4 w-4 text-blue-400" /> Orthodontic Alignment
            </button>
            <button
              onClick={() => setActiveTab('cancer')}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'cancer'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Oral Cancer Risk
            </button>
          </div>

          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-teal-400" /> Comprehensive Clinical Reference
          </span>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 1: DENTAL CARIES (CAVITIES)
           ═══════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'caries') && (
          <div className="space-y-8 glass-panel p-8 sm:p-10 rounded-3xl border border-teal-500/20 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between border-b border-slate-800 pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold">
                  <Activity className="h-3.5 w-3.5" /> Module 01 • EfficientNetB0 Model
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Dental Caries (Tooth Decay & Cavities)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
                  Dental caries is a multifactorial bacterial disease resulting in demineralization of inorganic 
                  tooth structure and destruction of organic matrix.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-800 shrink-0">
                <div className="text-center px-2">
                  <span className="text-xs text-slate-400 block">Scanned Scans</span>
                  <span className="text-sm font-bold text-teal-400">Bitewing / Periapical</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center px-2">
                  <span className="text-xs text-slate-400 block">AI Accuracy</span>
                  <span className="text-sm font-bold text-white">90.24% Precision</span>
                </div>
              </div>
            </div>

            {/* Grid Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Visual Diagnostic Sample */}
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-teal-500/30 group shadow-lg">
                  <img
                    src={xrayAiImg}
                    alt="AI Caries Detection Scan"
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-teal-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-teal-500/20">
                      Radiographic Radiopaque Analysis
                    </span>
                    <span className="text-[10px] text-slate-400 bg-navy-950/80 px-2 py-0.5 rounded">
                      Enamel to Dentin Depth
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5" /> AI Architecture: EfficientNetB0
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Trained on thousands of annotated dental bitewing radiographs to detect radiolucent shadows 
                    indicative of enamel mineral loss before visible cavitations form.
                  </p>
                </div>
              </div>

              {/* Center & Right Column: Stages & Symptoms */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <Stethoscope className="h-4.5 w-4.5 text-teal-400" /> Stages of Caries Progression
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-teal-400 block">Stage 1: Enamel Demineralization</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Sub-surface mineral loss caused by plaque acids. Visible as white spot lesions. Reversible with fluoride therapy.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-amber-400 block">Stage 2: Dentin Breakdown</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Decay penetrates the hard enamel into soft dentin tubules. Sensitivity to sweet, hot, or cold foods begins.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-rose-400 block">Stage 3: Pulp Involvement</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Bacteria invade the central dental pulp chamber containing blood vessels and nerves. Causes severe throbbing pain.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-purple-400 block">Stage 4: Periapical Abscess</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Infection spreads beyond the root apex into jawbone tissue. Requires root canal therapy or extraction.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-400" /> Key Warning Symptoms
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" /> Sudden tooth pain or unprovoked aching</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" /> Sharp sensitivity to hot, cold, or sugary drinks</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" /> Visible dark brown or black pits on chewing surfaces</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" /> Food trapping between adjacent teeth</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" /> Clinical Prevention & Advice
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Brush 2x daily with fluoride toothpastes (1450 ppm)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Daily interdental flossing to clean proximal surfaces</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Pit and fissure sealants on vulnerable molars</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Biannual clinical dental examinations and X-rays</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SECTION 2: ORTHODONTIC JAW & OCCLUSION ANALYSIS
           ═══════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'ortho') && (
          <div className="space-y-8 glass-panel p-8 sm:p-10 rounded-3xl border border-blue-500/20 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between border-b border-slate-800 pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
                  <Eye className="h-3.5 w-3.5" /> Module 02 • ResNet50 Backbone
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Orthodontic Jaw Alignment & Occlusion
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
                  Orthodontics diagnoses and corrects misaligned teeth and jaw relationships (malocclusion) to optimize 
                  chewing function, speech articulation, and facial aesthetics.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-800 shrink-0">
                <div className="text-center px-2">
                  <span className="text-xs text-slate-400 block">Scanned Scans</span>
                  <span className="text-sm font-bold text-blue-400">Cephalometric / Profile</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center px-2">
                  <span className="text-xs text-slate-400 block">AI Accuracy</span>
                  <span className="text-sm font-bold text-white">91.67% Classification</span>
                </div>
              </div>
            </div>

            {/* Grid Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Modules Visual */}
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 group shadow-lg">
                  <img
                    src={modulesImg}
                    alt="Orthodontic Analysis Diagram"
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-blue-500/20">
                      Cephalometric Angle Mapping
                    </span>
                    <span className="text-[10px] text-slate-400 bg-navy-950/80 px-2 py-0.5 rounded">
                      SNA / SNB Metrics
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5" /> AI Architecture: ResNet50 Deep Residual Network
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Evaluates skeletal profile angles and tooth positioning vector relationships to automatically 
                    categorize Angle Classifications of malocclusion.
                  </p>
                </div>
              </div>

              {/* Center & Right Column: Classifications */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <ScanLine className="h-4.5 w-4.5 text-blue-400" /> Angle’s Malocclusion Classifications
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-teal-400 block">Class I Normal / Crowding</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Normal molar relationship, but teeth may overlap, crowd, or have spacing gaps.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-blue-400 block">Class II (Overbite / Retrognathism)</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Upper jaw protrudes significantly forward over the lower jaw (receding chin profile).
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-purple-400 block">Class III (Underbite / Prognathism)</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Lower jaw extends forward past the upper teeth, causing an inverted bite.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-400" /> Risks of Untreated Malocclusion
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Excessive tooth wear and enamel chipping</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Temporomandibular Joint (TMJ) pain and clicking</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Difficulty in effective plaque removal leading to gum disease</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Speech impediments and chewing discomfort</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" /> Modern Orthodontic Solutions
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Clear 3D Printed Aligners (Invisalign / ClearCorrect)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Traditional Ceramic or Metallic Brackets</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Palatal Expanders for narrow maxillary arches</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Orthognathic surgical correction for severe skeletal cases</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SECTION 3: ORAL CANCER & MUCOSAL RISK SCREENING
           ═══════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'cancer') && (
          <div className="space-y-8 glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/20 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between border-b border-slate-800 pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" /> Module 03 • DenseNet121 Deep Blocks
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Oral Cancer & Premalignant Mucosal Screening
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
                  Early detection of Oral Squamous Cell Carcinoma (OSCC) and potentially malignant oral disorders 
                  (PMODs) dramatically increases 5-year survival rates from 50% to over 85%.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-800 shrink-0">
                <div className="text-center px-2">
                  <span className="text-xs text-slate-400 block">Scanned Scans</span>
                  <span className="text-sm font-bold text-emerald-400">Oral Mucosal Photo</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center px-2">
                  <span className="text-xs text-slate-400 block">AI Accuracy</span>
                  <span className="text-sm font-bold text-white">93.67% Sensitivity</span>
                </div>
              </div>
            </div>

            {/* Grid Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Grad-CAM Explainability Image */}
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 group shadow-lg">
                  <img
                    src={gradcamImg}
                    alt="Grad-CAM Oral Cancer Heatmap"
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-emerald-500/20">
                      Grad-CAM Heatmap Localization
                    </span>
                    <span className="text-[10px] text-amber-300 bg-navy-950/80 px-2 py-0.5 rounded">
                      High Sensitivity Area
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5" /> AI Architecture: DenseNet121 Neural Network
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Uses feature reuse layers to detect subtle cellular discoloration, ulceration contours, and 
                    keratotic texture patterns from clinical color photographs.
                  </p>
                </div>
              </div>

              {/* Center & Right Column: Lesion Types & Risk Factors */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-400" /> Mucosal Lesion Classifications
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-slate-200 block">Leukoplakia (White Patches)</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Firm white patches on tongue or floor of mouth that cannot be wiped away. 5–25% dysplasia risk.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-rose-400 block">Erythroplakia (Red Patches)</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Velvety red mucosal lesions with high malignant transformation rate (over 70% dysplasia).
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-amber-400 block">Non-healing Ulcerations</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Persistent oral sores or raised indurated borders lasting more than 14 days without healing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-rose-400" /> Primary Risk Factors
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" /> Tobacco use (Cigarettes, cigars, chew, gutka, paan)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" /> Heavy alcohol consumption (synergistic risk with tobacco)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" /> High-risk HPV infection (Human Papillomavirus type 16)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" /> Chronic mechanical trauma from broken teeth or dentures</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" /> Clinical Action Protocol
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Flag suspicious lesions for immediate specialist referral</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Perform scalpel or punch biopsy for histopathology</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Toluidine blue staining and autofluorescence screening</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Routine self-examination of tongue borders & oral cavity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SECTION 4: AI MODEL COMPARISON & GRAD-CAM EXPLAINABILITY
           ═══════════════════════════════════════════════════════════ */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-semibold">
              <Brain className="h-3.5 w-3.5" /> Technical AI Benchmark
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Behind the Deep Learning Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              DentalAI Pro utilizes custom transfer learning backbones fine-tuned on curated clinical datasets. 
              Here is how each neural network functions under the hood.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-teal-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  EfficientNetB0
                </span>
                <span className="text-xs text-slate-500">Caries Detection</span>
              </div>
              <h3 className="text-base font-bold text-white">Compound Scaling Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scales network depth, width, and resolution uniformly using MBConv (Mobile Inverted Bottleneck Convolution) 
                blocks for rapid feature extraction on dental X-rays.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Input: 224x224 grayscale</span>
                <span className="font-semibold text-teal-400">Accuracy: 90.24%</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ResNet50
                </span>
                <span className="text-xs text-slate-500">Orthodontic Profile</span>
              </div>
              <h3 className="text-base font-bold text-white">Residual Connections</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses skip connections to solve the vanishing gradient problem, enabling deep 50-layer feature hierarchy 
                to measure skeletal profile angles and bite alignments.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Input: 224x224 cephalometric</span>
                <span className="font-semibold text-blue-400">Accuracy: 91.67%</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  DenseNet121
                </span>
                <span className="text-xs text-slate-500">Oral Cancer Screen</span>
              </div>
              <h3 className="text-base font-bold text-white">Dense Connectivity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects every layer to every subsequent layer in a feed-forward fashion, maximizing information flow 
                and detecting subtle mucosal color variations.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Input: 224x224 RGB photos</span>
                <span className="font-semibold text-emerald-400">Sensitivity: 93.67%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 5: PATIENT FAQ & MYTHS VS FACTS
           ═══════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Frequently Asked Dental Health Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Clear, clinician-reviewed answers to common concerns about dental screening and AI diagnosis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {[
              {
                q: "Can AI replace my regular dentist visit?",
                a: "No. DentalAI Pro serves as a clinical screening helper and early warning tool. It provides automated preliminary assessments and Grad-CAM heatmaps, but final diagnosis and surgical/restorative treatment must always be performed by a licensed attending dentist."
              },
              {
                q: "How early can DentalAI detect cavities?",
                a: "Our fine-tuned EfficientNetB0 model can detect subtle radiolucencies in interproximal enamel before cavities become visually apparent to the naked eye or cause physical toothache."
              },
              {
                q: "What types of images should I upload for oral cancer screening?",
                a: "Upload clear, well-lit, high-resolution clinical photographs of the oral cavity (tongue, cheek lining, palate, or gums). Ensure proper lighting and no heavy shadows."
              },
              {
                q: "What does a high Grad-CAM heatmap intensity mean?",
                a: "The Grad-CAM heatmap highlights the specific pixel regions that the neural network relied upon to make its classification. Warm colors (red/orange) indicate areas of highest diagnostic interest for clinician review."
              },
              {
                q: "Is dental radiation from X-rays safe?",
                a: "Modern digital dental X-rays emit minimal radiation — equivalent to a few hours of natural background radiation or a short commercial airplane flight."
              },
              {
                q: "How often should I run an AI diagnostic screening?",
                a: "We recommend logging routine X-rays every 6 to 12 months, or uploading photographs immediately whenever you notice a new persistent sore, discoloration, or tooth sensitivity."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                onClick={() => toggleFaq(idx)}
                className="glass-panel p-5 rounded-2xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-teal-400 shrink-0" />
                    {faq.q}
                  </h4>
                  <ChevronRight
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      selectedFaq === idx ? 'rotate-90 text-teal-400' : ''
                    }`}
                  />
                </div>
                {selectedFaq === idx && (
                  <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl text-center max-w-4xl mx-auto space-y-4 border border-teal-500/20 shadow-2xl">
          <h3 className="text-2xl font-bold text-white">
            Ready to Analyze Your Dental Scan?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Upload your bitewing X-ray, cephalometric scan, or oral photo to receive instant multi-disease screening scorecards.
          </p>
          <div className="pt-2">
            <Link
              to="/diagnose"
              className="glow-btn inline-flex items-center gap-2 bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all"
            >
              Upload Scan & Diagnose <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
