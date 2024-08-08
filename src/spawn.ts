import {
  spawn as spawn_native,
  SpawnOptions,
  StdioOptions,
  ChildProcess,
} from "node:child_process";

import { Stream } from "node:stream";

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
export interface AwaitSpawnProcess<AwaitSpawnResult>
  extends Promise<AwaitSpawnResult> {
  process: ChildProcess;
}

export function spawn(
  command: string,
  args?: string[],
  options?: AwaitSpawnOptions
): AwaitSpawnProcess<AwaitSpawnResult> {
  let child = null;
  const captured = { stdout: "", stderr: "" };
  let duration;
  let exitCode;

  let finishError = prepareFutureError(command, new ExitCodeError());
  return Object.assign(
    new Promise(function (resolve, reject) {
      const { captureStdio = true, rejectOnExitCode = true, stdio } = options;

      const input =
        typeof options.input === "string" &&
        Stream.Readable.from([options.input], { objectMode: false });

      const normalizedStdio = getNormalizedStdio(stdio);
      const alteredStdio = Object.assign(
        [],
        normalizedStdio,
        captureStdio && { 1: "pipe", 2: "pipe" },
        input && { 0: "pipe" }
      );
      const optionsWithAlteredStdio = Object.assign({}, options, {
        stdio: alteredStdio,
      });

      const start = Date.now();

      child = spawn_native(command, args, optionsWithAlteredStdio);

      if (captureStdio) {
        child.stdout.on(
          "data",
          (aString: string) => (captured.stdout += aString + "")
        );
        child.stderr.on(
          "data",
          (aString: string) => (captured.stderr += aString + "")
        );

        if (normalizedStdio[1] === "inherit") child.stdout.pipe(process.stdout);
        else if (normalizedStdio[1] instanceof Stream)
          child.stdout.pipe(normalizedStdio[1]);

        if (normalizedStdio[2] === "inherit") child.stderr.pipe(process.stderr);
        else if (normalizedStdio[2] instanceof Stream)
          child.stderr.pipe(normalizedStdio[2]);
      }

      if (input) input.pipe(child.stdin);

      child.on("close", function (exitCode: number) {
        duration = Date.now() - start;
        const result = Object.assign(
          { exitCode, duration },
          captureStdio && captured
        );

        if (exitCode !== 0 && rejectOnExitCode) {
          const error = finishError(exitCode, result);
          return reject(error);
        }

        resolve(result);
      });

      child.on("error", reject);
    }),
    {
      process: child,
      exitCode,
      duration,
      stdout: captured.stdout,
      stderr: captured.stderr,
    }
  );
}

export default spawn;

export const verbose = (
  command: string,
  args?: string[],
  options?: AwaitSpawnOptions
) =>
  spawn(
    command,
    args,
    Object.assign({ stdio: ["ignore", "inherit", "inherit"] }, options)
  );

export const stderr = (
  command: string,
  args?: string[],
  options?: AwaitSpawnOptions
) =>
  spawn(
    command,
    args,
    Object.assign({ stdio: [0, process.stderr, process.stderr] }, options)
  );

export const silent = (
  command: string,
  args?: string[],
  options?: AwaitSpawnOptions
) => spawn(command, args, Object.assign({ stdio: "ignore" }, options));

function getNormalizedStdio(stdio: StdioOptions) {
  if (typeof stdio === "string") return [stdio, stdio, stdio];

  if (Array.isArray(stdio)) return [].concat(stdio);

  return ["pipe", "pipe", "pipe"];
}

// This weird roundabout way making an error is helpful because it preserves the stack
// trace from where the call to `spawn` happened rather than exposing the useless
// internals of how an thrown error via the `close` event gets made.
// Unfortunately it's kind of gross.
function prepareFutureError(command: string, error: ExitCodeError): Function {
  return function finishError(exitCode: string, result: Object): ExitCodeError {
    error.message = `Process "${command}" exited with status: ${exitCode}`;

    Object.defineProperty(error, "name", {
      value: "ExitCodeError",
      writable: true,
      enumerable: false,
      configurable: true,
    });
    error.command = command;
    error.exitCode = exitCode;
    Object.assign(error, result);
    Object.setPrototypeOf(error, ExitCodeError.prototype);

    return error;
  };
}

interface ExitCodeError extends Error {
  command: string;
  exitCode: string;
}

function ExitCodeError() {}

ExitCodeError.prototype = Object.create(Error.prototype);
ExitCodeError.prototype.constructor = ExitCodeError;
