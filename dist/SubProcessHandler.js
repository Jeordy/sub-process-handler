"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
class SubProcessHandler {
    constructor(command, args = [], options = {}) {
        this.process = null;
        this.isRunning = false;
        this.output = '';
        this.error = null;
        this.command = command;
        this.args = args;
        this.options = Object.assign({ detached: true, stdio: ['ignore', 'pipe'] }, options);
        this.startProcess();
    }
    startProcess() {
        var _a, _b;
        this.process = (0, child_process_1.spawn)(this.command, this.args, this.options);
        this.process.unref();
        // Track if the process is running
        this.isRunning = true;
        // Capture stdout and stderr
        (_a = this.process.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
            this.output += data.toString();
        });
        (_b = this.process.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
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
        if (this.getStatus() === 'Running' && this.process) {
            process.kill(this.process.pid);
            this.isRunning = false;
        }
    }
}
exports.default = SubProcessHandler;
