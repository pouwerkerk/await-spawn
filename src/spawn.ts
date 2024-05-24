import { spawn as spawn_native } from "child_process";
import { Stream } from "stream";

type spawnOptions = {
  captureStdio: boolean;
  rejectOnExitCode: boolean;
  stdio: any;
  input: string;
};

function spawn(command: string, args: any[], options: spawnOptions) {
  let child = null;
  let finishError = prepareFutureError(command, new ExitCodeError());
  return Object.assign(
    new Promise(function (resolve, reject) {
      const { captureStdio = true, rejectOnExitCode = true, stdio } = options;
      const captured = { stdout: "", stderr: "" };
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

      const start = new Date();

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

      child.on("close", function (exitCode) {
        const duration = new Date() - start;
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
    }),
    { process: child }
  );
}

module.exports = spawn;

module.exports.spawn = spawn;

module.exports.verbose = (
  command: string,
  args: any[],
  options: spawnOptions
) =>
  spawn(
    command,
    args,
    Object.assign({ stdio: ["ignore", "inherit", "inherit"] }, options)
  );

module.exports.verbose.stderr = (
  command: string,
  args: any[],
  options: spawnOptions
) =>
  spawn(
    command,
    args,
    Object.assign({ stdio: [0, process.stderr, process.stderr] }, options)
  );

module.exports.silent = (command: string, args: any[], options: spawnOptions) =>
  spawn(command, args, Object.assign({ stdio: "ignore" }, options));

type stringOrArr = string | any[];
function getNormalizedStdio(stdio: stringOrArr) {
  if (typeof stdio === "string") return [stdio, stdio, stdio];

  if (Array.isArray(stdio)) return [].concat(stdio);

  return ["pipe", "pipe", "pipe"];
}

// This weird roundabout way making an error is helpful because it preserves the stack
// trace from where the call to `spawn` happened rather than exposing the useless
// internals of how an thrown error via the `close` event gets made.
// Unfortunately it's kind of gross.

function prepareFutureError(command: string, error: ExitCodeError) {
  return function finishError(exitCode: string, result: Object) {
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
