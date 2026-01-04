
import React, { useState, useCallback, useEffect } from 'react';
import { AppView, SpreadsheetState, Cell, CellType } from './types';
import Header from './components/Header';
import Grid from './components/Grid';
import Sidebar from './components/Sidebar';
import { evaluateFormula } from './utils/formulaEngine';
import { omniAI } from './services/geminiService';

const INITIAL_STATE: SpreadsheetState = {
  id: 'project-1',
  name: 'Global Supply Chain Analysis',
  cells: {
    'A1': { id: 'A1', rawValue: 'Product Name', computedValue: 'Product Name', type: 'raw' },
    'B1': { id: 'B1', rawValue: 'Quantity', computedValue: 'Quantity', type: 'raw' },
    'C1': { id: 'C1', rawValue: 'Unit Price', computedValue: 'Unit Price', type: 'raw' },
    'D1': { id: 'D1', rawValue: 'Total', computedValue: 'Total', type: 'raw' },
    'A2': { id: 'A2', rawValue: 'Omnistation 5', computedValue: 'Omnistation 5', type: 'raw' },
    'B2': { id: 'B2', rawValue: '150', computedValue: 150, type: 'raw' },
    'C2': { id: 'C2', rawValue: '499.99', computedValue: 499.99, type: 'raw' },
    'D2': { id: 'D2', rawValue: '=B2*C2', computedValue: 74998.5, type: 'formula' },
  },
  tables: [],
  history: [],
  activeCell: 'D2',
  selection: [],
};

const App: React.FC = () => {
  const [state, setState] = useState<SpreadsheetState>(INITIAL_STATE);
  const [view, setView] = useState<AppView>(AppView.GRID);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const handleCellClick = (id: string) => {
    setState(prev => ({ ...prev, activeCell: id, selection: [id] }));
  };

  const handleCellChange = useCallback((id: string, value: string) => {
    setState(prev => {
      const type: CellType = value.startsWith('=') ? 'formula' : value.startsWith('?') ? 'ai' : 'raw';
      
      const newCell: Cell = {
        id,
        rawValue: value,
        computedValue: type === 'formula' ? evaluateFormula(value, prev.cells) : value,
        type,
        metadata: {
          lastUpdated: Date.now()
        }
      };

      const newState = {
        ...prev,
        cells: { ...prev.cells, [id]: newCell }
      };

      // Trigger AI if it's an inline AI prompt
      if (type === 'ai') {
        processAICommand(value.substring(1), id);
      }

      return newState;
    });
  }, []);

  const processAICommand = async (command: string, targetCellId?: string) => {
    setIsAIProcessing(true);
    try {
      const result = await omniAI.processNaturalLanguageInstruction(command, state);
      
      setState(prev => {
        const newCells = { ...prev.cells };
        
        result.cellUpdates.forEach((update: {id: string, value: string}) => {
          newCells[update.id] = {
            id: update.id,
            rawValue: update.value,
            computedValue: update.value,
            type: 'ai',
            metadata: {
              explanation: result.reasoning,
              lastUpdated: Date.now()
            }
          };
        });

        // If target cell provided, update its metadata
        if (targetCellId && newCells[targetCellId]) {
          newCells[targetCellId].metadata = {
            ...newCells[targetCellId].metadata,
            explanation: result.reasoning
          };
        }

        return { ...prev, cells: newCells };
      });
    } catch (error) {
      console.error("Failed to process AI command", error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header view={view} setView={setView} title={state.name} />
      
      <main className="flex-1 flex overflow-hidden">
        {view === AppView.GRID && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Formula Bar */}
            <div className="h-10 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
              <div className="w-12 h-6 flex items-center justify-center font-mono text-xs font-bold text-slate-500 bg-slate-100 rounded">
                {state.activeCell || '--'}
              </div>
              <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>
              <div className="flex items-center text-slate-400">
                <i className="fas fa-italic text-sm"></i>
              </div>
              <input
                className="flex-1 h-full px-2 outline-none text-sm font-mono bg-transparent"
                value={state.activeCell ? state.cells[state.activeCell]?.rawValue || '' : ''}
                onChange={(e) => state.activeCell && handleCellChange(state.activeCell, e.target.value)}
                placeholder="Enter value, =formula, or ?AI command..."
              />
            </div>
            
            <Grid 
              state={state} 
              onCellClick={handleCellClick} 
              onCellChange={handleCellChange} 
            />
          </div>
        )}

        {view === AppView.DASHBOARD && (
          <div className="flex-1 bg-slate-100 p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Project Dashboard</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Add Widget</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Revenue', value: '$1.4M', change: '+12%', color: 'blue' },
                  { label: 'Active SKU Count', value: '4,281', change: '-2%', color: 'emerald' },
                  { label: 'AI Insights Found', value: '18', change: 'Actionable', color: 'purple' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                    <div className="flex items-end gap-2">
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-96 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                   <i className="fas fa-chart-pie text-slate-300 text-3xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Visualizations Auto-generated</h3>
                <p className="text-slate-500 max-w-sm mt-2">Gemini is currently analyzing your grid data to suggest the most relevant charts for your KPIs.</p>
                <button 
                  onClick={() => processAICommand("Generate a sales breakdown chart based on current data")}
                  className="mt-6 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all shadow-lg active:scale-95"
                >
                   Generate with AI
                </button>
              </div>
            </div>
          </div>
        )}

        {(view === AppView.DATABASE || view === AppView.AUTOMATION) && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white">
            <i className={`fas ${view === AppView.DATABASE ? 'fa-database' : 'fa-bolt'} text-6xl mb-6 opacity-20`}></i>
            <h2 className="text-xl font-bold text-slate-600">Module coming soon in v1.1</h2>
            <p className="text-sm mt-2 max-w-xs text-center leading-relaxed">
              We're polishing the {view === AppView.DATABASE ? 'relational schema engine' : 'event-driven trigger system'} to ensure zero-latency execution.
            </p>
          </div>
        )}

        <Sidebar 
          state={state} 
          onAskAI={(q) => processAICommand(q)} 
          isAIProcessing={isAIProcessing}
        />
      </main>

      {/* Status Bar */}
      <footer className="h-6 bg-slate-800 text-white flex items-center px-4 justify-between text-[10px] uppercase font-bold tracking-widest shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Ready</span>
          <span>7 Cells Calculated</span>
          <span>Region: us-east-1</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Formula Engine: Standard-v2</span>
          <span>Zoom: 100%</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
