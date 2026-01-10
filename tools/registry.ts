import { exec } from 'child_process';
import { settings } from '../config/settings';
import type { ToolResult } from '../types';

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;

  abstract execute(...args: any[]): Promise<ToolResult>;

  isAuthorized(): boolean {
    return true;
  }
}

export class ReadFileTool extends BaseTool {
  name = 'read_file';
  description = 'Read contents of a file at given path';

  async execute(filePath: string): Promise<ToolResult> {
    try {
      const fs = await import('fs').then(m => m.promises.readFile);
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, output: content };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: `Failed to read file: ${error.message}`,
      };
    }
  }
}

export class WriteFileTool extends BaseTool {
  name = 'write_file';
  description = 'Write content to a file at given path';

  async execute(filePath: string, content: string): Promise<ToolResult> {
    try {
      const fs = await import('fs').then(m => m.promises.writeFile);
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true, output: `Successfully wrote to ${filePath}` };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: `Failed to write file: ${error.message}`,
      };
    }
  }
}

export class BashTool extends BaseTool {
  name = 'bash';
  description = 'Execute a shell command (with safety restrictions)';

  async execute(command: string): Promise<ToolResult> {
    if (!this.isSafeCommand(command)) {
      return {
        success: false,
        output: '',
        error: `Command not allowed: ${command}`,
      };
    }

    try {
      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            resolve({
              success: false,
              output: stdout,
              error: stderr || error.message,
              metadata: { exitCode: error?.code },
            });
          } else {
            resolve({
              success: true,
              output: stdout,
              metadata: { exitCode: 0 },
            });
          }
        });
      });
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: `Failed to execute command: ${error.message}`,
      };
    }
  }

  private isSafeCommand(command: string): boolean {
    const allowed = settings.security.allowedCommands;
    const commandName = command.trim().split(' ')[0];

    return allowed.some(allowedCmd => command.trim().startsWith(allowedCmd));
  }
}

export class SearchFilesTool extends BaseTool {
  name = 'search_files';
  description = 'Search for files matching a pattern';

  async execute(pattern: string, path: string = '.'): Promise<ToolResult> {
    try {
      const { glob } = await import('glob');
      const matches = await glob(`${path}/**/${pattern}`, {
        nodir: true,
        ignore: ['**/node_modules/**', '**/.git/**'],
      });

      return {
        success: true,
        output: matches.join('\n'),
        metadata: { count: matches.length },
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: `Failed to search files: ${error.message}`,
      };
    }
  }
}

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools(): void {
    this.register(new ReadFileTool());
    this.register(new WriteFileTool());
    this.register(new BashTool());
    this.register(new SearchFilesTool());
  }

  register(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
  }

  async execute(toolName: string, ...args: any[]): Promise<ToolResult> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      return {
        success: false,
        output: '',
        error: `Tool not found: ${toolName}`,
      };
    }

    if (!tool.isAuthorized()) {
      return {
        success: false,
        output: '',
        error: `Tool not authorized: ${toolName}`,
      };
    }

    return await tool.execute(...args);
  }

  getToolDescriptions(): Array<{ name: string; description: string }> {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
    }));
  }
}
