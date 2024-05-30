declare const spawn_native: any;
declare const Stream: any;
declare function spawn(command: any, args: any, options?: {}): Promise<unknown> & {
    process: any;
};
declare function getNormalizedStdio(stdio: any): any[];
declare function prepareFutureError(command: any, error: any): (exitCode: any, result: any) => any;
declare function ExitCodeError(): void;
declare namespace ExitCodeError {
    var prototype: any;
}
