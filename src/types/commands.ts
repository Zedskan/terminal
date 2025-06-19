// src/types/commands.ts
export interface MarkdownOutput {
  type: 'markdown';
  content: string;
  writeup?: any;
}

export type CommandOutput = string | MarkdownOutput;

export type CommandFunction = (args: string[]) => Promise<CommandOutput> | CommandOutput;