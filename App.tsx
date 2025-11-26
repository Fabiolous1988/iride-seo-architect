import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { analyzeUrl } from './services/geminiService';
import { AnalysisStage, SeoReport } from './types';
import { LoadingState } from './components/LoadingState';
import { ReportDashboard } from './components/ReportDashboard';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [stage, setStage] = useState<AnalysisStage>(AnalysisStage.IDLE);
  const [report, setReport] = useState<SeoReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Basic URL validation/cleaning
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
    }

    setStage(AnalysisStage.SEARCHING);
    setReport(null);
    setError(null);

    try {
      const data = await analyzeUrl(cleanUrl, (currentStage) => {
        setStage(currentStage as AnalysisStage);
      });
      setReport(data);
      setStage(AnalysisStage.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Si è verificato un errore imprevisto durante l\'analisi.');
      setStage(AnalysisStage.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-100 selection:bg-indigo-500/30">
      
      {/* Navbar - Full Width */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-50 w-full">
        <div className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Iride<span className="text-indigo-400">SEOArchitect</span></span>
            </div>
            <div className="hidden md:block text-sm text-slate-400 font-medium">
              Analisi SEO Intelligente
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Full Width */}
      <main className="w-full px-4 md:px-8 py-8 md:py-12">
        
        {/* Hero / Input Section */}
        {stage === AnalysisStage.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
              Audit Strategici <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Potenziati dall'IA</span>
            </h1>
            <p className="max-w-2xl text-lg text-slate-400 mb-10 px-4">
              Inserisci un URL per avviare un'analisi competitiva profonda. Utilizziamo la ricerca live e modelli di ragionamento avanzati per formulare strategie operative.
            </p>
            
            <form onSubmit={handleAnalyze} className="w-full max-w-xl relative group px-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 mx-4"></div>
              <div className="relative flex items-center bg-slate-900 rounded-xl p-2 border border-slate-700 shadow-2xl">
                <Search className="text-slate-500 ml-3 shrink-0" />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="esempio.it"
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 py-3 px-4 text-base md:text-lg"
                />
                <button 
                  type="submit"
                  disabled={!url}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 md:px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                >
                  Analizza <span className="hidden sm:inline">Sito</span>
                </button>
              </div>
            </form>

            <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 text-slate-500 text-sm px-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Dati in Tempo Reale
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Ragionamento Profondo
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Strategia Operativa
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {(stage === AnalysisStage.SEARCHING || stage === AnalysisStage.THINKING) && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
             <LoadingState stage={stage} />
          </div>
        )}

        {/* Error */}
        {stage === AnalysisStage.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-2xl max-w-md w-full">
              <h3 className="text-xl font-bold text-rose-400 mb-2">Analisi Fallita</h3>
              <p className="text-slate-400 mb-6">{error}</p>
              <button 
                onClick={() => setStage(AnalysisStage.IDLE)}
                className="text-white bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-lg transition-colors w-full"
              >
                Riprova
              </button>
            </div>
          </div>
        )}

        {/* Report View */}
        {stage === AnalysisStage.COMPLETE && report && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-6 flex justify-between items-center">
              <button 
                onClick={() => setStage(AnalysisStage.IDLE)}
                className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors text-sm font-medium"
              >
                ← Analizza un altro sito
              </button>
            </div>
            <ReportDashboard report={report} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;