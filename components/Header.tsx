
import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {
    onToggleHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleHistory }) => {
  return (
    <header className="p-4 bg-black/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div>
                <h1 className="text-3xl font-bold text-white font-['Playfair_Display'] italic">Stylo</h1>
                <p className="text-xs text-gray-400 -mt-1">Style Your Vision.</p>
            </div>
        </div>
        <button 
            onClick={onToggleHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            aria-label="Toggle history sidebar"
        >
            <Icon path="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" className="w-5 h-5"/>
            History
        </button>
      </div>
    </header>
  );
};
