/// <reference types="node" />
type spawnOptions = {
    captureStdio?: boolean;
    rejectOnExitCode?: boolean;
    stdio?: stringOrArr;
    input?: string;
    cwd?: string;
    env?: object;
    argv0?: string;
    detached?: boolean;
    uid?: number;
    gid?: number;
    serialization?: string;
    shell?: boolean | string;
    windowsVerbatimArguments?: boolean;
    windowsHide?: boolean;
    signal?: NodeJS.Signals;
    timeout?: number;
    killSignal?: string | number;
};
export declare function spawn(command: string, args?: string[], options?: spawnOptions): Promise<unknown> & {
    process: any;
};
export default spawn;
export declare const verbose: (command: string, args?: string[], options?: spawnOptions) => Promise<unknown> & {
    process: any;
};
export declare const stderr: (command: string, args?: string[], options?: spawnOptions) => Promise<unknown> & {
    process: any;
};
export declare const silent: (command: string, args?: string[], options?: spawnOptions) => Promise<unknown> & {
    process: any;
};
type stringOrArr = string | string[];
