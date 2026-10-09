import React, { useState } from 'react';
import { TabType, Currency } from '../types';
import { CURRENCY_CONFIGS } from '../data/corridorData';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  onOpenCreateAlert: () => void;
  lastPolledMinutesAgo: number;
  onRefreshPoll: () => void;
  isPolling: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenCreateAlert,
  lastPolledMinutesAgo,
  onRefreshPoll,
  isPolling
}) => {
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'fare-monitor', label: 'Fare Monitor & Predictor' },
    { id: 'price-history', label: 'Price History & Quantiles' },
    { id: 'alert-subscriptions', label: 'Alert Subscriptions' },
    { id: 'mcp-api', label: 'MCP Server API' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f141b]/90 backdrop-blur-xl border-b border-[#31353d]/50 shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
      <div className="h-20 w-full px-margin-desktop flex items-center justify-between gap-space-lg">
        {/* Left Brand and Status Badges */}
        <div className="flex items-center gap-space-lg shrink-0">
          <div 
            onClick={() => setActiveTab('fare-monitor')}
            className="flex items-center gap-space-sm cursor-pointer group"
          >
            <div className="w-9 h-9 rounded bg-[#0f1a2e] border border-[#bcc6e1]/30 flex items-center justify-center group-hover:border-[#4edea3]/60 transition-colors">
              <span className="material-symbols-outlined text-[#bcc6e1] group-hover:text-[#4edea3] text-[20px] transition-colors">flight_takeoff</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-[#dfe2ed] tracking-tight leading-none">FUK FARE WATCH</span>
              <span className="font-label-mono-sm text-label-mono-sm text-[#8f9097] tracking-wider uppercase mt-space-xs">Aerospace Algorithmic Pricing</span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-[#262a32] border border-[#45474d]/40">
            <span className="material-symbols-outlined text-[#4edea3] text-[14px]">lock</span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#4edea3] uppercase font-semibold">SIN ⇄ FUK NON-STOP ONLY</span>
          </div>

          <div 
            onClick={onRefreshPoll}
            title="Click to trigger poller run"
            className="hidden 2xl:flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-[#1c2027] border border-[#31353d] cursor-pointer hover:border-[#4edea3]/40 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full bg-[#4edea3] ${isPolling ? 'animate-ping' : 'animate-pulse'}`}></span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#c5c6cd]">
              {isPolling ? 'Polling APIs...' : 'Ignav + Apify Poller Active'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-[#0f1a2e] border border-[#78839b]/30">
            <span className="material-symbols-outlined text-[#bcc6e1] text-[14px]">hub</span>
            <span className="font-label-mono-sm text-label-mono-sm text-[#bcc6e1] uppercase">MCP Agent Connected</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-[#0a0e15] border border-[#262a32] rounded">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-space-md py-1.5 rounded transition-all duration-150 cursor-pointer text-sm ${
                  isActive
                    ? 'bg-[#31353d] text-[#dfe2ed] font-semibold shadow-[0_0_12px_rgba(0,0,0,0.4)] border border-[#45474d]/50'
                    : 'text-[#c5c6cd] hover:text-[#dfe2ed] hover:bg-[#1c2027]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & CTA */}
        <div className="flex items-center gap-space-md shrink-0">
          {/* Currency Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCurrDropdownOpen(!currDropdownOpen)}
              className="flex items-center gap-1.5 px-space-sm py-space-xs rounded bg-[#181c23] border border-[#31353d] hover:border-[#4edea3]/40 transition-colors cursor-pointer"
            >
              <span className="font-label-mono-sm text-[#8f9097]">CURR:</span>
              <span className="font-label-mono-sm text-[#dfe2ed] font-semibold">
                {currency} ({CURRENCY_CONFIGS[currency].symbol})
              </span>
              <span className="material-symbols-outlined text-[#8f9097] text-[14px]">expand_more</span>
            </button>

            {currDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-[#181c23] border border-[#31353d] rounded shadow-2xl py-1 z-50">
                {(Object.keys(CURRENCY_CONFIGS) as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setCurrDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 font-label-mono-sm text-xs flex items-center justify-between cursor-pointer ${
                      currency === c ? 'bg-[#31353d] text-[#4edea3] font-semibold' : 'text-[#c5c6cd] hover:bg-[#262a32]'
                    }`}
                  >
                    <span>{c}</span>
                    <span className="text-[#8f9097]">{CURRENCY_CONFIGS[c].symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Last Polled Indicator */}
          <button
            type="button"
            onClick={onRefreshPoll}
            title="Click to force fetch latest quotes"
            className="hidden md:flex items-center gap-space-xs text-left cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className={`material-symbols-outlined text-[#8f9097] text-[14px] ${isPolling ? 'animate-spin text-[#4edea3]' : ''}`}>
              {isPolling ? 'sync' : 'history'}
            </span>
            <span className="font-label-mono-sm text-[#c5c6cd]">
              {isPolling ? 'Polling...' : `Last polled ${lastPolledMinutesAgo}m ago`}
            </span>
          </button>

          {/* Create Alert Primary Button */}
          <button
            onClick={onOpenCreateAlert}
            className="flex items-center gap-space-xs px-space-md py-2 rounded bg-[#4edea3] text-[#003824] font-semibold text-sm transition-all duration-150 hover:bg-[#6ffbbe] shadow-[0_0_16px_rgba(78,222,163,0.3)] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_alert</span>
            <span>Create Alert</span>
          </button>

          {/* User Icon */}
          <div className="w-8 h-8 rounded-full bg-[#bcc6e1] flex items-center justify-center shrink-0 border border-[#dfe2ed]/30 shadow-sm" title="Logged in as Changi Algorithmic Dispatcher">
            <span className="material-symbols-outlined text-[#263045] text-[18px]">person</span>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-[#31353d]/50 bg-[#0a0e15] gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
                isActive
                  ? 'bg-[#31353d] text-[#dfe2ed] font-semibold border border-[#45474d]'
                  : 'text-[#c5c6cd] bg-[#1c2027]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
