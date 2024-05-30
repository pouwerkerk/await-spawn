/// <reference types="node" />
import { SpawnOptions } from "child_process";
interface AwaitSpawnOptions extends SpawnOptions {
    captureStdio?: boolean;
    rejectOnExitCode?: boolean;
    input?: string;
}
export declare function spawn(command: string, args?: string[], options?: AwaitSpawnOptions): Promise<unknown> & {
    process: any;
};
export default spawn;
export declare const verbose: (command: string, args?: string[], options?: AwaitSpawnOptions) => Promise<unknown> & {
    process: any;
};
export declare const stderr: (command: string, args?: string[], options?: AwaitSpawnOptions) => Promise<unknown> & {
    process: any;
};
export declare const silent: (command: string, args?: string[], options?: AwaitSpawnOptions) => Promise<unknown> & {
    process: any;
};
