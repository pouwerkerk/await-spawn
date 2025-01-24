import { SpawnOptions, ChildProcess } from 'node:child_process';

interface AwaitSpawnOptions extends SpawnOptions {
    captureStdio?: boolean;
    rejectOnExitCode?: boolean;
    input?: string;
}
interface AwaitSpawnResult {
    exitCode?: number;
    duration?: number;
    stdout?: string;
    stderr?: string;
}
interface AwaitSpawnProcess<AwaitSpawnResult> extends Promise<AwaitSpawnResult> {
    process: ChildProcess;
}
declare function spawn(command: string, args?: string[], options?: AwaitSpawnOptions): AwaitSpawnProcess<AwaitSpawnResult>;

declare const verbose: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<AwaitSpawnResult>;
declare const stderr: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<AwaitSpawnResult>;
declare const silent: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<AwaitSpawnResult>;

export { type AwaitSpawnOptions, type AwaitSpawnProcess, type AwaitSpawnResult, spawn as default, silent, spawn, stderr, verbose };
