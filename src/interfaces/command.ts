export interface Command {
  command: string;
  outputs: (string | { type: 'markdown', content: string })[];
}