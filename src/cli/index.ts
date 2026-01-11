import { settings, validateSettings } from './config/settings';
import { PlanningAgent } from './agents/planning';
import { CodingAgent } from './agents/coding';
import { LearningAgent } from './agents/learning';
import { ToolRegistry } from './tools/registry';
import { KnowledgeBase } from './learning/knowledge-base';
import { GLMClient } from './utils/glm-client';
import { TerminalUI } from './cli/terminal';
import type { Plan, Task } from './types';

export class GLMCodeSystem {
  private ui: TerminalUI;
  private model: GLMClient;
  private tools: ToolRegistry;
  private kb: KnowledgeBase;
  private planningAgent: PlanningAgent | null = null;
  private codingAgent: CodingAgent | null = null;
  private learningAgent: LearningAgent | null = null;
  private currentPlan: Plan | null = null;
  private taskQueue: Task[] = [];
  private running = true;

  constructor() {
    this.ui = new TerminalUI();
    this.model = new GLMClient();
    this.tools = new ToolRegistry();
    this.kb = new KnowledgeBase();
  }

  async initialize(): Promise<void> {
    this.ui.displaySuccess('Initializing GLM Code System...');

    await this.kb.initialize();
    this.ui.displaySuccess('Knowledge base initialized');

    this.planningAgent = new PlanningAgent(this.model, this.tools, this.kb);
    this.ui.displaySuccess('Planning agent initialized');

    this.codingAgent = new CodingAgent(this.model, this.tools, this.kb);
    this.ui.displaySuccess('Coding agent initialized');

    this.learningAgent = new LearningAgent(this.model, this.tools, this.kb);
    this.ui.displaySuccess('Learning agent initialized');
  }

  async run(): Promise<void> {
    await this.initialize();
    this.ui.displayWelcome();

    while (this.running) {
      try {
        const command = await this.ui.displayUserInput();

        if (command.startsWith('/')) {
          await this.handleCommand(command);
        } else {
          await this.processTask(command);
        }
      } catch (error: any) {
        this.ui.displayError(`Unexpected error: ${error.message}`);
      }
    }

    await this.cleanup();
  }

  async handleCommand(command: string): Promise<void> {
    const cmd = command.slice(1).toLowerCase().trim();

    if (cmd === 'help' || cmd === 'h') {
      this.ui.displayHelp();
    } else if (cmd === 'quit' || cmd === 'exit' || cmd === 'q') {
      this.running = false;
    } else if (cmd === 'plan' || cmd === 'p') {
      if (this.currentPlan) {
        this.ui.displayPlan(this.currentPlan);
      } else {
        this.ui.displayError('No active plan. Start a task first.');
      }
    } else if (cmd === 'status' || cmd === 's') {
      if (this.learningAgent) {
        this.ui.displayMetrics(this.learningAgent.getMetrics());
      } else {
        this.ui.displayError('Learning agent not initialized');
      }
    } else if (cmd === 'learn' || cmd === 'l') {
      await this.showKnowledge();
    } else if (cmd === 'clear' || cmd === 'c') {
      if (this.codingAgent) {
        this.codingAgent.clearMemory();
      }
      if (this.planningAgent) {
        this.planningAgent.clearMemory();
      }
      if (this.learningAgent) {
        this.learningAgent.clearMemory();
      }
      this.ui.displaySuccess('Memory cleared');
    } else if (cmd === 'feedback' || cmd === 'f') {
      await this.handleFeedback();
    } else {
      this.ui.displayError(`Unknown command: /${cmd}`);
      this.ui.displayHelp();
    }
  }

  async processTask(userRequest: string): Promise<void> {
    this.ui.displaySuccess(`\nProcessing: ${userRequest}`);

    try {
      await this.planAndExecute(userRequest);
    } catch (error: any) {
      this.ui.displayError(`Task failed: ${error.message}`);
    }
  }

  async planAndExecute(userRequest: string): Promise<void> {
    if (!this.planningAgent) {
      throw new Error('Planning agent not initialized');
    }

    this.ui.displayAgentThought('PlanningAgent', 'Creating development plan...');

    const plan = await this.planningAgent.createPlan(userRequest);
    this.currentPlan = plan;

    this.ui.displayPlan(plan);

    const confirmed = await this.ui.displayConfirmPlan();

    if (confirmed) {
      await this.executePlan(plan);
    }
  }

  async executePlan(plan: Plan): Promise<void> {
    if (!this.codingAgent) {
      throw new Error('Coding agent not initialized');
    }

    this.ui.displaySuccess('\nExecuting development plan...');

    const tasks = plan.subtasks || [];
    let completedCount = 0;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      try {
        this.ui.displayTaskStart(task, i + 1, tasks.length);

        await this.ui.displayStreamingThought(
          'CodingAgent',
          this.codingAgent.thinkStream(
            `Execute task: ${task.description}`
          )
        );

        const result = await this.codingAgent.executeTask(task, plan.plan);

        this.ui.displayTaskComplete(task, result.success, result.output);

        if (result.success) {
          completedCount += 1;
        }

        await this.learnFromSession(tasks, completedCount);
      } catch (error: any) {
        this.ui.displayError(`Task ${i + 1} failed: ${error.message}`);
      }
    }

    this.ui.displaySuccess(
      `\nCompleted ${completedCount}/${tasks.length} tasks`
    );

    if (this.learningAgent) {
      await this.learnFromSession(tasks, completedCount);
    }
  }

  async learnFromSession(
    tasks: Task[],
    successCount: number,
  ): Promise<void> {
    if (!this.learningAgent) {
      return;
    }

    this.ui.displayAgentThought('LearningAgent', 'Analyzing session...');

    const sessionData = {
      totalTasks: tasks.length,
      successfulTasks: successCount,
      successRate: successCount / (tasks.length || 1),
    };

    const evaluation = await this.learningAgent.evaluateTask({
      success: successCount > 0,
      ...sessionData,
    });

    this.ui.displayMetrics(evaluation.metrics);

    const patterns = await this.learningAgent.extractPattern({
      success: successCount > 0,
      taskCount: tasks.length,
    });

    if (patterns && patterns.patterns && patterns.patterns.length > 0) {
      this.ui.displayLearning(patterns.patterns.length);
    }
  }

  async showKnowledge(): Promise<void> {
    const patterns = await this.kb.searchPatterns();
    this.ui.displayKnowledge(patterns);
  }

  async handleFeedback(): Promise<void> {
    const feedback = await this.ui.getUserInput('\nEnter your feedback: ');

    if (!feedback || feedback.trim() === '') {
      this.ui.displayError('No feedback provided');
      return;
    }

    if (this.learningAgent) {
      await this.learningAgent.improveFromFeedback(feedback);
      this.ui.displaySuccess('Feedback recorded');
    }
  }

  async cleanup(): Promise<void> {
    await this.model.close();
    this.ui.displaySuccess('\nGoodbye!');
  }
}

async function main(): Promise<void> {
  if (!validateSettings()) {
    console.error('Please set GLM_API_KEY in .env file');
    process.exit(1);
  }

  const system = new GLMCodeSystem();
  await system.run();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { GLMCodeSystem, main };
