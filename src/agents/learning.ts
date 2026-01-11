import { BaseAgent } from './base';
import type { AgentMetrics, EvaluationResult } from '../types';

export class LearningAgent extends BaseAgent {
  constructor(
    model: ReturnType<typeof import('../utils/glm-client').getGLMConfig>,
    tools: ReturnType<typeof import('../tools/registry').ToolRegistry>,
    kb: ReturnType<typeof import('../learning/knowledge-base').KnowledgeBase>,
  ) {
    const systemPrompt = `You are a Learning Agent focused on system improvement.

Your responsibilities:
1. Analyze execution results to identify patterns
2. Evaluate code quality and effectiveness
3. Identify successful vs unsuccessful approaches
4. Update knowledge base with learned patterns
5. Suggest improvements to system behavior
6. Monitor performance metrics

When analyzing:
- Look for code patterns that consistently succeed
- Identify common failure modes
- Suggest optimizations
- Be specific and actionable`;

    super(model, tools, kb, systemPrompt);
    this.metrics: AgentMetrics = {
      totalTasks: 0,
      successfulTasks: 0,
      patternsLearned: 0,
    };
  }

  async evaluateTask(taskResult: TaskResult): Promise<EvaluationResult> {
    this.metrics.totalTasks += 1;

    if (taskResult.success) {
      this.metrics.successfulTasks += 1;
    }

    const prompt = `Evaluate this task execution:

Task: ${taskResult.task.description}
Success: ${taskResult.success}
Output: ${taskResult.output.substring(0, 500)}

Provide assessment:
1. Success/Failure analysis
2. What went well (if successful)
3. What went wrong (if failed)
4. Key learnings
5. Recommendations for improvement`;

    const evaluation = await this.think(prompt, false);

    return {
      evaluation,
      success: taskResult.success,
      metrics: { ...this.metrics },
    };
  }

  async extractPattern(taskData: TaskResult): Promise<any> {
    if (!taskData.success) {
      return null;
    }

    const prompt = `Extract reusable patterns from this successful task:

Description: ${taskData.task.description}
Output: ${taskData.output.substring(0, 1000)}

Identify:
1. Code patterns that could be reused
2. Approaches that worked well
3. General principles that apply

Format as JSON with 'patterns' array containing:
- type: pattern type (e.g., api_endpoint, data_model, test_pattern)
- code: pattern code
- description: when and why to use this pattern
- complexity: low/medium/high`;

    const response = await this.think(prompt, false);

    try {
      const patternData = JSON.parse(response);
      if (patternData.patterns) {
        this.metrics.patternsLearned += patternData.patterns.length;
      }
      return patternData;
    } catch (error) {
      return null;
    }
  }

  async suggestImprovements(performanceData: any): Promise<string[]> {
    const successRate =
      this.metrics.totalTasks > 0
        ? this.metrics.successfulTasks / this.metrics.totalTasks
        : 0;

    const prompt = `Analyze system performance and suggest improvements:

Total Tasks: ${this.metrics.totalTasks}
Success Rate: ${(successRate * 100).toFixed(1)}%
Patterns Learned: ${this.metrics.patternsLearned}

Recent Performance:
${JSON.stringify(performanceData).substring(0, 1000)}

Suggest 3-5 concrete improvements to:
1. Increase success rate
2. Better utilize knowledge base
3. Improve code quality
4. Speed up execution

Format as a numbered list.`;

    const suggestionsText = await this.think(prompt, false);

    const suggestions = [];
    for (const line of suggestionsText.split('\n')) {
      if (line.trim() && line.trim()[0].match(/\d/)) {
        suggestions.push(line.trim());
      }
    }

    return suggestions;
  }

  async generateReport(): Promise<string> {
    const successRate =
      this.metrics.totalTasks > 0
        ? this.metrics.successfulTasks / this.metrics.totalTasks
        : 0;

    const report = `
Learning Agent Report
==================

Performance Metrics:
- Total Tasks: ${this.metrics.totalTasks}
- Successful Tasks: ${this.metrics.successfulTasks}
- Success Rate: ${(successRate * 100).toFixed(1)}%
- Patterns Learned: ${this.metrics.patternsLearned}

System Health: ${successRate > 0.7 ? 'Healthy' : 'Needs Improvement'}

Top Recommendations:
`;

    const recommendations = await this.suggestImprovements({});
    report += recommendations.slice(0, 5).map((r, i) => `- ${r}`).join('\n');

    return report;
  }

  async improveFromFeedback(feedback: string): Promise<any> {
    const prompt = `Analyze and incorporate this user feedback:

${feedback}

Update system behavior and knowledge base to address feedback.
Provide:
1. What was learned
2. How system will change
3. Knowledge base updates needed`;

    const improvements = await this.think(prompt, false);

    return {
      feedback,
      improvements,
      applied: true,
    };
  }
}
