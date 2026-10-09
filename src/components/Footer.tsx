import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0a0e15] border-t border-[#262a32] mt-space-xl py-space-xl shadow-[0_-1px_12px_rgba(0,0,0,0.3)]">
      <div className="w-full px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex flex-col sm:flex-row items-center gap-space-md">
          <span className="font-headline-md text-headline-md text-[#dfe2ed] tracking-tight">
            FUK FARE WATCH
          </span>
          <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">
            Changi (SIN) ⇄ Fukuoka (FUK) Direct Route Engine
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-space-lg text-[#c5c6cd] font-label-mono-sm text-label-mono-sm">
          <span>LATENCY: 42ms</span>
          <span>CONFIDENCE INDEX: 94.8%</span>
          <span>AIRLINES: SQ • NH • VN</span>
        </div>
        <div className="font-label-mono-sm text-label-mono-sm text-[#8f9097]">
          © 2025 FUK FARE WATCH. Algorithmic Dispatch Console.
        </div>
      </div>
    </footer>
  );
};
