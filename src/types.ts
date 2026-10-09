export type TabType = 
  | 'fare-monitor' 
  | 'price-history' 
  | 'alert-subscriptions' 
  | 'mcp-api';

export type Currency = 'SGD' | 'JPY' | 'USD' | 'EUR';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rateFromSGD: number;
}

export type ScenarioType = 'buynow' | 'wait' | 'buyby';

export interface ScenarioData {
  id: ScenarioType;
  signalText: string;
  signalClass: string;
  glowColor: string;
  symbol: string;
  title: string;
  body: string;
  priceSGD: number;
  deltaText: string;
  velocity: string;
  velocityStatus: string;
  velocityColor: string;
  daysToTakeoff: number;
  confidence: string;
}

export interface FlightSegment {
  airline: string;
  flightNumber: string;
  aircraft: string;
  stops: number;
  departureAirport: string;
  departureCode: string;
  departureTerminal: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalCode: string;
  arrivalTime: string;
  duration: string;
  date: string;
  amenities: string;
}

export interface CorridorAlert {
  id: string;
  corridor: string;
  email: string;
  telegram?: string;
  recChangeNotify: boolean;
  priceThresholdSGD: number;
  active: boolean;
  createdAt: string;
  lastPing?: string;
}

export interface QuantileMetric {
  label: string;
  percentile: string;
  priceSGD: number;
  description: string;
  color: string;
}
