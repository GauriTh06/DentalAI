import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronDown, ChevronRight, TrendingUp, Shield, Microscope, DollarSign, Brain, Users, Globe, Zap } from 'lucide-react';

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`glass-panel rounded-2xl overflow-hidden border transition-colors ${open ? 'border-teal-500/30' : 'border-slate-800 hover:border-slate-700'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">{title}</span>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-teal-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-slate-800/60 pt-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ value: string; label: string; icon: React.ReactNode; color: string }> = ({ value, label, icon, color }) => (
  <div className={`glass-panel rounded-2xl p-5 border border-${color}-500/20 flex flex-col gap-2`}>
    <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>{icon}</div>
    <p className={`text-2xl font-extrabold text-${color}-400`}>{value}</p>
    <p className="text-xs text-slate-400 leading-snug">{label}</p>
  </div>
);

export const AboutPage: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-12 relative">
      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="text-center space-y-4 py-8 relative">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-4 py-2 rounded-full mb-2">
          <Brain className="h-3.5 w-3.5" /> AI-Powered Dental Healthcare
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Understanding Dental{' '}
          <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">Diagnostics</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Comprehensive knowledge base on oral diseases, AI-powered detection capabilities, and the DentalAI Pro platform's technology and business model.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-medical-600/20 transition-all mt-4"
        >
          <Activity className="h-4 w-4" /> Start Free Scan →
        </Link>
      </div>

      {/* Market Impact Stats */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" /> AI in Dentistry — Market Impact
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value="3.9B+" label="People lack access to basic oral healthcare globally (WHO, 2023)" icon={<Globe className="h-5 w-5 text-blue-400" />} color="blue" />
          <StatCard value="96.4%" label="DentalAI Pro caries detection accuracy vs 82% baseline (human dentists)" icon={<Zap className="h-5 w-5 text-teal-400" />} color="teal" />
          <StatCard value="$6.7B" label="Global AI in dentistry market size by 2030 (CAGR 22.1%)" icon={<TrendingUp className="h-5 w-5 text-emerald-400" />} color="emerald" />
          <StatCard value="450M" label="Patients affected by dental caries — most widespread non-communicable disease" icon={<Users className="h-5 w-5 text-amber-400" />} color="amber" />
        </div>
      </div>

      {/* Knowledge Base Accordions */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Microscope className="h-5 w-5 text-teal-400" /> Disease Knowledge Base
        </h2>
        <div className="space-y-4">

          {/* Caries */}
          <Accordion title="🦷 Dental Caries — What is it?" icon={<span className="text-xl">🦷</span>} defaultOpen>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">What is Dental Caries?</h4>
                <p>Dental caries (tooth decay / cavities) is a bacterial infection that causes demineralization and destruction of the hard tissues of teeth. It is caused by acid produced by bacteria (primarily <em>Streptococcus mutans</em>) fermenting carbohydrates in the diet.</p>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mt-3">Symptoms</h4>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Toothache and sensitivity to hot/cold/sweet foods</li>
                  <li>Visible holes or pits in teeth</li>
                  <li>Brown, black, or white staining on surfaces</li>
                  <li>Pain when biting down</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">How DentalAI Detects It</h4>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Model:</span><span>EfficientNetB0 (Transfer Learning)</span></div>
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Input:</span><span>Bitewing / Periapical X-rays</span></div>
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Accuracy:</span><span className="text-emerald-400 font-bold">96.4% on test set</span></div>
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">XAI:</span><span>Grad-CAM heat overlays highlight lesion zones</span></div>
                </div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mt-2">Prevention</h4>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Fluoride toothpaste twice daily</li>
                  <li>Reduce sugar intake, especially between meals</li>
                  <li>Regular dental check-ups every 6 months</li>
                  <li>Dental sealants for at-risk children</li>
                </ul>
              </div>
            </div>
          </Accordion>

          {/* Orthodontic */}
          <Accordion title="📐 Orthodontic Analysis — Malocclusion & Jaw Alignment" icon={<span className="text-xl">📐</span>}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">What is Malocclusion?</h4>
                <p>Malocclusion refers to misalignment of the teeth and/or an incorrect relationship between the upper and lower dental arches (jaws). It affects chewing, speech, and facial aesthetics.</p>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mt-3">Types of Malocclusion</h4>
                <div className="space-y-2">
                  {[
                    { type: 'Class I', desc: 'Normal jaw relationship but crowded/spaced teeth' },
                    { type: 'Class II (Overbite)', desc: 'Upper jaw protrudes excessively over lower' },
                    { type: 'Class III (Underbite)', desc: 'Lower jaw protrudes in front of upper jaw' },
                    { type: 'Open Bite', desc: 'Upper and lower teeth don\'t meet when mouth closes' },
                    { type: 'Crossbite', desc: 'Upper teeth bite inside lower teeth' },
                  ].map(m => (
                    <div key={m.type} className="bg-slate-900/50 border border-slate-800 rounded-lg p-2.5">
                      <span className="text-teal-400 font-bold">{m.type}:</span> <span>{m.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">AI Detection Approach</h4>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Model:</span><span>ResNet50 Classification</span></div>
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Input:</span><span>Cephalometric profiles / facial photos</span></div>
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Accuracy:</span><span className="text-emerald-400 font-bold">91.8% on validation set</span></div>
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Output:</span><span>Malocclusion type + severity grade</span></div>
                </div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mt-2">Treatment Options</h4>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Traditional metal braces (most effective for severe cases)</li>
                  <li>Clear aligners (e.g., Invisalign) for mild–moderate cases</li>
                  <li>Palate expanders for crossbite correction</li>
                  <li>Surgical orthodontics for skeletal discrepancies</li>
                </ul>
              </div>
            </div>
          </Accordion>

          {/* Oral Cancer */}
          <Accordion title="🔬 Oral Cancer — Early Detection Saves Lives" icon={<span className="text-xl">🔬</span>}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">What is Oral Cancer?</h4>
                <p>Oral cancer refers to cancer that develops in any part of the mouth — lips, tongue, cheeks, floor of the mouth, hard and soft palate, sinuses, and pharynx. It belongs to a broader group called head and neck cancers.</p>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mt-3">Early Warning Signs</h4>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Red or white patches in the mouth (leukoplakia / erythroplakia)</li>
                  <li>Sores that don't heal within 2 weeks</li>
                  <li>Lump or thickening in the cheeks/neck</li>
                  <li>Difficulty swallowing or moving the jaw/tongue</li>
                  <li>Persistent hoarseness or sore throat</li>
                </ul>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mt-2">
                  <p className="text-rose-300 text-[10px] font-bold">⚠️ When detected early (Stage I), oral cancer has an 80–90% survival rate. Late detection drops it to 30%.</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">DentalAI Cancer Screening</h4>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Model:</span><span>DenseNet121 (Dense Connections)</span></div>
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Input:</span><span>Macro-photographs of oral mucosa</span></div>
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Sensitivity:</span><span className="text-emerald-400 font-bold">94.2% (cancerous lesion detection)</span></div>
                  <div className="flex items-center gap-2"><span className="text-teal-400 font-bold">Specificity:</span><span className="text-emerald-400 font-bold">89.7% (benign vs malignant)</span></div>
                </div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mt-2">Risk Factors</h4>
                <ul className="space-y-1 list-disc pl-4">
                  <li>Tobacco use (smoking, chewing)</li>
                  <li>Heavy alcohol consumption</li>
                  <li>HPV-16 / HPV-18 infection</li>
                  <li>Excessive sun exposure (lip cancer)</li>
                  <li>Poor nutrition / compromised immunity</li>
                </ul>
              </div>
            </div>
          </Accordion>
        </div>
      </div>

      {/* Revenue Model */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" /> DentalAI Pro — Revenue & Business Model
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              tier: 'B2B SaaS — Clinic Subscriptions',
              price: '$299/mo per clinic',
              icon: '🏥',
              color: 'teal',
              features: [
                'Unlimited patient scan uploads',
                'Integrated dentist review panel',
                'EHR integration (HL7/FHIR)',
                'White-label branding options',
                'Priority support & SLA guarantees',
              ]
            },
            {
              tier: 'Per-Scan Credits',
              price: '$4.99 per scan',
              icon: '🔬',
              color: 'blue',
              features: [
                'Pay-as-you-go for smaller clinics',
                'No monthly commitment required',
                'Full PDF report generation',
                'Grad-CAM XAI heatmaps',
                'Secure HIPAA-compliant storage',
              ]
            },
            {
              tier: 'Data Licensing & Research API',
              price: 'Custom Pricing',
              icon: '📊',
              color: 'purple',
              features: [
                'Anonymized aggregated scan datasets',
                'For dental researchers and universities',
                'REST API access for model inference',
                'Custom model fine-tuning services',
                'Co-publication / research partnerships',
              ]
            },
            {
              tier: 'Insurance & Telemedicine',
              price: 'Revenue Sharing',
              icon: '🛡️',
              color: 'amber',
              features: [
                'Pre-authorization screening reports for insurers',
                'Remote dental triaging for rural patients',
                'Integration with telehealth platforms',
                'Supports preventative care programs',
              ]
            },
            {
              tier: 'Patient Consumer App',
              price: 'Freemium / $9.99/mo',
              icon: '📱',
              color: 'rose',
              features: [
                'Free basic screening (1 scan/month)',
                'Premium: unlimited scans + history',
                'Family plan support (up to 5 members)',
                'Push notification reminders',
                'Dentist referral network',
              ]
            },
            {
              tier: 'Government & NGO Programs',
              price: 'Grant-funded',
              icon: '🌍',
              color: 'emerald',
              features: [
                'Mass oral health screening drives',
                'Integration with national health records',
                'Rural / underserved population focus',
                'CSR partnerships with corporates',
                'Impact reporting & analytics dashboards',
              ]
            },
          ].map(m => (
            <div key={m.tier} className={`glass-panel rounded-2xl p-5 border border-${m.color}-500/20 hover:border-${m.color}-500/40 transition-colors space-y-3`}>
              <div className="flex items-start justify-between">
                <span className="text-2xl">{m.icon}</span>
                <span className={`text-[10px] font-bold text-${m.color}-400 bg-${m.color}-500/10 px-2.5 py-1 rounded-full border border-${m.color}-500/20`}>{m.price}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{m.tier}</h3>
              <ul className="space-y-1.5">
                {m.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <span className={`text-${m.color}-400 shrink-0 mt-0.5`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" /> Technology & Security
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-teal-400">AI/ML Pipeline</h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              {[
                ['CNN Architectures', 'EfficientNetB0, ResNet50, DenseNet121'],
                ['Training Framework', 'PyTorch + torchvision transfer learning'],
                ['Explainability', 'Grad-CAM gradient-weighted class activation maps'],
                ['Preprocessing', 'CLAHE normalization, 224×224 resize, augmentation'],
                ['Confidence Calibration', 'Softmax probability + temperature scaling'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500 shrink-0 w-36">{k}:</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-teal-400">Security & Compliance</h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              {[
                ['Data Storage', 'Encrypted PostgreSQL (Neon DB) + secure S3'],
                ['Authentication', 'JWT tokens + bcrypt password hashing'],
                ['API Security', 'FastAPI + CORS + rate limiting'],
                ['Image Privacy', 'EXIF metadata stripped on upload'],
                ['Compliance', 'HIPAA-aligned practices, audit logging'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500 shrink-0 w-36">{k}:</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center border border-teal-500/20 bg-gradient-to-b from-teal-500/5 to-transparent space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to transform dental diagnostics?</h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">Join thousands of clinics and patients who use DentalAI Pro for faster, smarter, and more accurate dental screening.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
          <Link to="/login?tab=register" className="bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-medical-600/20 transition-all">
            Create Free Account
          </Link>
          <Link to="/login" className="border border-slate-700 hover:border-teal-500/50 text-sm font-medium text-slate-300 hover:text-white px-8 py-3.5 rounded-xl transition-colors">
            Sign In to Platform
          </Link>
        </div>
      </div>
    </div>
  );
};
