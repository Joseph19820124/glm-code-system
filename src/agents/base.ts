import { getGLMConfig } from '../utils/glm-client';
import { ToolRegistry } from '../tools/registry';
import { KnowledgeBase } from '../learning/knowledge-base';
import type { Plan, Task } from '../types';

export class BaseAgent {
  protected model: ReturnType<typeof getGLMConfig>;
  protected tools: ToolRegistry;
  protected kb: KnowledgeBase;
  protected systemPrompt: string | undefined;
  protected memory: Array<{ role: string; content: string }> = [];

  constructor(
    model: ReturnType<typeof getGLMConfig>,
    tools: ToolRegistry,
    kb: KnowledgeBase,
    systemPrompt?: string,
  ) {
    this.model = model;
    this.tools = tools;
    this.kb = kb;
    this.systemPrompt = systemPrompt;
  }

  async think(
    userInput: string,
    useMemory: boolean = true,
    temperature: number = 0.7,
  ): Promise<string> {
    const messages: Array<{ role: string; content: string }> = [];

    if (this.systemPrompt) {
      messages.push({ role: 'system', content: this.systemPrompt });
    }

    if (useMemory && this.memory.length > 0) {
      messages.push(...this.memory);
    }

    messages.push({ role: 'user', content: userInput });

    const response = await this.model.generate(messages, temperature);

    if (useMemory) {
      this.memory.push({ role: 'user', content: userInput });
      this.memory.push({ role: 'assistant', content: response });
    }

    return response;
  }

  async *thinkStream(
    userInput: string,
    useMemory: boolean = true,
    temperature: number = 0.7,
  ): AsyncGenerator<string> {
    const messages: Array<{ role: string; content: string }> = [];

    if (this.systemPrompt) {
      messages.push({ role: 'system', content: this.systemPrompt });
    }

    if (useMemory && this.memory.length > 0) {
      messages.push(...this.memory);
    }

    messages.push({ role: 'user', content: userInput });

    const responseChunks: string[] = [];
    for await (const chunk of this.model.generateStream(messages, temperature)) {
      responseChunks.push(chunk);
      yield chunk;
    }

    const fullResponse = responseChunks.join('');

    if (useMemory) {
      this.memory.push({ role: 'user', content: userInput });
      this.memory.push({ role: 'assistant', content: fullResponse });
    }
  }

  async useTool(toolName: string, ...args: any[]): Promise<[boolean, string]> {
    const result = await this.tools.execute(toolName, ...args);

    if (result.success) {
      return [true, result.output];
    }

    return [false, result.error || 'Unknown error'];
  }

  async searchKnowledge(query: string): Promise<any[]> {
    const patterns = await this.kb.searchPatterns();

    return patterns.map(pattern => ({
      type: pattern.patternType,
      code: pattern.code,
      description: pattern.description,
      successRate: pattern.successRate,
    }));
  }

  clearMemory(): void {
    this.memory = [];
  }
}

export type AsyncGenerator<T> = {
  [Symbol.asyncIterator](): AsyncIterator<T>;
}
