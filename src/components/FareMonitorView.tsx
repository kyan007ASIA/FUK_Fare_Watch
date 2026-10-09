import React, { useState } from 'react';
import { Currency, ScenarioType } from '../types';
import { SCENARIOS, HISTORICAL_CHART_TICKS, formatPrice, formatPriceCompact } from '../data/corridorData';
import { createAlertSubscription } from '../api';

interface FareMonitorViewProps {
  currency: Currency;
  isPolling: boolean;
  onRefreshPoll: () => void;
  onOpenCreateAlert: () => void;
}

export const FareMonitorView: React.FC<FareMonitorViewProps> = ({
  currency,
  isPolling,
  onRefreshPoll,
  onOpenCreateAlert
}) => {
  // Controlled Route Inputs
  const [depDate, setDepDate] = useState('2025-10-18');
  const [retDate, setRetDate] = useState('2025-10-28');
  const [passengers, setPassengers] = useState('1');
  const [cabinClass, setCabinClass] = useState('Y');
  const [flexOffset, setFlexOffset] = useState<number>(0);

  // Scenario Simulator
  const [scenarioKey, setScenarioKey] = useState<ScenarioType>('buynow');
  const currentScenario = SCENARIOS[scenarioKey];

  // Tooltip state for SVG chart
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; price: number } | null>(null);

  // In-card Alert Subscription
  const [alertEmail, setAlertEmail] = useState('changi.trader@singapore.com');
  const [alertTelegram, setAlertTelegram] = useState('@sg_farewatch_bot');
  const [alertRecChange, setAlertRecChange] = useState(true);
  const [alertPriceDrop, setAlertPriceDrop] = useState(true);
  const [alertThresholdSGD, setAlertThresholdSGD] = useState<number>(720);
  const [alertSuccess, setAlertSuccess] = useState(false);

  // MCP Inspector Tab
  const [mcpTab, setMcpTab] = useState<'search' | 'recommendation'>('search');
  const [copiedMcp, setCopiedMcp] = useState(false);

  // Calculate duration in days between depDate and retDate
  const getTripDays = () => {
    try {
      const d1 = new Date(depDate);
      const d2 = new Date(retDate);
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 10;
    } catch {
      return 10;
    }
  };
  const tripDurationDays = getTripDays();

  // Pricing conversions
  const observedQuote = formatPrice(currentScenario.priceSGD, currency);
  const p20Quote = formatPrice(750, currency);
  const p80Quote = formatPrice(890, currency);
  const medianQuote = formatPrice(785, currency);
  const bundleQuote = formatPrice(742, currency);
  const splitLeg1 = formatPrice(410, currency);
  const splitLeg2 = formatPrice(390, currency);
  const splitTotal = formatPrice(800, currency);
  const savingsAmount = formatPriceCompact(58, currency);

  // Dynamic MCP payload
  const mcpSearchPayload = {
    jsonrpc: '2.0',
    tool: 'tool_search_fares',
    parameters: {
      origin: 'SIN',
      destination: 'FUK',
      non_stop_only: true,
      departure_date: depDate,
      return_date: retDate,
      cabin: cabinClass === 'Y' ? 'economy' : cabinClass === 'W' ? 'premium_economy' : 'business',
      passengers: parseInt(passengers, 10),
      flex_days: flexOffset
    },
    result: {
      carrier: 'Singapore Airlines',
      outbound: {
        flight: 'SQ656',
        departure: '01:20 SGT',
        arrival: '08:35 JST',
        duration: '6h 15m',
        stops: 0,
        equipment: 'Boeing 787-10'
      },
      inbound: {
        flight: 'SQ655',
        departure: '09:45 JST',
        arrival: '15:20 SGT',
        duration: '6h 35m',
        stops: 0,
        equipment: 'Boeing 787-10'
      },
      pricing: {
        bundle_roundtrip_sgd: 742.0,
        split_one_way_total_sgd: 800.0,
        strategy_recommended: 'BUNDLE_ROUNDTRIP',
        savings_sgd: 58.0
      }
    }
  };

  const mcpRecPayload = {
    jsonrpc: '2.0',
    tool: 'tool_get_recommendation',
    parameters: {
      origin: 'SIN',
      destination: 'FUK',
      current_fare_sgd: currentScenario.priceSGD,
      days_to_departure: currentScenario.daysToTakeoff
    },
    result: {
      corridor: 'SIN-FUK',
      recommendation: scenarioKey.toUpperCase(),
      confidence: currentScenario.confidence.split(' ')[0],
      historical_metrics: {
        corridor_p20_sgd: 750,
        corridor_median_sgd: 785,
        corridor_p80_sgd: 890,
        sample_size: 82
      },
      price_velocity_per_week: currentScenario.velocity,
      rationale: currentScenario.title
    }
  };

  const handleCopyMcp = () => {
    const payload = mcpTab === 'search' ? mcpSearchPayload : mcpRecPayload;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2000);
  };

  return (
    <div className="w-full px-margin-desktop py-space-lg grid grid-cols-1 xl:grid-cols-12 gap-gutter-desktop">
      {/* Left & Center Primary Deck: Controls & Intelligence (Cols 1-8) */}
      <div className="xl:col-span-8 flex flex-col gap-space-lg">
        {/* Interactive Corridor Control Panel */}
        <div className="p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md pb-space-md border-b border-[#262a32]">
            <div className="flex flex-col">
              <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] tracking-widest uppercase">
                DISPATCH CONTROLLER // ROUTE QUERY
              </span>
              <h1 className="font-headline-md text-headline-md text-[#dfe2ed] font-semibold">
                Singapore Changi ⇄ Fukuoka Direct Corridor
              </h1>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-[#262a32] border border-[#45474d]/50">
              <span className="material-symbols-outlined text-[#4edea3] text-[16px]">flight_takeoff</span>
              <span className="font-label-mono-sm text-label-mono-sm text-[#dfe2ed]">
                SQ656 / SQ655 B787-10 Direct
              </span>
            </div>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md pt-space-md">
            {/* Departure Date */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase flex items-center justify-between">
                <span>DEPARTURE DATE</span>
                <span className="text-[#4edea3] font-label-mono-sm">SIN 01:20</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={depDate}
                  onChange={(e) => setDepDate(e.target.value)}
                  className="w-full bg-[#31353d] font-label-mono-lg text-label-mono-lg text-[#dfe2ed] px-space-md py-space-sm rounded border border-[#45474d] focus:outline-none focus:ring-1 focus:ring-[#4edea3] transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Return Date */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase flex items-center justify-between">
                <span>RETURN DATE</span>
                <span className="text-[#4edea3] font-label-mono-sm">FUK 09:45</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={retDate}
                  onChange={(e) => setRetDate(e.target.value)}
                  className="w-full bg-[#31353d] font-label-mono-lg text-label-mono-lg text-[#dfe2ed] px-space-md py-space-sm rounded border border-[#45474d] focus:outline-none focus:ring-1 focus:ring-[#4edea3] transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">PASSENGERS</label>
              <div className="relative">
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full bg-[#31353d] font-body-md text-body-md text-[#dfe2ed] px-space-md py-space-sm rounded appearance-none border border-[#45474d] focus:outline-none focus:ring-1 focus:ring-[#4edea3] cursor-pointer"
                >
                  <option value="1">1 Adult (Primary)</option>
                  <option value="2">2 Adults (Duo)</option>
                  <option value="3">3 Adults (Family)</option>
                  <option value="4">4 Adults (Max Squad)</option>
                </select>
                <span className="absolute right-3 top-2.5 material-symbols-outlined text-[#8f9097] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Cabin Class */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">CABIN CLASS</label>
              <div className="relative">
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full bg-[#31353d] font-body-md text-body-md text-[#dfe2ed] px-space-md py-space-sm rounded appearance-none border border-[#45474d] focus:outline-none focus:ring-1 focus:ring-[#4edea3] cursor-pointer"
                >
                  <option value="Y">Economy (Core Tracking)</option>
                  <option value="W">Premium Economy</option>
                  <option value="J">Business Class (Lie-Flat)</option>
                </select>
                <span className="absolute right-3 top-2.5 material-symbols-outlined text-[#8f9097] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Flexibility Matrix Selector */}
          <div className="mt-space-md pt-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md bg-[#0a0e15] p-space-md rounded border border-[#262a32]">
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">
                OUTBOUND DEPARTURE FLEXIBILITY:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[-3, -2, -1, 0, 1, 2, 3].map((val) => {
                  const label = val === 0 ? 'Exact (0d)' : `${val > 0 ? '+' : ''}${val}d`;
                  const isSelected = flexOffset === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFlexOffset(val)}
                      className={`px-2.5 py-1 rounded font-label-mono-sm text-label-mono-sm cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#4edea3] text-[#003824] font-semibold shadow-[0_0_8px_rgba(78,222,163,0.4)]'
                          : 'bg-[#31353d] text-[#c5c6cd] hover:text-[#dfe2ed] hover:bg-[#45474d]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-space-md self-end md:self-center">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] font-semibold">
                  {tripDurationDays}-DAY DURATION
                </span>
                <span className="font-body-sm text-body-sm text-[#8f9097]">
                  {depDate} – {retDate}
                </span>
              </div>
              <button
                type="button"
                onClick={onRefreshPoll}
                className="flex items-center gap-space-xs px-space-lg py-2 rounded bg-[#4edea3] text-[#003824] font-semibold text-sm shadow-[0_0_16px_rgba(78,222,163,0.3)] hover:bg-[#6ffbbe] transition-all cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[18px] ${isPolling ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                <span>{isPolling ? 'Querying Ignav & SQ...' : 'Check Direct Fares & Predict'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CORE ML & STATISTICAL RECOMMENDATION ENGINE CARD */}
        <div className="p-space-lg rounded bg-[#1c2027] border border-[#31353d] shadow-2xl relative overflow-hidden">
          {/* Ambient Signal Glow Backing */}
          <div
            className={`absolute -top-10 -right-10 w-64 h-64 rounded-full ${currentScenario.glowColor} opacity-10 blur-3xl pointer-events-none transition-all duration-500`}
          />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md mb-space-md">
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className={`flex items-center gap-space-xs px-space-md py-space-xs rounded font-label-mono-lg text-label-mono-lg font-bold ${currentScenario.signalClass}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${currentScenario.glowColor} animate-pulse`} />
                <span>{currentScenario.signalText}</span>
              </div>
              <span className="px-space-sm py-space-xs rounded bg-[#31353d] font-label-mono-sm text-label-mono-sm text-[#c5c6cd]">
                {currentScenario.confidence}
              </span>
            </div>

            {/* Scenario Simulation Switcher */}
            <div className="flex items-center gap-1 bg-[#0a0e15] p-1 rounded border border-[#262a32]">
              <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] mr-2 uppercase text-[10px]">
                ML State Simulator:
              </span>
              {(['buynow', 'wait', 'buyby'] as ScenarioType[]).map((st) => {
                const label = st === 'buynow' ? 'BUY NOW' : st === 'wait' ? 'WAIT' : 'BUY BY (URGENT)';
                const isSelected = scenarioKey === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setScenarioKey(st)}
                    className={`px-2.5 py-1 rounded font-label-mono-sm text-label-mono-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#262a32] text-[#4edea3] font-semibold border border-[#4edea3]/40'
                        : 'text-[#c5c6cd] hover:text-[#dfe2ed]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plain-English Algorithmic Rationale */}
          <div className="p-space-md rounded bg-[#0a0e15] border border-[#262a32] mb-space-md">
            <div className="flex items-start gap-space-sm">
              <span className={`material-symbols-outlined text-[24px] mt-0.5 ${
                scenarioKey === 'buyby' ? 'text-[#ffb95f]' : scenarioKey === 'wait' ? 'text-[#bcc6e1]' : 'text-[#4edea3]'
              }`}>
                {currentScenario.symbol}
              </span>
              <div className="flex flex-col gap-space-xs">
                <span className="font-title-sm text-title-sm text-[#dfe2ed] font-semibold">
                  {currentScenario.title}
                </span>
                <p className="font-body-md text-body-md text-[#c5c6cd]">
                  {scenarioKey === 'buynow' ? (
                    <>
                      Current fare of <span className="font-semibold text-[#dfe2ed]">{observedQuote}</span> sits in the bottom <span className="text-[#4edea3] font-semibold">18th percentile</span> of all direct quotes recorded on the SIN ⇄ FUK corridor. Singapore Airlines seat buckets (Economy Value/Standard) are shrinking; regression shows a <span className="text-[#4edea3] font-semibold">78% probability of price upward hike</span> once the window narrows inside 30 days.
                    </>
                  ) : scenarioKey === 'wait' ? (
                    <>
                      Observed fare is currently at <span className="font-semibold text-[#dfe2ed]">{observedQuote}</span> (P64 percentile). Flight SQ656 still maintains open allocation in promotional sub-classes (K / V). Past trajectory models suggest a temporary drop of ~S$50–S$70 over the next 10 days before locking in.
                    </>
                  ) : (
                    <>
                      Current direct fare is <span className="font-semibold text-[#dfe2ed]">{observedQuote}</span>. Only <span className="text-[#ffb95f] font-semibold">{currentScenario.daysToTakeoff} days remaining</span> to flight departure. Once the calendar crosses the 14-day threshold, Singapore Airlines automated revenue management removes discount booking classes universally across the corridor.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Four Key Quantitative Telemetry Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
            {/* Tile 1: Observed Quote */}
            <div className="p-space-md rounded bg-[#262a32] border border-[#31353d] flex flex-col justify-between">
              <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">OBSERVED QUOTE</span>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className="font-price-stat text-price-stat text-[#4edea3]">
                  {observedQuote}
                </span>
                <span className="font-label-mono-sm text-label-mono-sm text-[#c5c6cd]">NET</span>
              </div>
              <span className="font-body-sm text-body-sm text-[#8f9097] mt-1">
                {currentScenario.deltaText}
              </span>
            </div>

            {/* Tile 2: 20th Percentile (P20) */}
            <div className="p-space-md rounded bg-[#262a32] border border-[#31353d] flex flex-col justify-between">
              <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">20TH PERCENTILE (P20)</span>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className="font-price-stat text-price-stat text-[#dfe2ed]">
                  {p20Quote}
                </span>
                <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097]">{currency}</span>
              </div>
              <span className="font-body-sm text-body-sm text-[#4edea3] mt-1">Deep value cutoff</span>
            </div>

            {/* Tile 3: 7-Day Velocity */}
            <div className="p-space-md rounded bg-[#262a32] border border-[#31353d] flex flex-col justify-between">
              <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">7-DAY VELOCITY</span>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className={`font-price-stat text-price-stat ${currentScenario.velocityColor}`}>
                  {currentScenario.velocity}
                </span>
              </div>
              <span className={`font-body-sm text-body-sm ${currentScenario.velocityColor} mt-1`}>
                {currentScenario.velocityStatus}
              </span>
            </div>

            {/* Tile 4: Days to Takeoff */}
            <div className="p-space-md rounded bg-[#262a32] border border-[#31353d] flex flex-col justify-between">
              <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">DAYS TO TAKEOFF</span>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className="font-price-stat text-price-stat text-[#dfe2ed]">
                  {currentScenario.daysToTakeoff}d
                </span>
                <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097]">REMAINING</span>
              </div>
              <span className="font-body-sm text-body-sm text-[#8f9097] mt-1">
                Target lock: before {p80Quote} bump
              </span>
            </div>
          </div>
        </div>

        {/* FLIGHT OFFER & PRICING STRATEGY COMPARATOR (BUNDLE VS 2X ONE-WAY) */}
        <div className="p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md pb-space-md">
            <div className="flex flex-col">
              <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] uppercase tracking-wider">
                STRATEGY AUDIT // BEST TARIFF CONSTRUCT
              </span>
              <h2 className="font-headline-md text-headline-md text-[#dfe2ed]">
                Direct Flight Schedule &amp; Split vs Bundle Comparison
              </h2>
            </div>
            <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded bg-[#31353d] border border-[#45474d]">
              <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] font-semibold">
                CHEAPER: ROUND-TRIP BUNDLE (SAVED {savingsAmount})
              </span>
            </div>
          </div>

          {/* Singapore Airlines Non-Stop Flight Route Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mb-space-lg">
            {/* Outbound SQ656 */}
            <div className="p-space-md rounded bg-[#31353d]/50 border border-[#45474d]/50 flex flex-col justify-between gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded bg-[#0f1a2e] border border-[#bcc6e1]/40 flex items-center justify-center font-label-mono-sm text-label-mono-sm text-[#bcc6e1] font-bold">
                    SQ
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-sm text-title-sm text-[#dfe2ed] font-semibold">
                      Singapore Airlines • SQ656
                    </span>
                    <span className="font-body-sm text-body-sm text-[#8f9097]">
                      Boeing 787-10 Dreamliner • Non-Stop
                    </span>
                  </div>
                </div>
                <span className="px-space-sm py-space-xs rounded bg-[#1c2027] font-label-mono-sm text-label-mono-sm text-[#4edea3] border border-[#4edea3]/20">
                  0 STOPS
                </span>
              </div>

              <div className="flex items-center justify-between py-space-xs">
                <div className="flex flex-col">
                  <span className="font-price-stat text-price-stat text-[#dfe2ed]">01:20</span>
                  <span className="font-body-sm text-body-sm text-[#c5c6cd]">SIN (Changi T3)</span>
                </div>
                <div className="flex flex-col items-center flex-1 px-space-md">
                  <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097]">6h 15m</span>
                  <div className="w-full flex items-center gap-1 my-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                    <div className="h-0.5 flex-1 bg-[#45474d]"></div>
                    <span className="material-symbols-outlined text-[14px] text-[#bcc6e1]">flight</span>
                    <div className="h-0.5 flex-1 bg-[#45474d]"></div>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                  </div>
                  <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3]">DIRECT NON-STOP</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-price-stat text-price-stat text-[#dfe2ed]">08:35</span>
                  <span className="font-body-sm text-body-sm text-[#c5c6cd]">FUK (Fukuoka Int'l)</span>
                </div>
              </div>

              <div className="flex items-center justify-between font-label-mono-sm text-label-mono-sm text-[#8f9097] pt-space-xs border-t border-[#45474d]/30">
                <span>Date: {depDate}</span>
                <span>Meal Included • Wi-Fi Available</span>
              </div>
            </div>

            {/* Inbound SQ655 */}
            <div className="p-space-md rounded bg-[#31353d]/50 border border-[#45474d]/50 flex flex-col justify-between gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded bg-[#0f1a2e] border border-[#bcc6e1]/40 flex items-center justify-center font-label-mono-sm text-label-mono-sm text-[#bcc6e1] font-bold">
                    SQ
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-sm text-title-sm text-[#dfe2ed] font-semibold">
                      Singapore Airlines • SQ655
                    </span>
                    <span className="font-body-sm text-body-sm text-[#8f9097]">
                      Boeing 787-10 Dreamliner • Non-Stop
                    </span>
                  </div>
                </div>
                <span className="px-space-sm py-space-xs rounded bg-[#1c2027] font-label-mono-sm text-label-mono-sm text-[#4edea3] border border-[#4edea3]/20">
                  0 STOPS
                </span>
              </div>

              <div className="flex items-center justify-between py-space-xs">
                <div className="flex flex-col">
                  <span className="font-price-stat text-price-stat text-[#dfe2ed]">09:45</span>
                  <span className="font-body-sm text-body-sm text-[#c5c6cd]">FUK (Fukuoka Int'l)</span>
                </div>
                <div className="flex flex-col items-center flex-1 px-space-md">
                  <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097]">6h 35m</span>
                  <div className="w-full flex items-center gap-1 my-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                    <div className="h-0.5 flex-1 bg-[#45474d]"></div>
                    <span className="material-symbols-outlined text-[14px] text-[#bcc6e1]">flight</span>
                    <div className="h-0.5 flex-1 bg-[#45474d]"></div>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                  </div>
                  <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3]">DIRECT NON-STOP</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-price-stat text-price-stat text-[#dfe2ed]">15:20</span>
                  <span className="font-body-sm text-body-sm text-[#c5c6cd]">SIN (Changi T3)</span>
                </div>
              </div>

              <div className="flex items-center justify-between font-label-mono-sm text-label-mono-sm text-[#8f9097] pt-space-xs border-t border-[#45474d]/30">
                <span>Date: {retDate}</span>
                <span>Meal Included • Wi-Fi Available</span>
              </div>
            </div>
          </div>

          {/* Strategy Audit Breakdown Table */}
          <div className="overflow-x-auto rounded bg-[#31353d]/40 border border-[#45474d] p-space-md">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">
                TICKETING STRATEGY COMPARISON ENGINE
              </span>
              <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3]">
                LIVE AUDIT COMPLETE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* Strategy Option 1: Bundle */}
              <div className="p-space-md rounded bg-[#1c2027] border border-[#4edea3]/40 flex flex-col justify-between relative shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-title-sm text-title-sm text-[#dfe2ed] font-semibold">
                    1. Round-Trip Bundle (Recommended)
                  </span>
                  <span className="px-space-xs py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-label-mono-sm text-label-mono-sm font-semibold">
                    BEST VALUE
                  </span>
                </div>
                <div className="my-space-md flex items-baseline justify-between">
                  <span className="font-body-sm text-body-sm text-[#c5c6cd]">All legs on Single SQ PNR</span>
                  <span className="font-price-stat text-price-stat text-[#4edea3]">
                    {bundleQuote}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-[#8f9097]">
                  Protects checked baggage through-flow and Singapore Airlines integrated itinerary rebooking rights.
                </p>
              </div>

              {/* Strategy Option 2: Split 2x One-Ways */}
              <div className="p-space-md rounded bg-[#1c2027] border border-[#31353d] flex flex-col justify-between opacity-85">
                <div className="flex items-center justify-between">
                  <span className="font-title-sm text-title-sm text-[#dfe2ed] font-semibold">
                    2. Split Two One-Ways (2 Distinct PNRs)
                  </span>
                  <span className="px-space-xs py-0.5 rounded bg-[#31353d] text-[#8f9097] font-label-mono-sm text-label-mono-sm">
                    +{savingsAmount} More
                  </span>
                </div>
                <div className="my-space-md flex flex-col gap-1">
                  <div className="flex items-center justify-between font-label-mono-sm text-label-mono-sm text-[#c5c6cd]">
                    <span>SIN → FUK (SQ656):</span>
                    <span>{splitLeg1}</span>
                  </div>
                  <div className="flex items-center justify-between font-label-mono-sm text-label-mono-sm text-[#c5c6cd]">
                    <span>FUK → SIN (SQ655):</span>
                    <span>{splitLeg2}</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-[#262a32]">
                    <span className="font-body-sm text-body-sm text-[#8f9097]">Sum of 2x One-Ways:</span>
                    <span className="font-title-sm text-title-sm text-[#dfe2ed] font-bold">{splitTotal}</span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-[#8f9097]">
                  Carrier pricing models penalize unbundled single segment bookings on this specific corridor.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md mt-space-md pt-space-sm border-t border-[#45474d]/30">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[#4edea3] text-[16px]">verified_user</span>
                <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097]">
                  Data verified via Ignav Direct API + Apify kuezi fallback cache
                </span>
              </div>
              <a
                href="https://www.singaporeair.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded bg-[#4edea3] text-[#003824] font-semibold text-sm hover:bg-[#6ffbbe] transition-all shadow-md"
              >
                <span>Book Direct on SingaporeAir.com</span>
                <span className="font-label-mono-sm font-semibold">({bundleQuote})</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>
          </div>
        </div>

        {/* DUAL PRICE TELEMETRY CHARTS SECTION */}
        <div className="p-space-lg rounded bg-[#1c2027] border border-[#31353d] shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md pb-space-md">
            <div className="flex flex-col">
              <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] uppercase tracking-wider">
                HISTORICAL QUOTES &amp; REGRESSION
              </span>
              <h2 className="font-headline-md text-headline-md text-[#dfe2ed]">
                Corridor Pricing Geometry (Last 60 Days vs Curve)
              </h2>
            </div>
            <div className="flex items-center gap-space-sm font-label-mono-sm text-label-mono-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#4edea3]"></span> Observed Fare
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#8f9097]"></span> Median ({medianQuote})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#bcc6e1]"></span> 20th Pctl ({p20Quote})
              </span>
            </div>
          </div>

          {/* Chart 1: Interactive SVG Price History Timeline */}
          <div className="w-full bg-[#0a0e15] border border-[#262a32] p-space-md rounded relative">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">
                60-DAY DIRECT FARE EVOLUTION • OBSERVED SQ QUOTES
              </span>
              <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3]">
                {hoveredPoint ? `Observed: ${hoveredPoint.label}` : 'Hover points to inspect pricing ticks'}
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg className="w-full h-56 text-[#8f9097] select-none overflow-visible" viewBox="0 0 740 220">
                <defs>
                  <linearGradient id="areaGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4edea3" stopOpacity="0.25"></stop>
                    <stop offset="100%" stopColor="#4edea3" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>

                {/* Reference Band: P80 Line (S$890) */}
                <line stroke="currentColor" strokeDasharray="4,4" strokeOpacity="0.2" x1="40" x2="720" y1="35" y2="35" />
                <text className="font-label-mono-sm text-[10px]" fill="currentColor" opacity="0.6" x="44" y="30">
                  P80 Threshold ({p80Quote})
                </text>

                {/* Reference Band: Median Line (S$785) */}
                <line stroke="currentColor" strokeDasharray="6,4" strokeOpacity="0.35" x1="40" x2="720" y1="95" y2="95" />
                <text className="font-label-mono-sm text-[10px]" fill="currentColor" opacity="0.7" x="44" y="90">
                  Corridor Median ({medianQuote})
                </text>

                {/* Reference Band: P20 Target Line (S$750) */}
                <line stroke="#bcc6e1" strokeDasharray="2,2" strokeOpacity="0.6" x1="40" x2="720" y1="135" y2="135" />
                <text className="font-label-mono-sm text-[10px]" fill="#bcc6e1" opacity="0.85" x="44" y="130">
                  P20 Deep Value Line ({p20Quote})
                </text>

                {/* Shaded fill under price trajectory */}
                <path
                  d="M 50,70 L 110,65 L 170,85 L 230,110 L 290,100 L 350,130 L 410,120 L 470,145 L 530,150 L 590,138 L 650,148 L 710,142 L 710,190 L 50,190 Z"
                  fill="url(#areaGlow)"
                />

                {/* Price curve line */}
                <path
                  d="M 50,70 L 110,65 L 170,85 L 230,110 L 290,100 L 350,130 L 410,120 L 470,145 L 530,150 L 590,138 L 650,148 L 710,142"
                  fill="none"
                  stroke="#4edea3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />

                {/* Interactive Points */}
                {HISTORICAL_CHART_TICKS.map((pt, idx) => {
                  const isCurrent = pt.isCurrent;
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredPoint({ label: pt.label, price: pt.priceSGD })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {isCurrent ? (
                        <>
                          <circle className="animate-pulse" cx={pt.x} cy={pt.y} fill="#6ffbbe" r="6" />
                          <circle cx={pt.x} cy={pt.y} fill="none" r="10" stroke="#6ffbbe" strokeOpacity="0.6" strokeWidth="1.5" />
                        </>
                      ) : (
                        <circle cx={pt.x} cy={pt.y} fill="#4edea3" r="4" className="hover:r-6 hover:fill-white transition-all" />
                      )}
                    </g>
                  );
                })}

                {/* X-Axis Labels */}
                <text className="font-label-mono-sm text-[10px]" fill="currentColor" opacity="0.6" textAnchor="middle" x="50" y="210">T-60d</text>
                <text className="font-label-mono-sm text-[10px]" fill="currentColor" opacity="0.6" textAnchor="middle" x="170" y="210">T-40d</text>
                <text className="font-label-mono-sm text-[10px]" fill="currentColor" opacity="0.6" textAnchor="middle" x="290" y="210">T-25d</text>
                <text className="font-label-mono-sm text-[10px]" fill="currentColor" opacity="0.6" textAnchor="middle" x="410" y="210">T-15d</text>
                <text className="font-label-mono-sm text-[10px]" fill="currentColor" opacity="0.6" textAnchor="middle" x="530" y="210">T-7d</text>
                <text className="font-label-mono-sm text-[10px]" fill="currentColor" opacity="0.6" textAnchor="middle" x="650" y="210">T-1d</text>
                <text className="font-label-mono-sm text-[10px]" fill="#4edea3" fontWeight="600" textAnchor="middle" x="710" y="210">
                  NOW ({observedQuote})
                </text>
              </svg>
            </div>

            {/* Dynamic SVG Tooltip Card */}
            {hoveredPoint && (
              <div className="absolute top-4 right-4 bg-[#262a32] border border-[#45474d] px-space-sm py-1 rounded font-label-mono-sm text-label-mono-sm text-[#4edea3] shadow-lg pointer-events-none">
                {hoveredPoint.label} ({formatPrice(hoveredPoint.price, currency)})
              </div>
            )}
          </div>

          {/* Chart 2: Empirical Days-to-Departure Curve (Why 21-Day Cliff Matters) */}
          <div className="mt-space-md grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div className="md:col-span-2 p-space-md rounded bg-[#0a0e15] border border-[#262a32]">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">
                  EMPIRICAL CORRIDOR TRAJECTORY // DAYS-TO-TAKEOFF
                </span>
                <span className="font-label-mono-sm text-label-mono-sm text-[#ffb4ab] font-semibold">
                  CRITICAL 21D CLIFF
                </span>
              </div>

              {/* Days to departure SVG graphic */}
              <svg className="w-full h-28 text-[#8f9097]" viewBox="0 0 460 110">
                {/* Zone 1: Stable (>60d) */}
                <rect fill="#181c23" height="75" opacity="0.6" width="160" x="20" y="10" />
                {/* Zone 2: Sweet Spot (60d - 21d) */}
                <rect fill="#00311f" height="75" opacity="0.35" width="160" x="180" y="10" />
                {/* Zone 3: Danger Zone (<21d) */}
                <rect fill="#93000a" height="75" opacity="0.3" width="100" x="340" y="10" />

                {/* Price Curve mapping 120d -> 0d */}
                <path d="M 20,55 Q 120,52 200,60 T 320,68 T 360,40 T 430,15" fill="none" stroke="#bcc6e1" strokeWidth="2" />

                {/* Marker for current day (42 days out) */}
                <circle cx="270" cy="65" fill="#4edea3" r="5" />
                <line stroke="#4edea3" strokeDasharray="2,2" strokeWidth="1.5" x1="270" x2="270" y1="20" y2="85" />
                <text className="font-label-mono-sm text-[9px] font-bold" fill="#4edea3" textAnchor="middle" x="270" y="18">
                  WE ARE HERE (T-42d)
                </text>

                <text className="font-label-mono-sm text-[9px]" fill="currentColor" textAnchor="middle" x="100" y="98">
                  120d - 60d (Stable)
                </text>
                <text className="font-label-mono-sm text-[9px] font-semibold" fill="#4edea3" textAnchor="middle" x="260" y="98">
                  60d - 21d (Buy Window)
                </text>
                <text className="font-label-mono-sm text-[9px]" fill="#ffb4ab" textAnchor="middle" x="390" y="98">
                  &lt;21d (Hike Cliff)
                </text>
              </svg>
              <p className="font-body-sm text-body-sm text-[#8f9097] mt-1">
                Historically, seats jump by an average of +S$140 once inside 21 days due to business traveler bucket reallocation.
              </p>
            </div>

            {/* Calendar Seasonality Context Widget */}
            <div className="p-space-md rounded bg-[#0a0e15] border border-[#262a32] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">
                  SEASONAL SURGE FACTORS
                </span>
                <span className="material-symbols-outlined text-[#ffb95f] text-[18px]">calendar_today</span>
              </div>
              <div className="flex flex-col gap-2 my-space-xs">
                <div className="flex items-center justify-between text-[11px] font-label-mono-sm">
                  <span className="text-[#dfe2ed]">🌸 Fukuoka Sakura (Mar-Apr)</span>
                  <span className="text-[#ffb95f] font-bold">+28% Median</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-label-mono-sm">
                  <span className="text-[#dfe2ed]">🎏 Golden Week (Late Apr/May)</span>
                  <span className="text-[#ffb95f] font-bold">+35% Surge</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-label-mono-sm">
                  <span className="text-[#dfe2ed]">🎒 SG MOE June Vacations</span>
                  <span className="text-[#4edea3] font-bold">+22% High</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-label-mono-sm">
                  <span className="text-[#dfe2ed]">🍁 Autumn Foliage (Oct 18-28)</span>
                  <span className="text-[#4edea3] font-semibold">Trough Zone √</span>
                </div>
              </div>
              <div className="font-body-sm text-body-sm text-[#c5c6cd] bg-[#1c2027] border border-[#31353d] px-2 py-1.5 rounded">
                Current Oct trip falls outside Japanese national holidays and SG term breaks.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Rail: Deal Urgency, Visual Insights, Alert Drawer & MCP Inspector (Cols 9-12) */}
      <div className="xl:col-span-4 flex flex-col gap-space-lg">
        {/* Visual Corridor Showcase Card */}
        <div className="rounded bg-[#1c2027] border border-[#31353d] overflow-hidden shadow-xl flex flex-col">
          <div className="relative w-full h-44 bg-[#0f141b]">
            <img
              className="w-full h-full object-cover opacity-70 hover:opacity-85 transition-all duration-300"
              alt="Cinematic aerial photograph of Fukuoka city harbor at twilight with Fukuoka Tower"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAW2l9IaGYtWVGhfDcR0ln9w_klwg9a5pgzOWAtOJdgyHbFVGML0oIdOUde1NcJB580VSVVYfTVe2RCImfYAnM_R-JSXLObHUHezuk3YlySmYqx1rK6oXXObmEV-np2jRJZJVvHZKouP2hStxrrcmbdJ2PrNJat1oXYkCa9RPNIvcSNUn-FhPy9ZY5btXi6naRzA5JkM3y2gGmW2v70zuwjxc1JfdZc7jn93bwRGbvZq34HlhU9UOVsA"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c2027] via-[#1c2027]/30 to-transparent"></div>
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] tracking-widest uppercase">
                  CORRIDOR DESTINATION
                </span>
                <h3 className="font-headline-md text-headline-md text-[#dfe2ed] leading-tight">
                  Fukuoka, Kyushu (FUK)
                </h3>
              </div>
              <span className="px-space-xs py-0.5 rounded bg-[#262a32]/90 border border-[#45474d] text-[#dfe2ed] font-label-mono-sm text-label-mono-sm">
                6H 15M DIRECT
              </span>
            </div>
          </div>
          <div className="p-space-md flex items-center justify-between bg-[#181c23] border-t border-[#31353d] font-body-sm text-body-sm text-[#c5c6cd]">
            <span>Aircraft: SQ B787-10 Dreamliner</span>
            <span className="text-[#4edea3] font-semibold">Non-Stop Exclusive</span>
          </div>
        </div>

        {/* INTERACTIVE ALERT SUBSCRIPTION CARD */}
        <div className="p-space-lg rounded bg-[#262a32] border border-[#31353d] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[#4edea3] text-[20px]">notifications_active</span>
              <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] uppercase font-semibold">
                ALGORITHMIC ALERT SUBSCRIPTION
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
          </div>
          <h3 className="font-headline-md text-headline-md text-[#dfe2ed] mb-space-xs">
            Subscribe to SIN ⇄ FUK Radar
          </h3>
          <p className="font-body-sm text-body-sm text-[#c5c6cd] mb-space-md">
            Receive dispatch alerts immediately when price touches the P20 floor or the ML engine flips recommendation states.
          </p>

          {!alertSuccess ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createAlertSubscription({
                  corridor: 'SIN ⇄ FUK (Direct Only)',
                  email: alertEmail,
                  telegram: alertTelegram,
                  recChangeNotify: alertRecChange,
                  priceThresholdSGD: alertThresholdSGD
                });
                setAlertSuccess(true);
              }}
              className="flex flex-col gap-space-md"
            >
              {/* Email Input */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase">
                  DISPATCH EMAIL ADDRESS
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder="navigator@terminal.sg"
                    className="w-full bg-[#0a0e15] font-body-md text-body-md text-[#dfe2ed] px-space-md py-space-sm rounded border border-[#31353d] focus:outline-none focus:ring-1 focus:ring-[#4edea3] transition-all"
                  />
                  <span className="absolute right-3 top-2.5 material-symbols-outlined text-[#8f9097] text-[18px]">
                    alternate_email
                  </span>
                </div>
              </div>

              {/* Telegram Chat ID */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase flex items-center justify-between">
                  <span>TELEGRAM DISPATCH ID (OPTIONAL)</span>
                  <span className="text-[#4edea3] text-[10px]">Instant Bot Ping</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={alertTelegram}
                    onChange={(e) => setAlertTelegram(e.target.value)}
                    placeholder="@trader_fuk"
                    className="w-full bg-[#0a0e15] font-body-md text-body-md text-[#dfe2ed] px-space-md py-space-sm rounded border border-[#31353d] focus:outline-none focus:ring-1 focus:ring-[#4edea3] transition-all"
                  />
                  <span className="absolute right-3 top-2.5 material-symbols-outlined text-[#8f9097] text-[18px]">
                    send
                  </span>
                </div>
              </div>

              {/* Trigger Rules Checkbox / Inputs */}
              <div className="p-space-sm rounded bg-[#0a0e15] border border-[#31353d] flex flex-col gap-space-xs">
                <label className="flex items-center gap-space-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertRecChange}
                    onChange={(e) => setAlertRecChange(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#4edea3] cursor-pointer"
                  />
                  <span className="font-body-sm text-body-sm text-[#dfe2ed]">
                    Notify when Recommendation flips state (e.g. HOLD → BUY NOW)
                  </span>
                </label>
                <label className="flex items-center gap-space-sm cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={alertPriceDrop}
                    onChange={(e) => setAlertPriceDrop(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#4edea3] cursor-pointer"
                  />
                  <span className="font-body-sm text-body-sm text-[#dfe2ed]">
                    Trigger if price drops below:
                  </span>
                </label>
                <div className="flex items-center gap-space-xs pl-6 mt-1">
                  <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097]">S$</span>
                  <input
                    type="number"
                    value={alertThresholdSGD}
                    onChange={(e) => setAlertThresholdSGD(Number(e.target.value))}
                    className="w-24 bg-[#1c2027] font-label-mono-sm text-label-mono-sm text-[#dfe2ed] px-2 py-1 rounded border border-[#45474d] focus:outline-none focus:ring-1 focus:ring-[#4edea3]"
                  />
                  <span className="font-body-sm text-body-sm text-[#8f9097]">
                    (Current: {observedQuote})
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-space-sm rounded bg-[#4edea3] text-[#003824] font-semibold text-sm hover:bg-[#6ffbbe] transition-all shadow-md flex items-center justify-center gap-space-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_alert</span>
                <span>Activate Real-Time Alert</span>
              </button>
            </form>
          ) : (
            <div className="p-space-md rounded bg-[#4edea3]/10 border border-[#4edea3]/40 flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs text-[#4edea3]">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span className="font-title-sm text-title-sm font-semibold">Alert Subscription Active</span>
              </div>
              <p className="font-body-sm text-body-sm text-[#c5c6cd]">
                Telemetry stream connected. You will receive dispatches at{' '}
                <span className="text-[#dfe2ed] font-semibold">{alertEmail}</span> and via Telegram{' '}
                <span className="text-[#dfe2ed] font-semibold">{alertTelegram || 'None specified'}</span> when price drops below{' '}
                <span className="text-[#4edea3] font-semibold">{formatPrice(alertThresholdSGD, currency)}</span>.
              </p>
              <button
                type="button"
                onClick={() => setAlertSuccess(false)}
                className="font-label-mono-sm text-label-mono-sm text-[#4edea3] hover:underline self-start mt-1 cursor-pointer"
              >
                Edit Preferences →
              </button>
            </div>
          )}
        </div>

        {/* LIVE MCP SERVER DEVELOPER INSPECTOR */}
        <div className="p-space-lg rounded bg-[#1c2027] border border-[#31353d] shadow-xl">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[#bcc6e1] text-[18px]">terminal</span>
              <span className="font-label-mono-sm text-label-mono-sm text-[#bcc6e1] uppercase font-semibold">
                MCP SERVER API INSPECTOR
              </span>
            </div>
            <span className="px-space-xs py-0.5 rounded bg-[#0f1a2e] border border-[#78839b]/30 font-label-mono-sm text-label-mono-sm text-[#bcc6e1]">
              v1.4.2
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-[#c5c6cd] mb-space-sm">
            Live tool execution logs payload matching Claude/Cursor tool calling spec:
          </p>

          {/* Tool Call Toggle */}
          <div className="flex items-center gap-1 bg-[#0a0e15] border border-[#262a32] p-1 rounded mb-space-sm">
            <button
              type="button"
              onClick={() => setMcpTab('search')}
              className={`flex-1 py-1 rounded font-label-mono-sm text-label-mono-sm text-center font-medium cursor-pointer transition-all ${
                mcpTab === 'search'
                  ? 'bg-[#1c2027] text-[#dfe2ed] border border-[#45474d]'
                  : 'text-[#8f9097] hover:text-[#dfe2ed]'
              }`}
            >
              tool_search_fares
            </button>
            <button
              type="button"
              onClick={() => setMcpTab('recommendation')}
              className={`flex-1 py-1 rounded font-label-mono-sm text-label-mono-sm text-center font-medium cursor-pointer transition-all ${
                mcpTab === 'recommendation'
                  ? 'bg-[#1c2027] text-[#dfe2ed] border border-[#45474d]'
                  : 'text-[#8f9097] hover:text-[#dfe2ed]'
              }`}
            >
              tool_get_recommendation
            </button>
          </div>

          {/* JSON Code Preview Container */}
          <div className="p-space-md rounded bg-[#0a0e15] border border-[#262a32] font-label-mono-sm text-label-mono-sm text-[#c5c6cd] overflow-x-auto max-h-60 overflow-y-auto">
            <pre className="leading-relaxed text-[11px] text-[#dfe2ed] whitespace-pre font-mono">
              {JSON.stringify(mcpTab === 'search' ? mcpSearchPayload : mcpRecPayload, null, 2)}
            </pre>
          </div>

          <div className="mt-space-sm flex items-center justify-between font-label-mono-sm text-label-mono-sm text-[#8f9097]">
            <span>LATENCY: 42ms • STATUS: 200 OK</span>
            <button
              type="button"
              onClick={handleCopyMcp}
              className="text-[#4edea3] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[12px]">
                {copiedMcp ? 'check' : 'content_copy'}
              </span>
              <span>{copiedMcp ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

        {/* Corridor Point-to-Point Summary & Changi Ground Advice */}
        <div className="p-space-md rounded bg-[#181c23] border border-[#31353d] flex flex-col gap-space-sm">
          <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] uppercase font-semibold">
            OPERATIONAL DISPATCH NOTE
          </span>
          <p className="font-body-sm text-body-sm text-[#c5c6cd] leading-relaxed">
            SQ656 operates as an overnight red-eye out of Changi Terminal 3 (SIN 01:20 → FUK 08:35). Luggage drop and early check-in open 4 hours prior. Upon landing at Fukuoka International Terminal, free shuttle buses run every 6 mins to the Fukuoka Subway Kuko Line (Hakata Station in 5 mins).
          </p>
        </div>
      </div>
    </div>
  );
};
