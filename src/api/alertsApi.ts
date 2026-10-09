import { CorridorAlert } from '../types';
import { INITIAL_ALERTS } from '../data/corridorData';

export interface CreateAlertPayload {
  corridor: string;
  email: string;
  telegram?: string;
  recChangeNotify: boolean;
  priceThresholdSGD: number;
}

export interface DispatchPingResult {
  success: boolean;
  alertId: string;
  deliveryChannels: string[];
  latencyMs: number;
  message: string;
  dispatchedAt: string;
}

// In-memory alert registry
let alertsStore: CorridorAlert[] = [...INITIAL_ALERTS];

/**
 * Fetch all registered alert subscriptions.
 */
export async function getAlertSubscriptions(): Promise<CorridorAlert[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return [...alertsStore];
}

/**
 * Register a new alert subscription.
 */
export async function createAlertSubscription(payload: CreateAlertPayload): Promise<CorridorAlert> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const newAlert: CorridorAlert = {
    id: 'alt_' + Math.random().toString(36).substring(2, 9),
    corridor: payload.corridor,
    email: payload.email,
    telegram: payload.telegram,
    recChangeNotify: payload.recChangeNotify,
    priceThresholdSGD: payload.priceThresholdSGD,
    active: true,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    lastPing: 'Registered just now'
  };

  alertsStore = [newAlert, ...alertsStore];
  return newAlert;
}

/**
 * Toggle active state of an alert.
 */
export async function toggleAlertSubscription(alertId: string): Promise<CorridorAlert | null> {
  await new Promise((resolve) => setTimeout(resolve, 40));
  const alert = alertsStore.find((a) => a.id === alertId);
  if (!alert) return null;
  alert.active = !alert.active;
  return { ...alert };
}

/**
 * Delete an alert subscription.
 */
export async function deleteAlertSubscription(alertId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 40));
  alertsStore = alertsStore.filter((a) => a.id !== alertId);
  return true;
}

/**
 * Send a simulated test webhook / telegram ping.
 */
export async function sendTestDispatchPing(alert: CorridorAlert): Promise<DispatchPingResult> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const channels: string[] = ['Email: ' + alert.email];
  if (alert.telegram) {
    channels.push('Telegram Bot: ' + alert.telegram);
  }

  return {
    success: true,
    alertId: alert.id,
    deliveryChannels: channels,
    latencyMs: 38,
    message: `CORRIDOR ALERT TRIGGERED: SIN ⇄ FUK fare dropped below S$${alert.priceThresholdSGD}. SQ656 seat bucket V opened. State: BUY NOW.`,
    dispatchedAt: new Date().toISOString()
  };
}
