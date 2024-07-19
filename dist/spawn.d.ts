/// <reference types="node" />
import { SpawnOptions, ChildProcess } from "child_process";
interface AwaitSpawnOptions extends SpawnOptions {
    captureStdio?: boolean;
    rejectOnExitCode?: boolean;
    input?: string;
}
export declare function spawn(command: string, args?: string[], options?: AwaitSpawnOptions): {
    process: ChildProcess;
} & {
    [key: string]: any;
};
export default spawn;
export declare const verbose: (command: string, args?: string[], options?: AwaitSpawnOptions) => {
    process: ChildProcess;
} & {
    [key: string]: any;
};
export declare const stderr: (command: string, args?: string[], options?: AwaitSpawnOptions) => {
    process: ChildProcess;
} & {
    [key: string]: any;
};
export declare const silent: (command: string, args?: string[], options?: AwaitSpawnOptions) => {
    process: ChildProcess;
} & {
    [key: string]: any;
};
