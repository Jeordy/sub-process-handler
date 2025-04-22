"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubProcessHandler = void 0;
const child_process_1 = require("child_process");
class SubProcessHandler {
    constructor(command, args = [], options = {}) {
        this.process = null;
        this.processId = null;
        this.isRunning = false;
        this.output = '';
        this.error = null;
        this.command = command;
        this.args = args;
        // Critical changes for process detachment to work properly
        this.options = Object.assign({ detached: true, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }, options);
        this.startProcess();
    }
    startProcess() {
        try {
            this.process = (0, child_process_1.spawn)(this.command, this.args, this.options);
            // Set process ID
            this.processId = this.process.pid || null;
            // Track if the process is running
            this.isRunning = true;
            // Ensure stdout and stderr exist before attaching listeners
            if (this.process.stdout) {
                this.process.stdout.on('data', (data) => {
                    const dataStr = data.toString();
                    this.output += dataStr;
                    // Optional: Log to console for debugging
                    console.log(`[STDOUT]: ${dataStr}`);
                });
            }
            if (this.process.stderr) {
                this.process.stderr.on('data', (data) => {
                    const dataStr = data.toString();
                    this.output += dataStr;
                    // Optional: Log to console for debugging
                    console.error(`[STDERR]: ${dataStr}`);
                });
            }
            // Handle process exit
            this.process.on('close', (code) => {
                this.isRunning = false;
                console.log(`Process exited with code ${code}`);
            });
            this.process.on('error', (err) => {
                this.isRunning = false;
                this.error = err;
                console.error(`Process error: ${err.message}`);
            });
            // Properly detach the process
            if (this.options.detached) {
                this.process.unref();
            }
        }
        catch (error) {
            console.error('Failed to start process:', error);
            this.error = error;
        }
    }
    getStatus() {
        if (this.process && this.isRunning) {
            try {
                // Attempt to send a signal to the process to check if it's still alive
                process.kill(this.process.pid, 0);
                return 'Running';
            }
            catch (_a) {
                return 'Not Running';
            }
        }
        return 'Not Running';
    }
    getOutput() {
        return this.output;
    }
    getError() {
        return this.error;
    }
    killProcess() {
        if (this.process && this.process.pid) {
            try {
                // On Windows, we need a different approach to kill a detached process
                if (process.platform === 'win32') {
                    // Kill process tree (may require additional logic for Windows)
                    (0, child_process_1.spawn)('taskkill', ['/pid', this.process.pid.toString(), '/f', '/t']);
                }
                else {
                    // On Unix-like systems, negative PID kills the process group
                    process.kill(-this.process.pid, 'SIGKILL');
                }
                this.isRunning = false;
            }
            catch (error) {
                console.error(`Failed to kill process: ${error}`);
            }
        }
    }
}
exports.SubProcessHandler = SubProcessHandler;
