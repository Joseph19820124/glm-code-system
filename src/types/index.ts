export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface CodePattern {
  id?: number;
  patternType: string;
  code: string;
  description: string;
  usageCount: number;
  successRate: number;
  metadata: Record<string, unknown>;
  context?: string;
}

export interface Solution {
  id?: number;
  problemType: string;
  solution: string;
  description: string;
  effectivenessScore: number;
  usageCount: number;
  metadata: Record<string, unknown>;
}

export interface UserPreference {
  id?: number;
  preferenceType: string;
  value: string;
  confidence: number;
  metadata: Record<string, unknown>;
}

export interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GLMConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
}

export interface SystemConfig {
  glm: {
    apiKey: string;
    model: string;
    baseUrl: string;
  };
  database: {
    url: string;
  };
  agent: {
    maxIterations: number;
    learningEnabled: boolean;
    autonomyLevel: 'low' | 'medium' | 'high';
  };
  security: {
    allowedCommands: string[];
    sandboxMode: boolean;
  };
  ui: {
    mode: 'terminal';
    logLevel: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
  };
}

export interface AgentMetrics {
  totalTasks: number;
  successfulTasks: number;
  patternsLearned: number;
}

export interface Task {
  id: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  completed?: boolean;
  result?: string;
}

export interface Plan {
  request: string;
  plan: string;
  relevantPatterns: CodePattern[];
  subtasks: Task[];
}

export interface TaskResult {
  task: Task;
  success: boolean;
  output: string;
  testResults: unknown[];
}

export interface EvaluationResult {
  evaluation: string;
  success: boolean;
  metrics: AgentMetrics;
}
