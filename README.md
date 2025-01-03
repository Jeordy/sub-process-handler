# SubProcessHandler

**SubProcessHandler** is a utility for managing subprocesses in Node.js with enhanced control over detached processes, capturing output, and monitoring process status.

---

## Installation

Install the package via npm:

```bash
npm install sub-process-handler
```

### Features

•	Manage subprocesses with ease.
•	Capture and access process output (stdout and stderr).
•	Monitor the status of running processes.
•	Kill processes when needed.
•	Built-in support for detached processes.


**Methods**

getStatus(): string

Returns the current status of the subprocess: 'Running' or 'Not Running'.

getOutput(): string

Returns the accumulated stdout and stderr output from the subprocess.

getError(): any

Returns any error encountered during the lifecycle of the subprocess.

killProcess(): void

Kills the subprocess if it’s running.


### API Reference

Constructor:

```javascript
new SubProcessHandler(command: string, args: string[] = [], options: SpawnOptions = {})
```

•	command: The command to run (e.g., ls, node, etc.).
•	args: Array of arguments to pass to the command.
•	options: Optional. Configuration for the subprocess (e.g., detached, stdio settings). Default options:

```json
{
detached: true,
stdio: ['ignore', 'pipe']
}
```

#### Usage

Basic example:

```javascript
const SubProcessHandler = require('sub-process-handler');
// Initialize a subprocess
const handler = new SubProcessHandler('ls', ['-l']);

// Check process status
console.log('Status:', handler.getStatus()); // Output: 'Running' or 'Not Running'

// Get the output of the process
setTimeout(() => {
console.log('Output:', handler.getOutput());
}, 1000);

// Kill the process if necessary
handler.killProcess();
```

Running a Script:

```javascript
const handler = new SubProcessHandler('node', ['/path/to/script.js']);
console.log('Status:', handler.getStatus());
```

Monitoring a Long-Running Process

```javascript
const handler = new SubProcessHandler('ping', ['-c', '4', 'google.com']);

setTimeout(() => {
console.log('Output so far:', handler.getOutput());
}, 2000);

setTimeout(() => {
handler.killProcess();
console.log('Process killed. Final Output:', handler.getOutput());
}, 5000);
```
