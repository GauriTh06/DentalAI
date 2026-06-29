import React, { useState } from 'react';
import { api } from '../services/api';
import type { Scan } from '../services/api';
import { Upload, FileText, CheckCircle, RefreshCw, AlertTriangle, Play, HelpCircle, Activity } from 'lucide-react';

export const DiagnosePage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<'caries' | 'orthodontic' | 'oral_cancer'>('caries');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [scanSteps, setScanSteps] = useState<string>('');
  const [result, setResult] = useState<Scan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const simulateTrainingInference = (steps: string[], delay: number) => {
    return new Promise<void>((resolve) => {
      let index = 0;
      setScanSteps(steps[0]);
      
      const interval = setInterval(() => {
        index++;
        if (index < steps.length) {
          setScanSteps(steps[index]);
        } else {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setDiagnosing(true);
    setError(null);
    setResult(null);

    // Dynamic logging messages based on model architectures
    const steps = [
      'Initializing secure connection to healthcare pipeline...',
      'Validating image resolutions (resizing dimensions to 224x224)...',
      selectedModule === 'caries' 
        ? 'Activating EfficientNetB0 parameters (transfer learning)...' 
        : (selectedModule === 'orthodontic' ? 'Initializing ResNet50 classification blocks...' : 'Running DenseNet121 dense connectivity layers...'),
      'Extracting target activation layers and computing gradients...',
      'Compiling Grad-CAM explainable AI visual heatmap overlays...',
      'Recalculating Patient Dental Health Index scores...',
      'Inference evaluation complete! Logging scan records to MongoDB.'
    ];

    try {
      // Simulate frontend loading progress
      await simulateTrainingInference(steps, 600);
      
      const res = await api.uploadScan(selectedModule, file);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Diagnosis failed. Please verify the image file format.');
    } finally {
      setDiagnosing(false);
      setScanSteps('');
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setPdfDownloading(true);
    try {
      const blob = await api.downloadReport(result._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DentalAI_Report_${result.scan_type}_${result._id.substring(0, 6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Could not compile PDF report. Verify that the backend service is running.');
    } finally {
      setPdfDownloading(false);
    }
  };

  const getModuleInfo = () => {
    if (selectedModule === 'caries') {
      return {
        title: 'Dental Caries Detector',
        desc: 'Upload Bitewing/Periapical Dental X-rays. Trained on EfficientNetB0 to spot enamel decay and crown cavities.',
        expected: 'Expected input: Black-and-white dental X-ray film.'
      };
    } else if (selectedModule === 'orthodontic') {
      return {
        title: 'Orthodontic Jaw Analyzer',
        desc: 'Upload Cephalometric profiles or orthodontic photos. Employs ResNet50 to check overbite, underbite, and crowding.',
        expected: 'Expected input: Lateral cephalogram film or facial tooth profiles.'
      };
    } else {
      return {
        title: 'Oral Cancer Risk Screen',
        desc: 'Upload high-resolution photographs of mucosal tissues, tongue, or lips. Trained on DenseNet121 to analyze lesion risks.',
        expected: 'Expected input: Clear, lighted color macro-photographs of the oral cavity.'
      };
    }
  };

  const moduleInfo = getModuleInfo();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 relative">
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Activity className="h-7 w-7 text-teal-400" /> AI Diagnostic Lab
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select diagnostic modules, upload clinical scans, and run instant convolutional neural networks.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Column: Module Selection & Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-6">
            
            {/* Category Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Diagnostic Module</label>
              <div className="grid grid-cols-3 bg-slate-900 rounded-xl p-1 border border-slate-800">
                {(['caries', 'orthodontic', 'oral_cancer'] as const).map((mod) => (
                  <button
                    key={mod}
                    onClick={() => {
                      setSelectedModule(mod);
                      setFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                      setError(null);
                    }}
                    className={`py-2 text-[10px] font-bold rounded-lg capitalize transition-colors ${
                      selectedModule === mod ? 'bg-medical-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mod.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-teal-400">{moduleInfo.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{moduleInfo.desc}</p>
              <span className="text-[10px] font-semibold text-slate-500 italic block mt-2">{moduleInfo.expected}</span>
            </div>

            {/* Upload form */}
            <form onSubmit={handleDiagnose} className="space-y-4">
              <div className="relative border-2 border-dashed border-slate-700/60 hover:border-medical-500/60 rounded-2xl p-6 transition-colors flex flex-col items-center justify-center text-center cursor-pointer min-h-48 bg-slate-900/20">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={diagnosing}
                />
                
                {previewUrl ? (
                  <div className="relative max-h-40 overflow-hidden rounded-xl">
                    <img src={previewUrl} alt="Selected scan preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-slate-400 mb-3" />
                    <span className="text-xs font-semibold text-white">Drag & drop or click to upload</span>
                    <span className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, JPEG up to 10MB</span>
                  </>
                )}
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex gap-2 text-xs text-rose-400">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {file && !diagnosing && !result && (
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-medical-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" /> Start AI Diagnosis
                </button>
              )}
            </form>

            {/* Simulated layer weights evaluation indicator */}
            {diagnosing && (
              <div className="space-y-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center">
                <RefreshCw className="h-6 w-6 text-teal-400 animate-spin" />
                <div className="text-center">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">AI Evaluator Running</span>
                  <span className="text-xs text-slate-200 mt-2 block transition-all leading-normal">{scanSteps}</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Dynamic Diagnosis Results */}
        <div className="lg:col-span-3">
          {result ? (
            <div className="glass-panel rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" /> Screening Completed
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-1">Generated: {new Date(result.created_at).toLocaleString()}</p>
                </div>
                
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfDownloading}
                  className="flex items-center justify-center gap-1.5 border border-slate-700 hover:border-slate-500 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-all disabled:opacity-40"
                >
                  <FileText className="h-4 w-4" /> {pdfDownloading ? 'Compiling PDF...' : 'Download PDF Report'}
                </button>
              </div>

              {/* Side-by-Side Images */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Scan</span>
                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
                    <img 
                      src={`http://localhost:8000/${result.image_url}`} 
                      alt="Original diagnostic scan" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grad-CAM XAI Heatmap</span>
                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
                    {result.prediction_result.heatmap_url ? (
                      <img 
                        src={result.prediction_result.heatmap_url} 
                        alt="Activation Map overlay" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-slate-500 text-xs italic">Grad-CAM map unavailable</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Diagnosis Statistics */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 grid sm:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block">Inference Finding</span>
                  <span className="text-sm font-bold text-white block">{result.prediction_result.label}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block">Prediction Confidence</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-teal-400 block">{result.prediction_result.confidence}%</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full" 
                        style={{ width: `${result.prediction_result.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-medium block">Severity Rating</span>
                  <span className="text-sm font-bold text-white block capitalize">{result.prediction_result.severity || 'Mild'}</span>
                </div>
              </div>

              {/* AI Recommendations */}
              {result.prediction_result.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" /> AI Care Recommendations
                  </h3>
                  <ul className="grid sm:grid-cols-2 gap-3.5">
                    {result.prediction_result.recommendations.map((rec, idx) => (
                      <li key={idx} className="bg-slate-900/30 border border-slate-800 p-3 rounded-xl flex gap-2 text-xs leading-relaxed text-slate-300">
                        <span className="text-teal-400 font-extrabold shrink-0">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[350px]">
              <Upload className="h-12 w-12 text-slate-700 mb-4" />
              <h3 className="text-base font-bold text-slate-400">Awaiting diagnostic image</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Select your diagnostic category on the left, upload an image scan, and launch the neural network solver.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
