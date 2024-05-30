type spawnOptions = {
    captureStdio?: boolean;
    rejectOnExitCode?: boolean;
    stdio?: any;
    input?: string;
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
