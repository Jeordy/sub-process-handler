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

  /**
   * Creates a new subprocess handler
   * @param command Command to execute (path to executable)
   * @param args Arguments to pass to the command
   * @param options Spawn options
   */
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
      this.isRunning = !!this.processId;

      // Ensure stdout and stderr exist before attaching listeners
      if (this.process.stdout) {
        this.process.stdout.on('data', (data: Buffer) => {
          const dataStr = data.toString();
          this.output += dataStr;
        });
      }

      if (this.process.stderr) {
        this.process.stderr.on('data', (data: Buffer) => {
          const dataStr = data.toString();
          this.output += dataStr;
        });
      }

      // Handle process exit
      this.process.on('close', (code: number) => {
        this.isRunning = false;
      });

      this.process.on('error', (err: Error) => {
        this.isRunning = false;
        this.error = err;
      });

      // Properly detach the process
      if (this.options.detached) {
        this.process.unref();
      }
    } catch (error) {
      this.error = error;
      this.isRunning = false;
    }
  }

  public getStatus(): string {
    if (this.process && this.isRunning) {
      try {
        // Attempt to send a signal to the process to check if it's still alive
        process.kill(this.process.pid!, 0);
        return 'Running';
      } catch {
        this.isRunning = false;
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
        console.log(`Attempting to kill process with PID: ${this.process.pid}`);

        // On Windows, we need a different approach to kill a detached process
        if (process.platform === 'win32') {
          // Kill process tree (may require additional logic for Windows)
          spawn('taskkill', ['/pid', this.process.pid.toString(), '/f', '/t']);
        } else {
          // On Unix-like systems, negative PID kills the process group
          process.kill(-this.process.pid, 'SIGKILL');
        }
        this.isRunning = false;
        console.log(`Process with PID ${this.process.pid} killed successfully`);
      } catch (error) {
        console.error(`Failed to kill process: ${error}`);
      }
    } else {
      console.log('No process to kill or process ID is not available');
    }
  }
}
