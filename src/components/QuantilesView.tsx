import React, { useState, useEffect } from 'react';
import { Currency } from '../types';
import { formatPrice } from '../data/corridorData';
import { getCorridorQuantiles, QuantilesSummary } from '../api';

interface QuantilesViewProps {
  currency: Currency;
  onOpenCreateAlert: () => void;
}

export const QuantilesView: React.FC<QuantilesViewProps> = ({ currency, onOpenCreateAlert }) => {
  const [selectedRange, setSelectedRange] = useState<'90d' | '180d' | '365d'>('180d');
  const [data, setData] = useState<QuantilesSummary | null>(null);

  useEffect(() => {
    getCorridorQuantiles(selectedRange).then(setData);
  }, [selectedRange]);

  const quantilesList = data?.quantiles || [];
  const dayOfWeekStats = data?.dayOfWeek || [];
  const fareBuckets = data?.buckets || [];
  const sampleSize = data?.sampleSize || 2480;

  return (
    <div className="w-full px-margin-desktop py-space-lg flex flex-col gap-space-lg">
      {/* Header telemetry banner */}
      <div className="p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div>
          <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] tracking-widest uppercase">
            EMPIRICAL QUANTILES // POPULATION SAMPLE N={sampleSize.toLocaleString()}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-[#dfe2ed] font-semibold">
            Corridor Quantile Geometry &amp; Volatility Bounds
          </h1>
          <p className="font-body-md text-[#c5c6cd] mt-1 max-w-2xl">
            Mathematical distribution of Singapore Changi (SIN) ⇄ Fukuoka (FUK) non-stop flights. Direct inventory is algorithmically bound between strict seat classes by SQ Revenue Management.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0a0e15] border border-[#262a32] p-1 rounded">
          {(['90d', '180d', '365d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 rounded font-label-mono-sm text-xs cursor-pointer transition-all ${
                selectedRange === range
                  ? 'bg-[#31353d] text-[#4edea3] font-semibold border border-[#4edea3]/40'
                  : 'text-[#8f9097] hover:text-[#dfe2ed]'
              }`}
            >
              {range.toUpperCase()} WINDOW
            </button>
          ))}
        </div>
      </div>

      {/* Quantiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-space-md">
        {quantilesList.map((q) => {
          const priceFormatted = formatPrice(q.priceSGD, currency);
          return (
            <div
              key={q.percentile}
              className="p-space-md rounded bg-[#1c2027] border border-[#31353d] flex flex-col justify-between hover:border-[#4edea3]/40 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">
                  {q.percentile} PERCENTILE
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold"
                  style={{ backgroundColor: `${q.color}20`, color: q.color }}
                >
                  {q.label}
                </span>
              </div>
              <div className="my-space-md">
                <div className="font-price-stat text-price-stat" style={{ color: q.color }}>
                  {priceFormatted}
                </div>
                <div className="font-body-sm text-xs text-[#8f9097] mt-1">
                  Threshold Cutoff
                </div>
              </div>
              <p className="font-body-sm text-xs text-[#c5c6cd] leading-relaxed">
                {q.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* In-depth 2-column Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
        {/* Day of Week Pricing Dispersion (7 cols) */}
        <div className="lg:col-span-7 p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl">
          <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-[#262a32]">
            <div>
              <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] uppercase">
                DAY-OF-WEEK QUOTE DISPERSION
              </span>
              <h3 className="font-headline-md text-headline-md text-[#dfe2ed]">
                Departure Day Optimal Window
              </h3>
            </div>
            <span className="font-label-mono-sm text-xs text-[#8f9097]">
              SQ656 Historical Trough Analysis
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {dayOfWeekStats.map((item) => {
              const priceFormatted = formatPrice(item.avgSGD, currency);
              const isBest = item.day === 'Tue' || item.day === 'Sat';
              const isHigh = item.day === 'Fri' || item.day === 'Sun';
              const barPercent = Math.min(100, Math.max(10, ((item.avgSGD - 640) / (850 - 640)) * 100));

              return (
                <div key={item.day} className="p-space-sm rounded bg-[#0a0e15] border border-[#262a32] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-label-mono-sm text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#dfe2ed] w-8">{item.day}</span>
                      <span className={isBest ? 'text-[#4edea3] font-semibold' : isHigh ? 'text-[#ffb4ab]' : 'text-[#8f9097]'}>
                        {item.note}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#dfe2ed]">{priceFormatted}</span>
                  </div>

                  <div className="w-full bg-[#1c2027] h-2 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${barPercent}%`,
                        backgroundColor: isBest ? '#4edea3' : isHigh ? '#ffb4ab' : '#bcc6e1'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fare Class Buckets Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl flex flex-col justify-between">
          <div>
            <div className="mb-space-md pb-space-sm border-b border-[#262a32]">
              <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] uppercase">
                TARIFF ARCHITECTURE
              </span>
              <h3 className="font-headline-md text-headline-md text-[#dfe2ed]">
                SQ Booking Buckets
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {fareBuckets.map((bucket) => {
                const isCurrent = bucket.name === 'Economy Value';
                return (
                  <div
                    key={bucket.code}
                    className={`p-space-md rounded border transition-all ${
                      isCurrent
                        ? 'bg-[#1c2027] border-[#4edea3]/50 shadow-[0_0_12px_rgba(78,222,163,0.15)]'
                        : 'bg-[#0a0e15] border-[#262a32]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#31353d] text-[#dfe2ed]">
                          {bucket.code}
                        </span>
                        <span className="font-title-sm text-sm font-semibold text-[#dfe2ed]">
                          {bucket.name}
                        </span>
                      </div>
                      <span className="font-price-stat text-base text-[#4edea3]">
                        {formatPrice(bucket.priceSGD, currency)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs font-body-sm text-[#8f9097]">
                      <span>Baggage: {bucket.baggage}</span>
                      <span>Change: {bucket.changeFee}</span>
                      <span className={isCurrent ? 'text-[#4edea3] font-semibold' : 'text-[#8f9097]'}>
                        {bucket.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-space-md rounded bg-[#0f1a2e] border border-[#78839b]/30 flex items-center justify-between">
            <div>
              <span className="font-label-mono-sm text-xs text-[#bcc6e1] block uppercase font-semibold">
                Set Quantile Floor Alert
              </span>
              <span className="font-body-sm text-xs text-[#8f9097]">
                Instant ping if fare dips into P10 (S$715)
              </span>
            </div>
            <button
              onClick={onOpenCreateAlert}
              className="px-3 py-1.5 rounded bg-[#4edea3] text-[#003824] font-semibold text-xs hover:bg-[#6ffbbe] cursor-pointer"
            >
              Set Floor Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
