
import React, { useRef, useEffect } from 'react';
import { Cell, SpreadsheetState } from '../types';
import { GRID_ROWS, GRID_COLS } from '../constants';

interface GridProps {
  state: SpreadsheetState;
  onCellClick: (id: string) => void;
  onCellChange: (id: string, value: string) => void;
}

const Grid: React.FC<GridProps> = ({ state, onCellClick, onCellChange }) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const getColLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="flex-1 overflow-auto bg-slate-200 relative group" ref={gridRef}>
      <div className="inline-block min-w-full bg-white">
        {/* Header Row */}
        <div className="flex sticky top-0 z-20 shadow-sm">
          <div className="w-12 h-10 bg-slate-100 border-b border-r border-slate-300 flex items-center justify-center shrink-0">
            <i className="fas fa-expand text-slate-400 text-[10px]"></i>
          </div>
          {Array.from({ length: GRID_COLS }).map((_, i) => (
            <div 
              key={i} 
              className="w-32 h-10 bg-slate-100 border-b border-r border-slate-300 flex items-center justify-center font-semibold text-slate-500 text-sm shrink-0 uppercase tracking-wider"
            >
              {getColLabel(i)}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        {Array.from({ length: GRID_ROWS }).map((_, rowIndex) => {
          const rowNum = rowIndex + 1;
          return (
            <div key={rowIndex} className="flex group/row">
              {/* Row Label */}
              <div className="w-12 h-8 bg-slate-100 border-b border-r border-slate-300 flex items-center justify-center font-medium text-slate-400 text-xs shrink-0 sticky left-0 z-10 group-hover/row:bg-slate-200 transition-colors">
                {rowNum}
              </div>
              
              {/* Cells */}
              {Array.from({ length: GRID_COLS }).map((_, colIndex) => {
                const cellId = `${getColLabel(colIndex)}${rowNum}`;
                const cell = state.cells[cellId];
                const isActive = state.activeCell === cellId;
                const isSelected = state.selection.includes(cellId);

                return (
                  <div
                    key={cellId}
                    onClick={() => onCellClick(cellId)}
                    className={`w-32 h-8 border-b border-r border-slate-200 px-2 flex items-center text-sm relative shrink-0 transition-all overflow-hidden whitespace-nowrap
                      ${isActive ? 'ring-2 ring-blue-500 z-10 bg-blue-50/50' : ''}
                      ${isSelected && !isActive ? 'bg-blue-100/50' : 'bg-white hover:bg-slate-50'}
                      ${cell?.type === 'ai' ? 'bg-purple-50' : ''}
                    `}
                  >
                    {isActive ? (
                      <input
                        autoFocus
                        className="absolute inset-0 w-full h-full px-2 outline-none bg-white z-20"
                        defaultValue={cell?.rawValue || ''}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onCellChange(cellId, e.currentTarget.value);
                          }
                        }}
                        onBlur={(e) => onCellChange(cellId, e.target.value)}
                      />
                    ) : (
                      <span className={`truncate w-full ${cell?.type === 'ai' ? 'text-purple-600 font-medium' : ''}`}>
                        {cell?.computedValue ?? cell?.rawValue ?? ''}
                      </span>
                    )}
                    {cell?.type === 'ai' && !isActive && (
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-l-[6px] border-t-purple-500 border-l-transparent"></div>
                    )}
                    {cell?.metadata?.error && (
                       <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[6px] border-l-[6px] border-b-red-500 border-l-transparent"></div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Grid;
