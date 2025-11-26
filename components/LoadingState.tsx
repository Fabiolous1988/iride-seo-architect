import React from 'react';
import { AnalysisStage } from '../types';

interface LoadingStateProps {
  stage: AnalysisStage;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ stage }) => {
  if (stage === AnalysisStage.IDLE || stage === AnalysisStage.COMPLETE || stage === AnalysisStage.ERROR) return null;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        {stage === AnalysisStage.THINKING && (
           <div className="absolute inset-2 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin direction-reverse duration-1000"></div>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">
        {stage === AnalysisStage.SEARCHING ? 'Raccolta Intelligence...' : 'Analisi Strategica Profonda...'}
      </h3>
      <p className="text-slate-400 max-w-md">
        {stage === AnalysisStage.SEARCHING 
          ? 'Scansione dei risultati di ricerca live, identificazione dei competitor e stima delle metriche di traffico.' 
          : 'Sintesi dei dati, simulazione di scenari competitivi e formulazione di strategie di crescita operative.'}
      </p>
    </div>
  );
};