import { spawn, ChildProcess, SpawnOptions } from 'child_process';

export default class SubProcessHandler {
  private command: string;
  private args: string[];
  private options: SpawnOptions;
  public process: ChildProcess | null = null;
  private isRunning: boolean = false;
  private output: string = '';
  private error: any = null;

  constructor(command: string, args: string[] = [], options: SpawnOptions = {}) {
    this.command = command;
    this.args = args;
    this.options = { detached: true, stdio: ['ignore', 'pipe'], ...options };

    this.startProcess();
  }

  private startProcess(): void {
    this.process = spawn(this.command, this.args, this.options);
    this.process.unref();

    // Track if the process is running
    this.isRunning = true;

    // Capture stdout and stderr
    this.process.stdout?.on('data', (data: Buffer) => {
      this.output += data.toString();
    });

    this.process.stderr?.on('data', (data: Buffer) => {
      this.output += data.toString();
    });

    // Handle process exit
    this.process.on('close', (code) => {
      this.isRunning = false;
    });

    this.process.on('error', (err) => {
      this.isRunning = false;
      this.error = err;
    });
  }

  public getStatus(): string {
    if (this.process && this.isRunning) {
      try {
        // Attempt to send a signal to the process to check if it's still alive
        process.kill(this.process.pid!, 0);
        return 'Running';
      } catch {
        return 'Not Running';
      }
    }
    return 'Not Running';
  }

  public getOutput(): string {
    return this.output;
  }

  public getError(): any {
    return this.error;
  }

  public killProcess(): void {
    if (this.getStatus() === 'Running' && this.process) {
      process.kill(this.process.pid!);
      this.isRunning = false;
    }
  }
}
