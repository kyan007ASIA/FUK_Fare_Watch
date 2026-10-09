/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType, Currency } from './types';
import { triggerPollerSweep } from './api';
import { Header } from './components/Header';
import { CorridorTelemetryBar } from './components/CorridorTelemetryBar';
import { FareMonitorView } from './components/FareMonitorView';
import { QuantilesView } from './components/QuantilesView';
import { AlertSubscriptionsView } from './components/AlertSubscriptionsView';
import { McpApiView } from './components/McpApiView';
import { CreateAlertModal } from './components/CreateAlertModal';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('fare-monitor');
  const [currency, setCurrency] = useState<Currency>('SGD');
  const [lastPolledMinutesAgo, setLastPolledMinutesAgo] = useState<number>(14);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState<boolean>(false);

  // Poller trigger simulation
  const handleRefreshPoll = async () => {
    setIsPolling(true);
    try {
      await triggerPollerSweep();
      setLastPolledMinutesAgo(0);
    } finally {
      setIsPolling(false);
    }
  };

  const handleAlertCreated = () => {
    // Optionally switch to alerts view or trigger toast
  };

  return (
    <div className="min-h-screen bg-[#0f141b] text-[#dfe2ed] flex flex-col selection:bg-[#4edea3]/30 selection:text-white">
      {/* Fixed Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onOpenCreateAlert={() => setIsCreateAlertOpen(true)}
        lastPolledMinutesAgo={lastPolledMinutesAgo}
        onRefreshPoll={handleRefreshPoll}
        isPolling={isPolling}
      />

      {/* Main Content Body */}
      <main className="w-full pt-20 flex-1 flex flex-col">
        {/* Top Route Telemetry & Sakura Peak Bar */}
        <CorridorTelemetryBar currency={currency} />

        {/* Tab Routing */}
        {activeTab === 'fare-monitor' && (
          <FareMonitorView
            currency={currency}
            isPolling={isPolling}
            onRefreshPoll={handleRefreshPoll}
            onOpenCreateAlert={() => setIsCreateAlertOpen(true)}
          />
        )}

        {activeTab === 'price-history' && (
          <QuantilesView
            currency={currency}
            onOpenCreateAlert={() => setIsCreateAlertOpen(true)}
          />
        )}

        {activeTab === 'alert-subscriptions' && (
          <AlertSubscriptionsView
            currency={currency}
            onOpenCreateAlert={() => setIsCreateAlertOpen(true)}
          />
        )}

        {activeTab === 'mcp-api' && <McpApiView />}
      </main>

      {/* Global Terminal Footer */}
      <Footer />

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={isCreateAlertOpen}
        onClose={() => setIsCreateAlertOpen(false)}
        currency={currency}
        onAlertCreated={handleAlertCreated}
      />
    </div>
  );
}
