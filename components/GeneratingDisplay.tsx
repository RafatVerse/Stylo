import React, { useState, useEffect } from 'react';

interface GeneratingDisplayProps {
  isOpen: boolean;
  elapsedTime: number;
}

const loadingMessages = [
  "Warming up the AI's creative circuits...",
  'Analyzing your product and prompt...',
  'Mixing digital paints and pixels...',
  'Consulting with the muses of photography...',
  'Adjusting virtual studio lights...',
  'Rendering the final masterpiece...',
];

const longWaitMessages = {
  25: 'This is taking a bit longer than usual, but good things take time!',
  35: 'Almost there, polishing the details...',
};

export const GeneratingDisplay: React.FC<GeneratingDisplayProps> = ({ isOpen, elapsedTime }) => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    if (!isOpen) return;
    
    const messageKey = Object.keys(longWaitMessages)
      .map(Number)
      .sort((a, b) => b - a)
      .find(time => elapsedTime >= time);

    if (messageKey) {
      setMessage(longWaitMessages[messageKey as keyof typeof longWaitMessages]);
    } else {
      const index = Math.floor(elapsedTime / 5) % loadingMessages.length;
      setMessage(loadingMessages[index]);
    }
  }, [elapsedTime, isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white overflow-hidden animate-fade-in-fast">
      <div className="absolute inset-0 stars"></div>
      <div className="relative flex flex-col items-center justify-center gap-6">
        <div className="celestial-core">
          <div className="core-ring core-ring-1"></div>
          <div className="core-ring core-ring-2"></div>
          <div className="core-ring core-ring-3"></div>
          <div className="core-glow"></div>
        </div>
        <div className="particle-container">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        
        <div className="text-center z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Creating Your Vision...</h2>
          <p className="text-gray-300 text-lg">{message}</p>
          <div className="mt-4 font-mono text-xl bg-white/10 px-4 py-2 rounded-lg">
            {formatTime(elapsedTime)}
          </div>
        </div>
      </div>
      
      {/* Fix: Removed unsupported 'jsx' attribute from the <style> tag to fix TypeScript error. */}
      <style>{`
        .animate-fade-in-fast { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 60%),
            radial-gradient(ellipse at top left, rgba(173, 216, 230, 0.15) 0%, rgba(173, 216, 230, 0) 50%),
            radial-gradient(ellipse at bottom right, rgba(160, 32, 240, 0.15) 0%, rgba(160, 32, 240, 0) 50%);
          background-image: 
            url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImciIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0id2hpdGUiIHN0b3Atb3BhY2l0eT0iMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0id2hpdGUiIHN0b3Atb3BhY2l0eT0iMCIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9ImJsYWNrIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIyIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSIxIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSIyNTAiIHI9IjEuNSIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjUwIiByPSIyLjUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=');
          animation: rotateStars 120s linear infinite;
          opacity: 0.5;
        }
        
        @keyframes rotateStars {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .celestial-core {
          position: absolute;
          width: 300px;
          height: 300px;
        }
        .core-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid;
          animation: pulse-ring 4s ease-in-out infinite;
        }
        .core-ring-1 {
          border-color: rgba(129, 140, 248, 0.5);
        }
        .core-ring-2 {
          transform: scale(0.8);
          border-color: rgba(167, 139, 250, 0.5);
          animation-delay: -1s;
          animation-direction: reverse;
        }
        .core-ring-3 {
          transform: scale(0.6);
          border-color: rgba(255, 255, 255, 0.5);
          animation-delay: -2s;
        }
        .core-glow {
          position: absolute;
          inset: 30%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%);
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        @keyframes pulse-ring {
          0%, 100% { transform: scale(0.9); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(0.9); opacity: 0.4; }
          50% { transform: scale(1); opacity: 0.8; }
        }

        .particle-container {
          position: absolute;
          width: 100vw;
          height: 100vh;
        }
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 10px white, 0 0 20px #a78bfa, 0 0 30px #818cf8;
          animation: converge 5s linear infinite;
        }
        .particle:nth-child(1) { top: 5%; left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { top: 90%; left: 85%; animation-delay: -1.25s; }
        .particle:nth-child(3) { top: 15%; left: 90%; animation-delay: -2.5s; }
        .particle:nth-child(4) { top: 80%; left: 5%; animation-delay: -3.75s; }
        
        @keyframes converge {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          20% { opacity: 1; }
          100% {
            transform: translate(calc(50vw - var(--start-x, 50vw)), calc(50vh - var(--start-y, 50vh))) scale(1);
            opacity: 0;
          }
        }
        .particle:nth-child(1) { --start-x: 10vw; --start-y: 5vh; }
        .particle:nth-child(2) { --start-x: 85vw; --start-y: 90vh; }
        .particle:nth-child(3) { --start-x: 90vw; --start-y: 15vh; }
        .particle:nth-child(4) { --start-x: 5vw; --start-y: 80vh; }
      `}</style>
    </div>
  );
};
