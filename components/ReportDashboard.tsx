import React, { useState } from 'react';
import { SeoReport } from '../types';
import { MetricCard } from './MetricCard';
import { TrafficChart } from './TrafficChart';
import { Activity, ShieldCheck, Target, ExternalLink, Download, FileText, Link as LinkIcon, TrendingUp, User, Wrench, Lightbulb, ArrowUpRight, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportDashboardProps {
  report: SeoReport;
}

// Helper per formattare i numeri grandi (es. 1.2k)
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

// Componente Sparkline SVG per le keyword
const RankSparkline = ({ data, color = "#34d399" }: { data: number[], color?: string }) => {
  if (!data || data.length < 2) return <span className="text-slate-500 text-xs">Dati insuff.</span>;
  
  const width = 80;
  const height = 25;
  // SEO Rank: 1 is best (top), 100 is worst (bottom)
  const maxRank = Math.max(...data, 20); // Dynamic floor
  const minRank = 1;
  
  const points = data.map((rank, i) => {
    const x = (i / (data.length - 1)) * width;
    // Normalize: Rank 1 -> y=2, Rank Max -> y=height-2
    const normalized = (rank - minRank) / (maxRank - minRank);
    const y = normalized * (height - 4) + 2; 
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex items-center gap-2" title={`Storico: ${data.join(' → ')}`}>
      <svg width={width} height={height} className="overflow-visible opacity-80">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle 
            cx={(data.length - 1) / (data.length - 1) * width} 
            cy={((data[data.length-1] - minRank) / (maxRank - minRank)) * (height - 4) + 2} 
            r="2.5" 
            fill={color} 
        />
      </svg>
    </div>
  );
};

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<'tech' | 'client'>('tech');

  // --- PDF GENERATION: TECNICO ---
  const downloadTechPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("IrideSEOArchitect", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); 
    doc.text(`Audit Tecnico Avanzato: ${report.url}`, 14, 30);

    // Metrics Overview
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Metriche di Autorità", 14, 50);
    
    const metrics = [
      [`Zoom Auth: ${report.zoomAuthority}/100`, `Zoom Trust: ${report.zoomTrust}/100`],
      [`Backlinks: ${formatNumber(report.backlinksCount)}`, `Ref. Domains: ${formatNumber(report.referringDomains)}`]
    ];
    autoTable(doc, {
      startY: 55,
      head: [],
      body: metrics,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 }
    });

    // Summary
    doc.setFontSize(12);
    doc.text("Analisi Tecnica", 14, (doc as any).lastAutoTable.finalY + 15);
    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(report.summary, pageWidth - 28);
    doc.text(summaryLines, 14, (doc as any).lastAutoTable.finalY + 20);

    // Opportunities Table (Priority)
    let currentY = (doc as any).lastAutoTable.finalY + 25 + (summaryLines.length * 4);
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38); // Red for emphasis
    doc.text("Opportunità 'Striking Distance' (Pagina 2 → 1)", 14, currentY);
    doc.setTextColor(0,0,0);

    const oppRows = report.opportunityKeywords.map(k => [
      k.term, 
      k.currentRank, 
      k.volume, 
      k.potential
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Keyword', 'Pos. Attuale', 'Volume', 'Potenziale']],
      body: oppRows,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] }
    });

    // Recommendations
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Strategia Operativa", 14, currentY);
    
    const recRows = report.recommendations.map(r => [
      r.category,
      r.impact,
      r.title
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Area', 'Impatto', 'Azione']],
      body: recRows,
      theme: 'striped'
    });

    doc.save(`Iride_Audit_Tecnico_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // --- PDF GENERATION: CLIENTE ---
  const downloadClientPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Friendly
    doc.setFillColor(79, 70, 229); 
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text("Strategia di Crescita", pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.text(report.url, pageWidth / 2, 35, { align: 'center' });

    // Client Summary
    doc.setTextColor(0,0,0);
    doc.setFontSize(14);
    doc.text("La Situazione Attuale", 14, 70);
    doc.setFontSize(11);
    const clientLines = doc.splitTextToSize(report.clientSummary, pageWidth - 28);
    doc.text(clientLines, 14, 80);

    doc.save(`Iride_Strategia_Cliente_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Actions - Full Width Responsive */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-4 md:p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Analisi Tecnica Avanzata</h2>
          <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Crawler Mode: Active • Target: <span className="text-white font-mono break-all">{report.url}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={downloadTechPDF}
              className="flex-1 md:flex-none justify-center items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all text-sm border border-slate-700"
            >
              <Wrench size={16} />
              Report Tecnico
            </button>
            <button 
              onClick={downloadClientPDF}
              className="flex-1 md:flex-none justify-center items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-indigo-500/20"
            >
              <User size={16} />
              Report Cliente
            </button>
        </div>
      </div>

      {/* Summary Tabs */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
        <div className="flex border-b border-slate-800">
            <button 
                onClick={() => setActiveTab('tech')}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'tech' ? 'bg-slate-800 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
            >
                Diagnosi Tecnica (Webmaster)
            </button>
            <button 
                onClick={() => setActiveTab('client')}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'client' ? 'bg-slate-800 text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
            >
                Visione Business (Cliente)
            </button>
        </div>
        <div className="p-4 md:p-6">
            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {activeTab === 'tech' ? report.summary : report.clientSummary}
            </p>
        </div>
      </div>

      {/* Key Metrics Grid - Adaptive 1-2-4 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard 
          title="Zoom Authority (ZA)" 
          value={report.zoomAuthority} 
          subtitle="Popolarità del Dominio"
          color={report.zoomAuthority > 50 ? "green" : "orange"}
          info="Stima l'autorevolezza del dominio (0-100) basandosi sulla quantità e qualità dei backlink. Simile a DA di Moz o ZA di SEOZoom."
        />
        <MetricCard 
          title="Zoom Trust (ZT)" 
          value={report.zoomTrust} 
          subtitle="Indice di Fiducia"
          color={report.zoomTrust >= report.zoomAuthority ? "green" : "rose"}
          info="Indica quanto Google si fida del sito. Se ZT < ZA, il sito potrebbe avere link spam o manipolati."
        />
        <MetricCard 
          title="Backlink Profile" 
          value={formatNumber(report.backlinksCount)} 
          subtitle={`${report.referringDomains} Domini Unici`}
          color="purple"
          info="Numero totale di link che puntano al sito. La stima include link profondi che i tool gratuiti spesso non vedono (Iceberg Theory)."
        />
        <MetricCard 
          title="Opportunità" 
          value={report.opportunityKeywords.length} 
          subtitle="Striking Distance"
          color="orange"
          info="Keyword posizionate in 2ª pagina (pos 11-20). Richiedono poco sforzo per entrare in Top 10 e generare traffico immediato."
        />
      </div>

      {/* Main Charts Area - Adaptive 1-3 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 p-4 md:p-6 rounded-xl border border-slate-800 backdrop-blur-sm flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity size={18} className="text-indigo-400" />
                Trend Traffico Organico (12 Mesi)
                </h3>
            </div>
            <TrafficChart data={report.trafficTrend} />
          </div>

          {/* Anchor Strategy Visualization */}
          {report.anchorProfile && (
              <div className="pt-6 border-t border-slate-800">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <LinkIcon size={18} className="text-blue-400" />
                        Anchor Text Profile
                    </h3>
                    <div className="group relative">
                         <Info size={16} className="text-slate-500 cursor-help" />
                         <div className="absolute right-0 bottom-6 w-64 p-2 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded shadow-xl z-20 opacity-0 group-hover:opacity-100 pointer-events-none">
                            Un profilo sano ha un'alta % di 'Brand' e 'URL'. Troppe 'Exact Match' possono causare penalizzazioni.
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    {report.anchorProfile.map((anchor, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>{anchor.type} <span className="text-slate-600">({anchor.example})</span></span>
                                <span>{anchor.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${
                                        anchor.type === 'Brand' ? 'bg-emerald-500' : 
                                        anchor.type === 'Exact Match' ? 'bg-rose-500' :
                                        anchor.type === 'Generic' ? 'bg-blue-400' : 'bg-slate-400'
                                    }`} 
                                    style={{ width: `${anchor.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
          )}
        </div>

        {/* Competitors List (Overlap) */}
        <div className="bg-slate-900/50 p-4 md:p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target size={18} className="text-rose-400" />
                Competitor Organici
            </h3>
             <div className="group relative">
                <Info size={16} className="text-slate-500 cursor-help" />
                <div className="absolute right-0 top-6 w-64 p-2 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded shadow-xl z-20 opacity-0 group-hover:opacity-100 pointer-events-none">
                    Overlap SERP: Indica quanto spesso il tuo sito appare nelle stesse pagine di ricerca del competitor. Più è alto, più il rivale è diretto.
                </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {report.competitors.map((comp, idx) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white text-sm">{comp.name}</h4>
                  <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                    {comp.overlapScore}% Overlap
                  </span>
                </div>
                <div className="text-xs text-slate-500 mb-2 truncate">
                    {comp.url}
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${comp.overlapScore}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">
                    ~{comp.commonKeywords} Keyword Comuni
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunity Table (Gems) - NEW SECTION */}
      {report.opportunityKeywords.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-500/30 backdrop-blur-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Lightbulb size={18} className="text-yellow-400" />
                        Gemme Nascoste (Striking Distance)
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        Keyword in posizione 11-30. Ottimizza queste pagine per entrare in Top 10 velocemente.
                    </p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-indigo-900/30 text-indigo-200 uppercase tracking-wider font-medium text-xs">
                        <tr>
                            <th className="px-4 md:px-6 py-4 whitespace-nowrap">Keyword</th>
                            <th className="px-4 md:px-6 py-4 whitespace-nowrap">Vol. Stimato</th>
                            <th className="px-4 md:px-6 py-4 text-center whitespace-nowrap">Posizione</th>
                            <th className="px-4 md:px-6 py-4 text-center whitespace-nowrap">Trend Recente</th>
                            <th className="px-4 md:px-6 py-4 whitespace-nowrap">Potenziale</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-500/10">
                        {report.opportunityKeywords.map((kw, i) => (
                            <tr key={i} className="hover:bg-indigo-500/5 transition-colors">
                                <td className="px-4 md:px-6 py-4 font-medium text-white min-w-[150px]">
                                    <div className="flex items-center gap-2">
                                        {kw.term}
                                        <a href={`https://www.google.com/search?q=${encodeURIComponent(kw.term)}`} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-indigo-400">
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4">{kw.volume}</td>
                                <td className="px-4 md:px-6 py-4 text-center">
                                    <span className="bg-slate-800 text-slate-200 px-2 py-1 rounded border border-slate-700 font-mono">
                                        #{kw.currentRank}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 flex justify-center">
                                    <RankSparkline data={kw.rankHistory} color="#facc15" />
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <span className={`text-xs font-bold uppercase ${kw.potential === 'Alto' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                        {kw.potential}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Top 10 Ranking Table */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 backdrop-blur-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                Keyword in Prima Pagina (Top 10)
            </h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-800/50 text-slate-200 uppercase tracking-wider font-medium text-xs">
                    <tr>
                        <th className="px-4 md:px-6 py-4 whitespace-nowrap">Keyword</th>
                        <th className="px-4 md:px-6 py-4 whitespace-nowrap">Volume</th>
                        <th className="px-4 md:px-6 py-4 text-center whitespace-nowrap">Posizione Attuale</th>
                        <th className="px-4 md:px-6 py-4 text-center whitespace-nowrap">Trend (6 Mesi)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {report.topKeywords.map((kw, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 md:px-6 py-4 font-medium text-white min-w-[150px]">{kw.term}</td>
                            <td className="px-4 md:px-6 py-4">{kw.volume}</td>
                            <td className="px-4 md:px-6 py-4 text-center">
                                <span className="text-white font-bold text-lg">#{kw.currentRank}</span>
                            </td>
                            <td className="px-4 md:px-6 py-4 flex justify-center">
                                <RankSparkline data={kw.rankHistory} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-slate-900/50 p-4 md:p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-400" />
          Strategia Operativa (Zoom Logic)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.recommendations.map((rec, idx) => (
            <div key={idx} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg hover:border-indigo-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  rec.category === 'Content Gap' ? 'bg-purple-500/10 text-purple-400' :
                  rec.category === 'Anchor Strategy' ? 'bg-blue-500/10 text-blue-400' :
                  rec.category === 'Authority' ? 'bg-orange-500/10 text-orange-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {rec.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded border ${
                    rec.impact === 'Critico' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' : 
                    rec.impact === 'Alto' ? 'border-emerald-500/30 text-emerald-400' : 
                    'border-slate-600 text-slate-500'
                }`}>
                    {rec.impact}
                </span>
              </div>
              <h4 className="text-white font-medium mb-1 group-hover:text-indigo-300 transition-colors">{rec.title}</h4>
              <p className="text-sm text-slate-400">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sources Footer */}
      {report.sources && report.sources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Fonti Intelligence</h4>
            <div className="flex flex-wrap gap-2">
                {report.sources.map((source, idx) => (
                    <a 
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noreferrer" 
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded transition-colors"
                    >
                        <LinkIcon size={10} />
                        {source.title.substring(0, 30)}...
                    </a>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};