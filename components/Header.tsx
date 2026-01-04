
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  view: AppView;
  setView: (v: AppView) => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ view, setView, title }) => {
  const tabs = [
    { id: AppView.GRID, icon: 'fa-table-cells', label: 'Grid' },
    { id: AppView.DATABASE, icon: 'fa-database', label: 'Database' },
    { id: AppView.DASHBOARD, icon: 'fa-chart-line', label: 'Dashboard' },
    { id: AppView.AUTOMATION, icon: 'fa-bolt', label: 'Automations' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
          <i className="fas fa-microchip"></i>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">{title}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><i className="fas fa-cloud text-green-500"></i> Cloud Sync Active</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>v1.0.4-beta</span>
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              view === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors">
          <i className="fas fa-history"></i>
        </button>
        <button className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors">
          <i className="fas fa-cog"></i>
        </button>
        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95">
          Share
        </button>
      </div>
    </header>
  );
};

export default Header;
