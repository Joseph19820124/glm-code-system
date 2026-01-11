import dotenv from 'dotenv';

dotenv.config();

export const settings: SystemConfig = {
  glm: {
    apiKey: process.env.GLM_API_KEY || '',
    model: process.env.GLM_MODEL || 'glm-4',
    baseUrl: process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  },
  database: {
    url: process.env.DATABASE_URL || 'file:./knowledge_base.db',
  },
  agent: {
    maxIterations: parseInt(process.env.MAX_ITERATIONS || '100', 10),
    learningEnabled: process.env.LEARNING_ENABLED !== 'false',
    autonomyLevel: (process.env.AUTONOMY_LEVEL as 'low' | 'medium' | 'high') || 'medium',
  },
  security: {
    allowedCommands: (process.env.ALLOWED_COMMANDS || 'git,npm,pnpm,yarn,python,pytest,node').split(','),
    sandboxMode: process.env.SANDBOX_MODE === 'true',
  },
  ui: {
    mode: 'terminal',
    logLevel: (process.env.LOG_LEVEL as 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR') || 'INFO',
  },
};

export function validateSettings(): boolean {
  if (!settings.glm.apiKey) {
    console.error('❌ GLM_API_KEY is required');
    return false;
  }
  return true;
}

export function getGLMConfig(): GLMConfig {
  return {
    apiKey: settings.glm.apiKey,
    model: settings.glm.model,
    baseUrl: settings.glm.baseUrl,
    maxTokens: 4096,
    temperature: 0.7,
  };
}
