import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { settings } from '../config/settings';
import type { Plan, Task } from '../types';

export class TerminalUI {
  private currentPlan: Plan | null = null;

  displayWelcome(): void {
    console.clear();
    console.log(chalk.cyan.bold('╔════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║'), chalk.yellow.bold(' GLM Code System ').padEnd(54), chalk.cyan.bold('║'));
    console.log(chalk.cyan.bold('║'), chalk.white('Autonomous coding with self-learning capabilities').padEnd(54), chalk.cyan.bold('║'));
    console.log(chalk.cyan.bold('╚════════════════════════════════════════════╝'));
    console.log();
  }

  displayAgentThought(agentName: string, thought: string): void {
    console.log(chalk.blue.bold(`[${agentName}]`), chalk.blue(thought));
  }

  displayPlan(plan: Plan): void {
    this.currentPlan = plan;
    console.log();
    console.log(chalk.green.bold('━━━━━━━━━━━━━━'));
    console.log(chalk.green.bold('Development Plan'));
    console.log(chalk.green.bold('━━━━━━━━━━━━━━')));
    console.log(plan.plan);

    if (plan.relevantPatterns && plan.relevantPatterns.length > 0) {
      console.log();
      console.log(chalk.bold('Relevant Patterns:'));
      for (const pattern of plan.relevantPatterns) {
        const successRate = (pattern.successRate * 100).toFixed(0);
        console.log(
          chalk.cyan(`  - ${pattern.type}:`),
          chalk.white(pattern.description),
          chalk.yellow(` (${successRate}% success rate)`)
        );
      }
    }
    console.log();
  }

  displayTaskStart(task: Task, index: number, total: number): void {
    console.log();
    console.log(
      chalk.yellow.bold(`Task ${index}/${total}:`),
      chalk.white(task.description),
      chalk.cyan(` (${task.complexity})`)
    );
  }

  displayTaskComplete(task: Task, success: boolean, output: string): void {
    const status = success ? chalk.green.bold('✓') : chalk.red.bold('✗');
    console.log(`${status} ${task.description}`);

    if (success && output) {
      const preview = output.substring(0, 200);
      console.log(chalk.dim(preview + (output.length > 200 ? '...' : '')));
    }
  }

  displayProgress(current: number, total: number, message: string = 'Processing...'): void {
    const spinner = ora(message).start();
    const percentage = Math.round((current / total) * 100);
    spinner.text = `${message} ${percentage}%`;
    spinner.succeed();
  }

  async displayStreamingThought(agentName: string, stream: AsyncGenerator<string>): Promise<void> {
    process.stdout.write(chalk.blue.bold(`[${agentName}] `) + ' ');

    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }

    process.stdout.write('\n');
  }

  displayError(error: string): void {
    console.log();
    console.log(chalk.red.bold('Error:'), chalk.red(error));
  }

  displaySuccess(message: string): void {
    console.log();
    console.log(chalk.green.bold('Success:'), chalk.green(message));
  }

  displayLearning(patternsCount: number): void {
    if (patternsCount > 0) {
      console.log();
      console.log(
        chalk.cyan.bold('[Learning]'),
        chalk.white(`Recorded ${patternsCount} new patterns in knowledge base`)
      );
    }
  }

  displayMetrics(metrics: any): void {
    const successRate =
      metrics.totalTasks > 0
        ? (metrics.successfulTasks / metrics.totalTasks)
        : 0;

    console.log();
    console.log(chalk.cyan.bold('System Metrics'));
    console.log(chalk.cyan('━━━━━━━━━━━━━━'));
    console.log(chalk.white(`Total Tasks: ${metrics.totalTasks}`));
    console.log(chalk.white(`Successful: ${metrics.successfulTasks}`));
    console.log(chalk.yellow(`Success Rate: ${(successRate * 100).toFixed(1)}%`));
    console.log(chalk.white(`Patterns Learned: ${metrics.patternsLearned}`));
    console.log();
  }

  displayKnowledge(patterns: any[]): void {
    if (patterns.length === 0) {
      console.log(chalk.yellow('No patterns learned yet.'));
      return;
    }

    console.log();
    console.log(chalk.bold('Learned Patterns:'));
    for (let i = 0; i < Math.min(patterns.length, 10); i++) {
      const pattern = patterns[i];
      const successRate = (pattern.successRate * 100).toFixed(0);
      console.log();
      console.log(chalk.cyan(`${i + 1}.`), chalk.bold(pattern.type));
      console.log(chalk.white(`  (${successRate}%) used ${pattern.usageCount || 0} times`));
      console.log(chalk.dim(`   ${pattern.description}`));
    }

    if (patterns.length > 10) {
      console.log();
      console.log(chalk.dim(`... and ${patterns.length - 10} more patterns`));
    }
  }

  async displayUserInput(): Promise<string> {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'command',
        message: chalk.cyan('glm-code>'),
      },
    ]);

    return answer.command;
  }

  async displayConfirmPlan(): Promise<boolean> {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Execute this plan?',
        default: true,
      },
    ]);

    return answer.confirm;
  }

  displayHelp(): void {
    console.log();
    console.log(chalk.bold('Available Commands:'));
    console.log();
    console.log(chalk.cyan('/help'), chalk.white('   - Show help information'));
    console.log(chalk.cyan('/plan'), chalk.white('   - Display current plan'));
    console.log(chalk.cyan('/status'), chalk.white('   - Show system status and metrics'));
    console.log(chalk.cyan('/learn'), chalk.white('   - Display learned patterns'));
    console.log(chalk.cyan('/feedback'), chalk.white('   - Provide feedback on system performance'));
    console.log(chalk.cyan('/clear'), chalk.white('   - Clear conversation history'));
    console.log(chalk.cyan('/quit'), chalk.white('   - Exit system'));
    console.log();
  }
}

export type AsyncGenerator<T> = {
  [Symbol.asyncIterator](): AsyncIterator<T>;
}
