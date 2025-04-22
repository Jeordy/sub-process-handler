import { spawn, ChildProcess, SpawnOptions } from 'child_process';

export class SubProcessHandler {
  private command: string;
  private args: string[];
  private options: SpawnOptions;
  public process: ChildProcess | null = null;
  public processId: number | null = null;
  private isRunning: boolean = false;
  private output: string = '';
  private error: any = null;

  constructor(command: string, args: string[] = [], options: SpawnOptions = {}) {
    this.command = command;
    this.args = args;

    // Critical changes for process detachment to work properly
    this.options = {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      ...options,
    };

    this.startProcess();
  }

  private startProcess(): void {
    try {
      this.process = spawn(this.command, this.args, this.options);

      // Set process ID
      this.processId = this.process.pid || null;

      // Track if the process is running
      this.isRunning = true;

      // Ensure stdout and stderr exist before attaching listeners
      if (this.process.stdout) {
        this.process.stdout.on('data', (data: Buffer) => {
          const dataStr = data.toString();
          this.output += dataStr;
          // Optional: Log to console for debugging
          console.log(`[STDOUT]: ${dataStr}`);
        });
      }

      if (this.process.stderr) {
        this.process.stderr.on('data', (data: Buffer) => {
          const dataStr = data.toString();
          this.output += dataStr;
          // Optional: Log to console for debugging
          console.error(`[STDERR]: ${dataStr}`);
        });
      }

      // Handle process exit
      this.process.on('close', (code: number) => {
        this.isRunning = false;
        console.log(`Process exited with code ${code}`);
      });

      this.process.on('error', (err: Error) => {
        this.isRunning = false;
        this.error = err;
        console.error(`Process error: ${err.message}`);
      });

      // Properly detach the process
      if (this.options.detached) {
        this.process.unref();
      }
    } catch (error) {
      console.error('Failed to start process:', error);
      this.error = error;
    }
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
    if (this.process && this.process.pid) {
      try {
        // On Windows, we need a different approach to kill a detached process
        if (process.platform === 'win32') {
          // Kill process tree (may require additional logic for Windows)
          spawn('taskkill', ['/pid', this.process.pid.toString(), '/f', '/t']);
        } else {
          // On Unix-like systems, negative PID kills the process group
          process.kill(-this.process.pid, 'SIGKILL');
        }
        this.isRunning = false;
      } catch (error) {
        console.error(`Failed to kill process: ${error}`);
      }
    }
  }
}
