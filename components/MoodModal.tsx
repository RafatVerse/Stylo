import React from 'react';
import { Icon } from './Icon';

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMood: (mood: string) => void;
  moods: readonly string[];
}

export const MoodModal: React.FC<MoodModalProps> = ({ isOpen, onClose, onSelectMood, moods }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🎨</span> Choose a Mood
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
            <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto pr-2 -mr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {moods.map(mood => (
              <button
                key={mood}
                onClick={() => onSelectMood(mood)}
                className="p-4 bg-gray-800 rounded-lg text-center text-white font-semibold hover:bg-indigo-600 hover:scale-105 transition-all duration-200"
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Fix: Removed unsupported 'jsx' attribute from the <style> tag to fix TypeScript error. */}
      <style>{`
        .animate-fade-in-fast { animation: fadeIn 0.2s ease-out; }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};
