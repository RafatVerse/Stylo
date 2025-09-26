import React from 'react';
import type { HistoryItem } from '../types';
import { Icon } from './Icon';

interface HistoryItemCardProps {
  item: HistoryItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const HistoryItemCard: React.FC<HistoryItemCardProps> = React.memo(({ item, isSelected, onSelect, onDelete }) => {
  return (
    <div 
      className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer group ${isSelected ? 'border-indigo-500' : 'border-transparent hover:border-gray-600'}`}
      onClick={() => onSelect(item.id)}
    >
      <img
        src={`data:image/jpeg;base64,${item.thumbnail}`}
        alt="Generated mockup thumbnail"
        className="w-full h-auto aspect-square object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 flex flex-col justify-end">
        <p className="text-xs text-gray-300 line-clamp-2">{item.prompt}</p>
        <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id);
        }}
        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Delete history item"
      >
        <Icon path="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" className="w-4 h-4"/>
      </button>
    </div>
  );
});


interface HistorySidebarProps {
  isOpen: boolean;
  history: HistoryItem[];
  selectedHistoryId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, history, selectedHistoryId, onSelect, onDelete, onClearAll, onClose }) => {
  return (
    <aside className={`fixed top-0 right-0 h-full bg-gray-900 border-l border-gray-700 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-80`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">History</h2>
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            aria-label="Close history"
          >
            <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
            Close
          </button>
        </div>
        
        {history.length > 0 ? (
          <>
            <div className="flex-grow overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                {history.map(item => (
                  <HistoryItemCard
                    key={item.id}
                    item={item}
                    isSelected={selectedHistoryId === item.id}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-700">
              <button 
                onClick={onClearAll}
                className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:bg-red-900/50 py-2 rounded-lg transition-colors"
              >
                <Icon path="M14.12 10.47L12 12.59l-2.12-2.12-1.41 1.41L10.59 14l-2.12 2.12 1.41 1.41L12 15.41l2.12 2.12 1.41-1.41L13.41 14l2.12-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" className="w-5 h-5"/>
                Clear All History
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 p-4">
            <Icon path="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" className="w-16 h-16 opacity-50 mb-4"/>
            <h3 className="font-semibold text-gray-400">No History Yet</h3>
            <p className="text-sm">Your generated mockups will appear here.</p>
          </div>
        )}
      </div>
    </aside>
  );
};