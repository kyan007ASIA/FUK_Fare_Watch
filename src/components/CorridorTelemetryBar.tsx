import React from 'react';
import { Currency } from '../types';
import { formatPriceCompact } from '../data/corridorData';

interface CorridorTelemetryBarProps {
  currency: Currency;
}

export const CorridorTelemetryBar: React.FC<CorridorTelemetryBarProps> = ({ currency }) => {
  const minPrice = formatPriceCompact(642, currency);
  const maxPrice = formatPriceCompact(1180, currency);
  const medianPrice = formatPriceCompact(785, currency);

  return (
    <section className="w-full px-margin-desktop py-space-md bg-[#0a0e15] border-b border-[#262a32]/60">
      <div className="w-full flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-space-md">
          {/* Corridor Tag */}
          <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded bg-[#262a32] border border-[#45474d]/50">
            <span className="font-headline-md text-headline-md text-[#dfe2ed] font-semibold tracking-tight">SIN</span>
            <span className="material-symbols-outlined text-[#bcc6e1] text-[18px]">sync_alt</span>
            <span className="font-headline-md text-headline-md text-[#4edea3] font-semibold tracking-tight">FUK</span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] ml-space-xs uppercase tracking-wider">Direct Only</span>
          </div>

          {/* Bounds Capsule */}
          <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded bg-[#1c2027] border border-[#31353d]">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#c5c6cd]">HISTORICAL BOUNDS:</span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#dfe2ed] font-semibold">
              {minPrice} – {maxPrice}
            </span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] mx-space-xs">|</span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#c5c6cd]">MEDIAN:</span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] font-semibold">
              {medianPrice}
            </span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] mx-space-xs">|</span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#c5c6cd]">CADENCE: 42 RUNS/DAY</span>
          </div>

          {/* Zero Stop Enforcement Tag */}
          <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded bg-[#181c23] border border-[#31353d]/70">
            <span className="material-symbols-outlined text-[#ffb95f] text-[16px]">verified</span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#dfe2ed]">ZERO-STOP ENFORCED</span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097]">(TPE/HKG REJECTED)</span>
          </div>
        </div>

        {/* Sakura Window Banner */}
        <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded bg-[#281600] border border-[#ffb95f]/30 shadow-sm">
          <span className="text-[16px]">🌸</span>
          <span className="font-label-mono-sm text-label-mono-sm text-[#ffb95f] font-semibold uppercase tracking-wide">
            Fukuoka Sakura Peak Window
          </span>
          <span className="font-label-mono-sm text-label-mono-sm text-[#ffb95f]/80">
            Departures: Mar 22 – Apr 08 (High Demand Volatility)
          </span>
        </div>
      </div>
    </section>
  );
};
