import { ChildProcess, SpawnOptions } from 'child_process';
export declare class SubProcessHandler {
    private command;
    private args;
    private options;
    process: ChildProcess | null;
    processId: number | null;
    private isRunning;
    private output;
    private error;
    /**
     * Creates a new subprocess handler
     * @param command Command to execute (path to executable)
     * @param args Arguments to pass to the command
     * @param options Spawn options
     */
    constructor(command: string, args?: string[], options?: SpawnOptions);
    private startProcess;
    getStatus(): string;
    getOutput(): string;
    getError(): any;
    killProcess(): void;
}
