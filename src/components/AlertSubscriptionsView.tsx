import React, { useState, useEffect } from 'react';
import { Currency, CorridorAlert } from '../types';
import { formatPrice } from '../data/corridorData';
import {
  getAlertSubscriptions,
  toggleAlertSubscription,
  deleteAlertSubscription,
  sendTestDispatchPing
} from '../api';

interface AlertSubscriptionsViewProps {
  currency: Currency;
  onOpenCreateAlert: () => void;
}

export const AlertSubscriptionsView: React.FC<AlertSubscriptionsViewProps> = ({
  currency,
  onOpenCreateAlert
}) => {
  const [alerts, setAlerts] = useState<CorridorAlert[]>([]);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  useEffect(() => {
    getAlertSubscriptions().then(setAlerts);
  }, []);

  const toggleAlert = async (id: string) => {
    const updated = await toggleAlertSubscription(id);
    if (updated) {
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
  };

  const deleteAlert = async (id: string) => {
    await deleteAlertSubscription(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleTestPing = async (alert: CorridorAlert) => {
    const res = await sendTestDispatchPing(alert);
    setTestNotification(
      `🚨 [DISPATCH TEST SENT - ${res.latencyMs}ms] Channels: ${res.deliveryChannels.join(' • ')}: "${res.message}"`
    );
    setTimeout(() => {
      setTestNotification(null);
    }, 6000);
  };

  const dispatchLogs = [
    { time: '2025-10-09 05:40 UTC', event: 'ROUTINE CORRIDOR SWEEP', detail: 'SQ656 non-stop checked: S$742. No price drop breach (<S$720). Status: 200 OK', status: 'PASS' },
    { time: '2025-10-08 19:15 UTC', event: 'RECOMMENDATION STATE CHECK', detail: 'ML Engine evaluated: BUY NOW state maintained. Confidence: 82 samples.', status: 'PASS' },
    { time: '2025-10-07 14:02 UTC', event: 'TELEGRAM DISPATCH TEST', detail: 'Sent test ping to @sg_farewatch_bot (Payload latency: 38ms)', status: 'SENT' },
    { time: '2025-10-05 08:30 UTC', event: 'APIFY POLLER FALLBACK', detail: 'Ignav API reached rate buffer; successfully failed over to Apify Kuezi proxy cache.', status: 'INFO' },
  ];

  return (
    <div className="w-full px-margin-desktop py-space-lg flex flex-col gap-space-lg">
      {/* Toast banner for simulated dispatch */}
      {testNotification && (
        <div className="p-4 rounded bg-[#4edea3]/20 border border-[#4edea3] text-[#4edea3] flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">notifications_active</span>
            <span className="font-label-mono-sm text-xs font-semibold">{testNotification}</span>
          </div>
          <button
            onClick={() => setTestNotification(null)}
            className="text-xs text-[#dfe2ed] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div>
          <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] tracking-widest uppercase">
            TELEMETRY DISPATCH SUBSCRIPTIONS
          </span>
          <h1 className="font-headline-lg text-headline-lg text-[#dfe2ed] font-semibold">
            Corridor Radars &amp; Alert Rules
          </h1>
          <p className="font-body-md text-[#c5c6cd] mt-1 max-w-2xl">
            Manage your real-time notification endpoints for price drops, recommendation flips (HOLD → BUY NOW), and sudden seat inventory releases.
          </p>
        </div>

        <button
          onClick={onOpenCreateAlert}
          className="flex items-center gap-space-xs px-space-md py-2 rounded bg-[#4edea3] text-[#003824] font-semibold text-sm hover:bg-[#6ffbbe] shadow-lg cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_alert</span>
          <span>New Alert Subscription</span>
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl">
        <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-[#262a32]">
          <h3 className="font-headline-md text-headline-md text-[#dfe2ed]">
            Active Subscription Endpoints ({alerts.length})
          </h3>
          <span className="font-label-mono-sm text-xs text-[#8f9097]">
            Webhook Ping Frequency: Real-Time / 15m Cache
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-sm">
            <thead>
              <tr className="border-b border-[#262a32] text-[#8f9097] font-label-mono-sm text-xs">
                <th className="py-3 px-4">CORRIDOR / ROUTE</th>
                <th className="py-3 px-4">DESTINATION TARGET</th>
                <th className="py-3 px-4">DISPATCH RULE</th>
                <th className="py-3 px-4">TRIGGER THRESHOLD</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a32]">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#1c2027]/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-[#dfe2ed]">{alert.corridor}</div>
                    <div className="font-label-mono-sm text-xs text-[#8f9097]">ID: {alert.id}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs">
                    <div className="text-[#dfe2ed]">{alert.email}</div>
                    {alert.telegram && (
                      <div className="text-[#4edea3] text-[11px]">{alert.telegram}</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-xs text-[#c5c6cd]">
                      {alert.recChangeNotify ? 'State Shift + ' : ''}Floor Breach
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono font-bold text-[#4edea3]">
                      &lt; {formatPrice(alert.priceThresholdSGD, currency)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`px-2.5 py-1 rounded font-label-mono-sm text-xs cursor-pointer ${
                        alert.active
                          ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                          : 'bg-[#31353d] text-[#8f9097]'
                      }`}
                    >
                      {alert.active ? 'ACTIVE' : 'PAUSED'}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTestPing(alert)}
                        className="px-2.5 py-1 rounded bg-[#262a32] text-[#bcc6e1] hover:text-[#dfe2ed] text-xs font-mono border border-[#45474d] cursor-pointer"
                        title="Send simulated test ping"
                      >
                        Test Ping
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-1 text-[#8f9097] hover:text-[#ffb4ab] cursor-pointer"
                        title="Delete subscription"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Logs */}
      <div className="p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl">
        <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-[#262a32]">
          <h3 className="font-headline-md text-headline-md text-[#dfe2ed]">
            Recent Dispatch Audit Logs
          </h3>
          <span className="font-label-mono-sm text-xs text-[#8f9097]">
            Real-time operational stream
          </span>
        </div>

        <div className="flex flex-col gap-2 font-mono text-xs">
          {dispatchLogs.map((log, i) => (
            <div
              key={i}
              className="p-3 rounded bg-[#0a0e15] border border-[#262a32] flex flex-col md:flex-row items-start md:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#8f9097]">{log.time}</span>
                <span className="text-[#4edea3] font-bold">{log.event}</span>
                <span className="text-[#c5c6cd]">{log.detail}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#262a32] text-[#bcc6e1] text-[10px]">
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
