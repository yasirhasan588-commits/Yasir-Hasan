
import React, { useState } from 'react';
import { Cell, SpreadsheetState } from '../types';

interface SidebarProps {
  state: SpreadsheetState;
  onAskAI: (query: string) => void;
  isAIProcessing: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ state, onAskAI, isAIProcessing }) => {
  const [query, setQuery] = useState('');
  const activeCellData = state.activeCell ? state.cells[state.activeCell] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAskAI(query);
      setQuery('');
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-2xl z-20">
      {/* AI Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold flex items-center gap-2 text-slate-800">
            <i className="fas fa-sparkles text-blue-600"></i>
            Omni Assistant
          </h2>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold uppercase tracking-wider">PRO</span>
        </div>
        
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI to analyze, build, or correct..."
            className="w-full h-24 p-3 pr-10 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none shadow-inner"
          />
          <button 
            type="submit"
            disabled={isAIProcessing || !query.trim()}
            className="absolute bottom-3 right-3 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
          >
            {isAIProcessing ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane text-xs"></i>
            )}
          </button>
        </form>
      </div>

      {/* Contextual Info */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {activeCellData ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <h3 className="text-xs font-bold text-blue-600 uppercase mb-2">Cell Context: {state.activeCell}</h3>
              <div className="text-sm font-medium text-slate-700 mono break-all">
                {activeCellData.rawValue || <span className="text-slate-400 italic">Empty</span>}
              </div>
            </div>
            
            {activeCellData.type === 'ai' && (
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <h3 className="text-xs font-bold text-purple-600 uppercase mb-2">AI Reasoning</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeCellData.metadata?.explanation || "This cell was generated based on your instructions. Gemini verified the consistency of the surrounding context."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-mouse-pointer text-slate-300 text-xl"></i>
            </div>
            <p className="text-slate-500 text-sm">Select a cell to see AI insights or debugging information.</p>
          </div>
        )}

        {/* Suggestion Chips */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended</h3>
          <div className="flex flex-wrap gap-2">
            {['Explain this range', 'Find anomalies', 'Suggest schema', 'Create visualization'].map(s => (
              <button 
                key={s}
                onClick={() => setQuery(s)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg transition-colors border border-slate-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Status */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between items-center">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          AI Kernel Online
        </span>
        <span>LATENCY: 420ms</span>
      </div>
    </aside>
  );
};

export default Sidebar;
