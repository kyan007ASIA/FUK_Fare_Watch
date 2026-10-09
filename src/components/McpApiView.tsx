import React, { useState } from 'react';
import { executeMcpToolCall } from '../api';

export const McpApiView: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<'search' | 'recommendation' | 'quantiles' | 'subscribe'>('search');
  const [testOrigin, setTestOrigin] = useState('SIN');
  const [testDestination, setTestDestination] = useState('FUK');
  const [testDepDate, setTestDepDate] = useState('2025-10-18');
  const [testRetDate, setTestRetDate] = useState('2025-10-28');
  const [isRunning, setIsRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<any>(null);
  const [activeTabConfig, setActiveTabConfig] = useState<'claude' | 'cursor' | 'curl'>('claude');
  const [copiedConfig, setCopiedConfig] = useState(false);

  const handleExecuteTool = async () => {
    setIsRunning(true);
    try {
      const toolMap: Record<string, string> = {
        search: 'tool_search_fares',
        recommendation: 'tool_get_recommendation',
        quantiles: 'tool_get_quantiles',
        subscribe: 'tool_create_alert'
      };

      const res = await executeMcpToolCall({
        jsonrpc: '2.0',
        id: 'call_' + Math.floor(Math.random() * 90000 + 10000),
        method: 'tools/call',
        params: {
          name: toolMap[selectedTool],
          arguments: {
            origin: testOrigin,
            destination: testDestination,
            departure_date: testDepDate,
            return_date: testRetDate,
            current_fare_sgd: 742,
            days_to_departure: 42,
            email: 'changi.trader@singapore.com',
            price_threshold_sgd: 720
          }
        }
      });
      setExecutionOutput(res);
    } finally {
      setIsRunning(false);
    }
  };

  const claudeConfig = `{
  "mcpServers": {
    "fuk-farewatch": {
      "command": "npx",
      "args": [
        "-y",
        "@aero-farewatch/mcp-server-fuk",
        "--corridor=SIN-FUK",
        "--apikey=fuk_live_aero9921"
      ]
    }
  }
}`;

  const cursorConfig = `{
  "name": "fuk-farewatch-mcp",
  "version": "1.4.2",
  "transport": "stdio",
  "endpoint": "https://api.farewatch.aero/mcp/v1/sse",
  "headers": {
    "Authorization": "Bearer fuk_live_aero9921"
  }
}`;

  const curlExample = `curl -X POST https://api.farewatch.aero/mcp/v1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "tool_search_fares",
      "arguments": {
        "origin": "SIN",
        "destination": "FUK",
        "non_stop_only": true,
        "departure_date": "2025-10-18",
        "return_date": "2025-10-28"
      }
    },
    "id": 1
  }'`;

  return (
    <div className="w-full px-margin-desktop py-space-lg flex flex-col gap-space-lg">
      {/* Title & MCP Protocol Header */}
      <div className="p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-mono-sm text-label-mono-sm text-[#bcc6e1] tracking-widest uppercase">
              MODEL CONTEXT PROTOCOL // RFC SPECIFICATION
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#0f1a2e] border border-[#78839b]/30 text-[#bcc6e1] font-mono text-[10px]">
              v1.4.2
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-[#dfe2ed] font-semibold">
            MCP Server API &amp; Agent Tool Registry
          </h1>
          <p className="font-body-md text-[#c5c6cd] mt-1 max-w-2xl">
            Directly connect Claude Desktop, Cursor, or autonomous AI agents to live SIN ⇄ FUK pricing telemetry, ML recommendation state, and ticket tariff optimization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse"></span>
          <span className="font-label-mono-sm text-xs text-[#4edea3] font-semibold">
            MCP SSE / STDIO LISTENER READY
          </span>
        </div>
      </div>

      {/* Main 2-column interactive playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
        {/* Left: Tool Invoker (7 cols) */}
        <div className="lg:col-span-7 p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-space-sm border-b border-[#262a32]">
            <h3 className="font-headline-md text-headline-md text-[#dfe2ed]">
              Interactive Tool Execution Console
            </h3>
            <span className="font-label-mono-sm text-xs text-[#8f9097]">
              JSON-RPC 2.0 Testing Bench
            </span>
          </div>

          {/* Tool selector buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'search', name: 'tool_search_fares' },
              { id: 'recommendation', name: 'tool_get_recommendation' },
              { id: 'quantiles', name: 'tool_get_quantiles' },
              { id: 'subscribe', name: 'tool_create_alert' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTool(t.id as any);
                  setExecutionOutput(null);
                }}
                className={`p-2 rounded text-left font-mono text-xs cursor-pointer border transition-all ${
                  selectedTool === t.id
                    ? 'bg-[#1c2027] text-[#4edea3] border-[#4edea3]/50 shadow-md'
                    : 'bg-[#0a0e15] text-[#8f9097] border-[#262a32] hover:text-[#dfe2ed]'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Parameters Form */}
          <div className="p-space-md rounded bg-[#0a0e15] border border-[#262a32] grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-mono-sm text-[10px] text-[#8f9097]">ORIGIN</label>
              <input
                type="text"
                value={testOrigin}
                onChange={(e) => setTestOrigin(e.target.value)}
                className="bg-[#1c2027] border border-[#31353d] rounded px-2 py-1 font-mono text-xs text-[#dfe2ed]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-mono-sm text-[10px] text-[#8f9097]">DESTINATION</label>
              <input
                type="text"
                value={testDestination}
                onChange={(e) => setTestDestination(e.target.value)}
                className="bg-[#1c2027] border border-[#31353d] rounded px-2 py-1 font-mono text-xs text-[#dfe2ed]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-mono-sm text-[10px] text-[#8f9097]">DEPARTURE</label>
              <input
                type="date"
                value={testDepDate}
                onChange={(e) => setTestDepDate(e.target.value)}
                className="bg-[#1c2027] border border-[#31353d] rounded px-2 py-1 font-mono text-xs text-[#dfe2ed]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-mono-sm text-[10px] text-[#8f9097]">RETURN</label>
              <input
                type="date"
                value={testRetDate}
                onChange={(e) => setTestRetDate(e.target.value)}
                className="bg-[#1c2027] border border-[#31353d] rounded px-2 py-1 font-mono text-xs text-[#dfe2ed]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-label-mono-sm text-xs text-[#8f9097]">
              Protocol: stdio / stream-events • Timeout: 5000ms
            </span>
            <button
              onClick={handleExecuteTool}
              disabled={isRunning}
              className="px-4 py-2 rounded bg-[#4edea3] text-[#003824] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#6ffbbe] shadow-md cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isRunning ? 'animate-spin' : ''}`}>
                play_arrow
              </span>
              <span>{isRunning ? 'Invoking Agent...' : 'Run Tool Call'}</span>
            </button>
          </div>

          {/* Response Payload */}
          <div className="p-space-md rounded bg-[#0a0e15] border border-[#262a32] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-mono-sm text-[11px] text-[#8f9097] uppercase">
                TOOL EXECUTION RESPONSE OUTPUT
              </span>
              <span className="font-mono text-[10px] text-[#4edea3]">
                {executionOutput ? 'STATUS: 200 OK (38ms)' : 'WAITING FOR EXECUTION'}
              </span>
            </div>
            <pre className="p-3 rounded bg-[#141a24] border border-[#262a32] font-mono text-xs text-[#dfe2ed] overflow-x-auto max-h-64 leading-relaxed">
              {executionOutput
                ? JSON.stringify(executionOutput, null, 2)
                : '// Click "Run Tool Call" to execute the selected MCP tool'}
            </pre>
          </div>
        </div>

        {/* Right: Agent Integration Snippets (5 cols) */}
        <div className="lg:col-span-5 p-space-lg rounded bg-[#181c23] border border-[#31353d] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-sm border-b border-[#262a32] mb-space-md">
              <h3 className="font-headline-md text-headline-md text-[#dfe2ed]">
                IDE &amp; Client Configuration
              </h3>
              <span className="font-label-mono-sm text-xs text-[#4edea3]">
                Quick Setup
              </span>
            </div>

            <p className="font-body-sm text-xs text-[#c5c6cd] mb-3">
              Add FUK Fare Watch into Claude Desktop or Cursor so your agent can autonomously query direct SQ non-stops when planning travel.
            </p>

            {/* Config Tabs */}
            <div className="flex items-center gap-1 bg-[#0a0e15] p-1 rounded border border-[#262a32] mb-3">
              {(['claude', 'cursor', 'curl'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTabConfig(tab)}
                  className={`flex-1 py-1 rounded font-mono text-xs capitalize cursor-pointer ${
                    activeTabConfig === tab
                      ? 'bg-[#1c2027] text-[#dfe2ed] font-semibold border border-[#45474d]'
                      : 'text-[#8f9097] hover:text-[#dfe2ed]'
                  }`}
                >
                  {tab === 'claude' ? 'Claude Desktop' : tab === 'cursor' ? 'Cursor IDE' : 'cURL'}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative">
              <pre className="p-3 rounded bg-[#0a0e15] border border-[#262a32] font-mono text-xs text-[#dfe2ed] overflow-x-auto max-h-72 leading-relaxed">
                {activeTabConfig === 'claude'
                  ? claudeConfig
                  : activeTabConfig === 'cursor'
                  ? cursorConfig
                  : curlExample}
              </pre>
              <button
                onClick={() => {
                  const content =
                    activeTabConfig === 'claude'
                      ? claudeConfig
                      : activeTabConfig === 'cursor'
                      ? cursorConfig
                      : curlExample;
                  navigator.clipboard.writeText(content);
                  setCopiedConfig(true);
                  setTimeout(() => setCopiedConfig(false), 2000);
                }}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-[#262a32] border border-[#45474d] text-xs font-mono text-[#4edea3] hover:text-white cursor-pointer"
              >
                {copiedConfig ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="mt-6 p-3 rounded bg-[#0f1a2e] border border-[#78839b]/30 font-body-sm text-xs text-[#c5c6cd]">
            <span className="font-bold text-[#bcc6e1] block mb-1">PRO-TIP FOR LLM PROMPT:</span>
            "Check SIN to FUK direct non-stop fares for Oct 18 - Oct 28 using tool_search_fares and recommend whether I should book now or wait based on historical quantiles."
          </div>
        </div>
      </div>
    </div>
  );
};
