import axios, { AxiosInstance } from 'axios';
import { getGLMConfig } from '../config/settings';

export class GLMClient {
  private client: AxiosInstance;
  private config: ReturnType<typeof getGLMConfig>;

  constructor() {
    this.config = getGLMConfig();

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  async generate(
    messages: Array<{ role: string; content: string }>,
    stream: boolean = false,
    temperature: number = 0.7,
    maxTokens: number = 4096,
  ): Promise<string> {
    const payload = {
      model: this.config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    };

    try {
      const response = await this.client.post('/chat/completions', payload);

      if (stream) {
        return await this.handleStreamResponse(response.data);
      }

      return response.data.choices[0].message.content;
    } catch (error: any) {
      throw new Error(`GLM API Error: ${error.message}`);
    }
  }

  async generateStream(
    messages: Array<{ role: string; content: string }>,
    temperature: number = 0.7,
    maxTokens: number = 4096,
  ): Promise<AsyncGenerator<string>> {
    const payload = {
      model: this.config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    };

    try {
      const response = await this.client.post('/chat/completions', payload, {
        responseType: 'stream',
      });

      return this.parseStream(response.data);
    } catch (error: any) {
      throw new Error(`GLM Stream Error: ${error.message}`);
    }
  }

  private async handleStreamResponse(data: any): Promise<string> {
    let fullContent = '';

    for await (const chunk of data) {
      if (chunk.toString().startsWith('data: ')) {
        const dataStr = chunk.toString().slice(6);
        if (dataStr === '[DONE]') {
          break;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.choices && parsed.choices[0]) {
            const delta = parsed.choices[0].delta;
            if (delta.content) {
              fullContent += delta.content;
            }
          }
        } catch {
          continue;
        }
      }
    }

    return fullContent;
  }

  private async *parseStream(data: any): AsyncGenerator<string> {
    for await (const chunk of data) {
      if (chunk.toString().startsWith('data: ')) {
        const dataStr = chunk.toString().slice(6);
        if (dataStr === '[DONE]') {
          break;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.choices && parsed.choices[0]) {
            const delta = parsed.choices[0].delta;
            if (delta.content) {
              yield delta.content;
            }
          }
        } catch {
          continue;
        }
      }
    }
  }

  async close(): Promise<void> {
    this.client.defaults.baseURL = '';
  }
}

export interface AsyncGenerator<T> extends AsyncIterableIterator<T> {
  [Symbol.asyncIterator](): AsyncIterator<T>;
}
