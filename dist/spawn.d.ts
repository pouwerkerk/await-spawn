/// <reference types="node" />
import { SpawnOptions, ChildProcess } from "child_process";
interface AwaitSpawnOptions extends SpawnOptions {
    captureStdio?: boolean;
    rejectOnExitCode?: boolean;
    input?: string;
}
interface AwaitSpawnProcess<T> extends Promise<T> {
    process: ChildProcess;
}
export declare function spawn(command: string, args?: string[], options?: AwaitSpawnOptions): AwaitSpawnProcess<unknown>;
export default spawn;
export declare const verbose: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<unknown>;
export declare const stderr: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<unknown>;
export declare const silent: (command: string, args?: string[], options?: AwaitSpawnOptions) => AwaitSpawnProcess<unknown>;
