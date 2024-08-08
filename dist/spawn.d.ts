/// <reference types="node" />
import { SpawnOptions, ChildProcess } from "child_process";
export interface AwaitSpawnOptions extends SpawnOptions {
    captureStdio?: boolean;
    rejectOnExitCode?: boolean;
    input?: string;
}
export interface AwaitSpawnResult {
    exitCode?: number;
    duration?: number;
    stdout?: string;
    stderr?: string;
}
export interface AwaitSpawnProcess<AwaitSpawnResult> extends Promise<AwaitSpawnResult> {
    process: ChildProcess;
}
export declare function spawn(command: string, args?: string[], options?: AwaitSpawnOptions): AwaitSpawnProcess<AwaitSpawnResult>;
export default spawn;
export declare const verbose: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<AwaitSpawnResult>;
export declare const stderr: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<AwaitSpawnResult>;
export declare const silent: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<AwaitSpawnResult>;
