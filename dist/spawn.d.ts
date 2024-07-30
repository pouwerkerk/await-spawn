/// <reference types="node" />
import { SpawnOptions, ChildProcess } from "child_process";
export interface AwaitSpawnOptions extends SpawnOptions {
    captureStdio?: boolean;
    rejectOnExitCode?: boolean;
    input?: string;
}
export interface AwaitSpawnProcess<T> extends Promise<T> {
    exitCode?: number;
    duration?: number;
    stdout?: string;
    stderr?: string;
    process: ChildProcess;
}
export declare function spawn(command: string, args?: string[], options?: AwaitSpawnOptions): AwaitSpawnProcess<Object>;
export default spawn;
export declare const verbose: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<Object>;
export declare const stderr: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<Object>;
export declare const silent: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<Object>;
