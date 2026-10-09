import { QuantileMetric } from '../types';
import { QUANTILES_DATA } from '../data/corridorData';

export interface DayOfWeekStat {
  day: string;
  avgSGD: number;
  note: string;
}

export interface FareBucketInfo {
  code: string;
  name: string;
  priceSGD: number;
  baggage: string;
  changeFee: string;
  status: string;
}

export interface QuantilesSummary {
  corridor: string;
  sampleSize: number;
  window: string;
  quantiles: QuantileMetric[];
  dayOfWeek: DayOfWeekStat[];
  buckets: FareBucketInfo[];
}

/**
 * Fetch historical quantile distribution metrics.
 */
export async function getCorridorQuantiles(window: '90d' | '180d' | '365d' = '180d'): Promise<QuantilesSummary> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    corridor: 'SIN ⇄ FUK',
    sampleSize: window === '90d' ? 1240 : window === '180d' ? 2480 : 5120,
    window,
    quantiles: QUANTILES_DATA,
    dayOfWeek: [
      { day: 'Mon', avgSGD: 792, note: 'Corporate outbound spike' },
      { day: 'Tue', avgSGD: 745, note: 'Lowest median departure cost' },
      { day: 'Wed', avgSGD: 755, note: 'Moderate leisure demand' },
      { day: 'Thu', avgSGD: 770, note: 'Pre-weekend ramp' },
      { day: 'Fri', avgSGD: 840, note: 'Weekend getaway premium' },
      { day: 'Sat', avgSGD: 748, note: 'Strong value for 7-10 day trips' },
      { day: 'Sun', avgSGD: 825, note: 'High return demand' }
    ],
    buckets: [
      { code: 'V / K', name: 'Economy Lite', priceSGD: 642, baggage: '25kg', changeFee: 'S$150', status: 'Depleted within 45d' },
      { code: 'Q / N', name: 'Economy Value', priceSGD: 742, baggage: '25kg', changeFee: 'S$75', status: 'Current Active Bucket' },
      { code: 'M / H', name: 'Economy Standard', priceSGD: 860, baggage: '30kg', changeFee: 'Free', status: 'Available until T-7d' },
      { code: 'B / Y', name: 'Economy Flexi', priceSGD: 1040, baggage: '35kg', changeFee: 'Free + Full Refund', status: 'Always open' }
    ]
  };
}
