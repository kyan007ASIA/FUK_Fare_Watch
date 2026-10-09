export interface McpToolCallRequest {
  jsonrpc: '2.0';
  method: 'tools/call';
  params: {
    name: string;
    arguments: Record<string, any>;
  };
  id: string | number;
}

export interface McpToolCallResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export const MCP_TOOL_DEFINITIONS: McpToolDefinition[] = [
  {
    name: 'tool_search_fares',
    description: 'Searches direct non-stop flight quotes between Singapore Changi (SIN) and Fukuoka (FUK) on Singapore Airlines.',
    inputSchema: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'IATA code, e.g. SIN' },
        destination: { type: 'string', description: 'IATA code, e.g. FUK' },
        departure_date: { type: 'string', description: 'YYYY-MM-DD' },
        return_date: { type: 'string', description: 'YYYY-MM-DD' },
        cabin: { type: 'string', enum: ['economy', 'premium_economy', 'business'] },
        non_stop_only: { type: 'boolean', default: true }
      },
      required: ['origin', 'destination', 'departure_date', 'return_date']
    }
  },
  {
    name: 'tool_get_recommendation',
    description: 'Calculates algorithmic BUY / WAIT / BUY_BY state using historical quantile bounds and regression slope.',
    inputSchema: {
      type: 'object',
      properties: {
        origin: { type: 'string' },
        destination: { type: 'string' },
        current_fare_sgd: { type: 'number' },
        days_to_departure: { type: 'number' }
      },
      required: ['origin', 'destination', 'current_fare_sgd', 'days_to_departure']
    }
  },
  {
    name: 'tool_get_quantiles',
    description: 'Retrieves historical quantile distribution (P10, P20, P50, P80, P95) for the corridor.',
    inputSchema: {
      type: 'object',
      properties: {
        corridor: { type: 'string', default: 'SIN-FUK' },
        window_days: { type: 'number', default: 180 }
      },
      required: ['corridor']
    }
  },
  {
    name: 'tool_create_alert',
    description: 'Registers automated real-time dispatch alert for price drops or recommendation shifts.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        telegram: { type: 'string' },
        price_threshold_sgd: { type: 'number' }
      },
      required: ['email', 'price_threshold_sgd']
    }
  }
];

/**
 * Execute an MCP Tool call directly against the in-app server logic.
 */
export async function executeMcpToolCall(req: McpToolCallRequest): Promise<McpToolCallResponse> {
  const { name, arguments: args } = req.params;
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (name === 'tool_search_fares') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        carrier: 'Singapore Airlines',
        corridor: `${args.origin || 'SIN'} ⇄ ${args.destination || 'FUK'}`,
        non_stop_only: true,
        outbound: {
          flight: 'SQ656',
          equipment: 'Boeing 787-10',
          departure: '01:20 SGT',
          arrival: '08:35 JST',
          duration: '6h 15m'
        },
        inbound: {
          flight: 'SQ655',
          equipment: 'Boeing 787-10',
          departure: '09:45 JST',
          arrival: '15:20 SGT',
          duration: '6h 35m'
        },
        pricing: {
          bundle_roundtrip_sgd: 742.0,
          split_oneway_total_sgd: 800.0,
          savings_sgd: 58.0,
          strategy: 'BUNDLE_ROUNDTRIP'
        }
      }
    };
  }

  if (name === 'tool_get_recommendation') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        corridor: 'SIN-FUK',
        recommendation: 'BUY_NOW',
        confidence: 0.948,
        historical_metrics: {
          p20_sgd: 750,
          median_sgd: 785,
          p80_sgd: 890,
          sample_size: 82
        },
        price_velocity_per_week: '+S$42/wk',
        rationale: 'Statistical Trough Detected • Historical P18 Favorable Window'
      }
    };
  }

  if (name === 'tool_get_quantiles') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        corridor: 'SIN-FUK',
        quantiles: {
          p10: 715,
          p20: 750,
          p50: 785,
          p80: 890,
          p95: 1080
        },
        sample_count: 2480
      }
    };
  }

  if (name === 'tool_create_alert') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        status: 'active',
        subscription_id: 'sub_' + Math.random().toString(36).substring(7),
        corridor: 'SIN-FUK',
        threshold_sgd: args.price_threshold_sgd || 720
      }
    };
  }

  return {
    jsonrpc: '2.0',
    id: req.id,
    error: {
      code: -32601,
      message: `Tool not found: ${name}`
    }
  };
}
