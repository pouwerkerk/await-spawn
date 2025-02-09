// src/spawn.ts
import {
  spawn as spawn_native
} from "node:child_process";
import { Stream } from "node:stream";
function spawn(command, args, options) {
  let child = null;
  const captured = { stdout: "", stderr: "" };
  let duration;
  let exitCode;
  let finishError = prepareFutureError(command, new ExitCodeError());
  return Object.assign(
    new Promise(function(resolve, reject) {
      const { captureStdio = true, rejectOnExitCode = true, stdio } = options;
      const input = typeof options.input === "string" && Stream.Readable.from([options.input], { objectMode: false });
      const normalizedStdio = getNormalizedStdio(stdio);
      const alteredStdio = Object.assign(
        [],
        normalizedStdio,
        captureStdio && { 1: "pipe", 2: "pipe" },
        input && { 0: "pipe" }
      );
      const optionsWithAlteredStdio = Object.assign({}, options, {
        stdio: alteredStdio
      });
      const start = Date.now();
      child = spawn_native(command, args, optionsWithAlteredStdio);
      if (captureStdio) {
        child.stdout.on(
          "data",
          (aString) => captured.stdout += aString + ""
        );
        child.stderr.on(
          "data",
          (aString) => captured.stderr += aString + ""
        );
        if (normalizedStdio[1] === "inherit") child.stdout.pipe(process.stdout);
        else if (normalizedStdio[1] instanceof Stream)
          child.stdout.pipe(normalizedStdio[1]);
        if (normalizedStdio[2] === "inherit") child.stderr.pipe(process.stderr);
        else if (normalizedStdio[2] instanceof Stream)
          child.stderr.pipe(normalizedStdio[2]);
      }
      if (input) input.pipe(child.stdin);
      child.on("close", function(exitCode2) {
        duration = Date.now() - start;
        const result = Object.assign(
          { exitCode: exitCode2, duration },
          captureStdio && captured
        );
        if (exitCode2 !== 0 && rejectOnExitCode) {
          const error = finishError(exitCode2, result);
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
      stderr: captured.stderr
    }
  );
}
var spawn_default = spawn;
var verbose = (command, args, options) => spawn(
  command,
  args,
  Object.assign({ stdio: ["ignore", "inherit", "inherit"] }, options)
);
var stderr = (command, args, options) => spawn(
  command,
  args,
  Object.assign({ stdio: [0, process.stderr, process.stderr] }, options)
);
var silent = (command, args, options) => spawn(command, args, Object.assign({ stdio: "ignore" }, options));
function getNormalizedStdio(stdio) {
  if (typeof stdio === "string") return [stdio, stdio, stdio];
  if (Array.isArray(stdio)) return [].concat(stdio);
  return ["pipe", "pipe", "pipe"];
}
function prepareFutureError(command, error) {
  return function finishError(exitCode, result) {
    error.message = `Process "${command}" exited with status: ${exitCode}`;
    Object.defineProperty(error, "name", {
      value: "ExitCodeError",
      writable: true,
      enumerable: false,
      configurable: true
    });
    error.command = command;
    error.exitCode = exitCode;
    Object.assign(error, result);
    Object.setPrototypeOf(error, ExitCodeError.prototype);
    return error;
  };
}
function ExitCodeError() {
}
ExitCodeError.prototype = Object.create(Error.prototype);
ExitCodeError.prototype.constructor = ExitCodeError;
export {
  spawn_default as default,
  silent,
  spawn,
  stderr,
  verbose
};
