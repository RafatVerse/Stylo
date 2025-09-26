import React from 'react';

interface FullScreenLoaderProps {
  isOpen: boolean;
  message: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ isOpen, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white animate-fade-in">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
        <div className="absolute inset-2 border-2 border-purple-500/30 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-0 rounded-full animate-pulse-fast border-2 border-indigo-400" style={{ clipPath: 'polygon(0% 0%, 10% 0%, 10% 10%, 0% 10%)' }}></div>
        <div className="absolute inset-0 rounded-full animate-pulse-fast-delay" style={{ clipPath: 'polygon(50% 0%, 60% 0%, 60% 10%, 50% 10%)', transform: 'rotate(90deg)' }}></div>
        <div className="absolute inset-0 rounded-full animate-pulse-fast" style={{ clipPath: 'polygon(90% 0%, 100% 0%, 100% 10%, 90% 10%)', transform: 'rotate(180deg)' }}></div>
      </div>
      <p className="mt-6 text-lg font-semibold tracking-wider">{message}</p>
      {/* Fix: Removed unsupported 'jsx' attribute from the <style> tag to fix TypeScript error. */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        .animate-pulse-fast { animation: pulse 1.5s infinite ease-in-out; }
        .animate-pulse-fast-delay { animation: pulse 1.5s infinite ease-in-out 0.5s; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 
          0%, 100% { opacity: 0.4; } 
          50% { opacity: 1; } 
        }
      `}</style>
    </div>
  );
};
