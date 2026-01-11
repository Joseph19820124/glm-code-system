import { BaseAgent } from './base';
import type { Task, TaskResult } from '../types';

export class CodingAgent extends BaseAgent {
  constructor(
    model: ReturnType<typeof import('../utils/glm-client').getGLMConfig>,
    tools: ReturnType<typeof import('../tools/registry').ToolRegistry>,
    kb: ReturnType<typeof import('../learning/knowledge-base').KnowledgeBase>,
  ) {
    const systemPrompt = `You are a Coding Agent responsible for implementing software.

Your responsibilities:
1. Understand task requirements clearly
2. Search knowledge base for relevant code patterns
3. Write clean, maintainable code following best practices
4. Use tools to read, write, and test code
5. Run tests and verify functionality
6. Report results and any issues

Available tools:
- read_file(path): Read file contents
- write_file(path, content): Write content to file
- bash(command): Execute shell commands
- search_files(pattern): Search for files

When using tools, clearly state what you're doing and why.
Always test your changes if possible.
Report success or failure clearly.`;

    super(model, tools, kb, systemPrompt);
    this.currentTask: Task | null = null;
    this.testResults: any[] = [];
  }

  async executeTask(task: Task, planContext?: string): Promise<TaskResult> {
    this.currentTask = task;

    const context = planContext ? `Context:\n${planContext}` : '';

    const prompt = `Execute this coding task:

Task: ${task.description}
Complexity: ${task.complexity}

${context}

Use available tools to implement this task.
Test your changes if possible.
Report result clearly.`;

    const result = await this.think(prompt, false);

    return {
      task,
      success: true,
      output: result,
      testResults: this.testResults,
    };
  }

  async writeCode(
    filePath: string,
    content: string,
    description: string,
  ): Promise<[boolean, string]> {
    const [success, output] = await this.useTool('write_file', filePath, content);

    if (success) {
      const patternType = this.inferPatternType(description);

      try {
        await this.kb.addPattern(patternType, content, description, `File: ${filePath}`, {
          language: 'TypeScript',
          framework: 'Unknown',
        });
      } catch (error: any) {
        console.error('Failed to add pattern:', error.message);
      }
    }

    return [success, output];
  }

  async runTests(): Promise<any[]> {
    const results: any[] = [];

    const [success, output] = await this.useTool('bash', 'npm test');

    const testResult = {
      command: 'npm test',
      success,
      output,
    };

    results.push(testResult);
    this.testResults.push(testResult);

    return results;
  }

  async analyzeCode(filePath: string): Promise<any> {
    const [success, content] = await this.useTool('read_file', filePath);

    if (!success) {
      return { error: content, file: filePath };
    }

    const prompt = `Analyze this code:\n\n${content}\n\nProvide:
- Code quality assessment
- Potential issues
- Suggestions for improvement
- Complexity estimate`;

    const analysis = await this.think(prompt, false);

    return {
      file: filePath,
      content,
      analysis,
    };
  }

  async learnFromExecution(taskResult: TaskResult): Promise<void> {
    if (taskResult.success) {
      try {
        await this.kb.addSolution(
          'coding_task',
          taskResult.output || '',
          `Successfully completed: ${this.currentTask?.description || 'Task'}`,
          {
            complexity: this.currentTask?.complexity || 'medium',
            timestamp: new Date().toISOString(),
          },
        );
      } catch (error: any) {
        console.error('Failed to add solution:', error.message);
      }
    }
  }

  private inferPatternType(description: string): string {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('api') || lowerDesc.includes('endpoint')) {
      return 'api_endpoint';
    } else if (lowerDesc.includes('model')) {
      return 'data_model';
    } else if (lowerDesc.includes('test')) {
      return 'test';
    } else if (lowerDesc.includes('component') || lowerDesc.includes('ui')) {
      return 'ui_component';
    } else {
      return 'general_code';
    }
  }
}
