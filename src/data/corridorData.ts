import { Currency, CurrencyConfig, ScenarioData, QuantileMetric, CorridorAlert } from '../types';

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  SGD: { code: 'SGD', symbol: 'S$', rateFromSGD: 1 },
  JPY: { code: 'JPY', symbol: '¥', rateFromSGD: 114.5 },
  USD: { code: 'USD', symbol: '$', rateFromSGD: 0.76 },
  EUR: { code: 'EUR', symbol: '€', rateFromSGD: 0.70 }
};

export const formatPrice = (amountSGD: number, currency: Currency): string => {
  const config = CURRENCY_CONFIGS[currency];
  const converted = amountSGD * config.rateFromSGD;
  if (currency === 'JPY') {
    return `${config.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${config.symbol}${converted.toFixed(2)}`;
};

export const formatPriceCompact = (amountSGD: number, currency: Currency): string => {
  const config = CURRENCY_CONFIGS[currency];
  const converted = amountSGD * config.rateFromSGD;
  if (currency === 'JPY') {
    return `${config.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${config.symbol}${Math.round(converted)}`;
};

export const SCENARIOS: Record<string, ScenarioData> = {
  buynow: {
    id: 'buynow',
    signalText: 'RECOMMENDATION: BUY NOW',
    signalClass: 'bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30',
    glowColor: 'bg-[#4edea3]',
    symbol: 'gavel',
    title: 'Statistical Trough Detected • Historical P18 Favorable Window',
    body: 'Current fare sits in the bottom 18th percentile of all direct quotes recorded on the SIN ⇄ FUK corridor. Singapore Airlines seat buckets (Economy Value/Standard) are shrinking; regression shows a 78% probability of price upward hike once the window narrows inside 30 days.',
    priceSGD: 742,
    deltaText: '−S$43 below 90d median',
    velocity: '+S$42/wk',
    velocityStatus: 'Accelerating upward',
    velocityColor: 'text-[#ffb95f]',
    daysToTakeoff: 42,
    confidence: 'HIGH CONFIDENCE (82 SAMPLES)'
  },
  wait: {
    id: 'wait',
    signalText: 'RECOMMENDATION: WAIT (SOFTENING TREND)',
    signalClass: 'bg-[#0f1a2e] text-[#bcc6e1] border border-[#bcc6e1]/30',
    glowColor: 'bg-[#bcc6e1]',
    symbol: 'hourglass_top',
    title: 'Downside Volatility Expected • Carrier Capacity Buffer Available',
    body: 'Observed fare is currently at S$810 (P64 percentile). Flight SQ656 still maintains open allocation in promotional sub-classes (K / V). Past trajectory models suggest a temporary drop of ~S$50–S$70 over the next 10 days before locking in.',
    priceSGD: 810,
    deltaText: '+S$25 above 90d median',
    velocity: '−S$18/wk',
    velocityStatus: 'Softening trend detected',
    velocityColor: 'text-[#4edea3]',
    daysToTakeoff: 65,
    confidence: 'MODERATE CONFIDENCE (54 SAMPLES)'
  },
  buyby: {
    id: 'buyby',
    signalText: 'RECOMMENDATION: BUY BY OCT 02 (URGENT)',
    signalClass: 'bg-[#281600] text-[#ffb95f] border border-[#ffb95f]/30',
    glowColor: 'bg-[#ffb95f]',
    symbol: 'warning',
    title: '21-Day Advance Purchase Horizon Fast Approaching',
    body: 'Current direct fare is S$765. Only 18 days remaining to flight departure. Once the calendar crosses the 14-day threshold, Singapore Airlines automated revenue management removes discount booking classes universally across the corridor.',
    priceSGD: 765,
    deltaText: '−S$20 below median',
    velocity: '+S$89/wk',
    velocityStatus: 'Imminent price spike cliff',
    velocityColor: 'text-[#ffb4ab]',
    daysToTakeoff: 18,
    confidence: 'VERY HIGH (110 SAMPLES)'
  }
};

export const QUANTILES_DATA: QuantileMetric[] = [
  { label: 'Deep Value Floor', percentile: 'P10', priceSGD: 715, description: 'Super promo flash sale tariff (usually non-refundable promotional inventory)', color: '#4edea3' },
  { label: 'Target Value Cutoff', percentile: 'P20', priceSGD: 750, description: 'Algorithmic trigger threshold for automated BUY recommendation', color: '#6ffbbe' },
  { label: 'Corridor Median', percentile: 'P50', priceSGD: 785, description: 'Equilibrium pricing across 42 daily automated poller sweeps', color: '#bcc6e1' },
  { label: 'Advance Cliff Boundary', percentile: 'P80', priceSGD: 890, description: 'Observed pricing threshold inside 21-day corporate travel reallocation', color: '#ffb95f' },
  { label: 'Peak Volatility Ceiling', percentile: 'P95', priceSGD: 1080, description: 'Extreme demand during Sakura peak (Mar 22 - Apr 08) or Golden Week', color: '#ffb4ab' }
];

export const HISTORICAL_CHART_TICKS = [
  { day: 'T-60d', label: '-60d ago: S$840', priceSGD: 840, x: 50, y: 70 },
  { day: 'T-50d', label: '-50d ago: S$848', priceSGD: 848, x: 110, y: 65 },
  { day: 'T-40d', label: '-40d ago: S$812', priceSGD: 812, x: 170, y: 85 },
  { day: 'T-30d', label: '-30d ago: S$776', priceSGD: 776, x: 230, y: 110 },
  { day: 'T-25d', label: '-25d ago: S$782', priceSGD: 782, x: 290, y: 100 },
  { day: 'T-20d', label: '-20d ago: S$755', priceSGD: 755, x: 350, y: 130 },
  { day: 'T-15d', label: '-15d ago: S$768', priceSGD: 768, x: 410, y: 120 },
  { day: 'T-10d', label: '-10d ago: S$745', priceSGD: 745, x: 470, y: 145 },
  { day: 'T-7d', label: '-7d ago: S$738 (Trough)', priceSGD: 738, x: 530, y: 150 },
  { day: 'T-4d', label: '-4d ago: S$752', priceSGD: 752, x: 590, y: 138 },
  { day: 'T-1d', label: 'Yesterday: S$740', priceSGD: 740, x: 650, y: 148 },
  { day: 'NOW', label: 'Today (Live Polled): S$742', priceSGD: 742, x: 710, y: 142, isCurrent: true }
];

export const INITIAL_ALERTS: CorridorAlert[] = [
  {
    id: 'alt-001',
    corridor: 'SIN ⇄ FUK (Direct Only)',
    email: 'changi.trader@singapore.com',
    telegram: '@sg_farewatch_bot',
    recChangeNotify: true,
    priceThresholdSGD: 720,
    active: true,
    createdAt: '2025-08-15 14:22 UTC',
    lastPing: '14 mins ago (No breach)'
  },
  {
    id: 'alt-002',
    corridor: 'SIN ⇄ FUK (Sakura Window 2026)',
    email: 'changi.trader@singapore.com',
    telegram: '@sg_farewatch_bot',
    recChangeNotify: true,
    priceThresholdSGD: 850,
    active: true,
    createdAt: '2025-09-02 08:10 UTC',
    lastPing: '2 hours ago'
  }
];
