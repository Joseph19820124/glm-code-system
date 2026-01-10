import { BaseAgent } from './base';
import type { Plan } from '../types';

export class PlanningAgent extends BaseAgent {
  constructor(
    model: ReturnType<typeof import('../utils/glm-client').getGLMConfig>,
    tools: ReturnType<typeof import('../tools/registry').ToolRegistry>,
    kb: ReturnType<typeof import('../learning/knowledge-base').KnowledgeBase>,
  ) {
    const systemPrompt = `You are a Planning Agent for software development tasks.

Your responsibilities:
1. Understand user requirements deeply
2. Search knowledge base for similar past tasks
3. Break down complex tasks into clear, actionable subtasks
4. Identify dependencies between subtasks
5. Estimate complexity for each subtask
6. Identify potential risks and edge cases

Format your plans as:
- Main goal: [clear description]
- Subtasks:
  1. [task description] (complexity: low/medium/high)
  2. [task description] (complexity: low/medium/high)
  ...
- Dependencies: [what must be done first]
- Risks: [potential issues]

Always consider past solutions from knowledge base.`;

    super(model, tools, kb, systemPrompt);
  }

  async createPlan(userRequest: string): Promise<Plan> {
    const relevantInfo = await this.searchKnowledge(userRequest);

    let context = '';
    if (relevantInfo.length > 0) {
      context = '\n\nRelevant past patterns:\n';
      for (const info of relevantInfo) {
        context += `- ${info.type}: ${info.description} (success rate: ${(info.successRate * 100).toFixed(0)}%)\n`;
      }
    }

    const prompt = `Create a detailed development plan for: ${userRequest}

${context}

Consider best practices and potential issues. Be thorough but practical.`;

    const planText = await this.think(prompt);

    return {
      request: userRequest,
      plan: planText,
      relevantPatterns: relevantInfo,
      subtasks: this.parseSubtasksFromPlan(planText),
    };
  }

  async refinePlan(currentPlan: Plan, feedback: string): Promise<Plan> {
    const prompt = `Refine this plan based on feedback:

Current Plan:
${currentPlan.plan}

Feedback:
${feedback}

Update the plan to address feedback.`;

    const refinedPlan = await this.think(prompt);

    return {
      ...currentPlan,
      plan: refinedPlan,
      refined: true,
      subtasks: this.parseSubtasksFromPlan(refinedPlan),
    };
  }

  private parseSubtasksFromPlan(planText: string): Array<{ id: string; description: string; complexity: 'low' | 'medium' | 'high' }> {
    const subtasks: Array<{ id: string; description: string; complexity: 'low' | 'medium' | 'high' }> = [];
    const lines = planText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && trimmed.match(/^\d+\./)) {
        const taskText = trimmed.replace(/^\d+\.\s*/, '');
        const complexity = this.inferComplexity(taskText);

        subtasks.push({
          id: `task_${subtasks.length + 1}`,
          description: taskText,
          complexity,
        });
      }
    }

    if (subtasks.length === 0) {
      subtasks.push({
        id: 'task_1',
        description: 'Execute plan as described',
        complexity: 'high',
      });
    }

    return subtasks;
  }

  private inferComplexity(text: string): 'low' | 'medium' | 'high' {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('complex') || lowerText.includes('system') || lowerText.includes('integration')) {
      return 'high';
    }

    if (lowerText.includes('implement') || lowerText.includes('create')) {
      return 'medium';
    }

    return 'low';
  }
}
