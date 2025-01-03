import { ChildProcess, SpawnOptions } from 'child_process';
export default class SubProcessHandler {
    private command;
    private args;
    private options;
    process: ChildProcess | null;
    private isRunning;
    private output;
    private error;
    constructor(command: string, args?: string[], options?: SpawnOptions);
    private startProcess;
    getStatus(): string;
    getOutput(): string;
    getError(): any;
    killProcess(): void;
}
