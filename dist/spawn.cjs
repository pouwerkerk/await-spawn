var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/spawn.ts
var spawn_exports = {};
__export(spawn_exports, {
  default: () => spawn_default,
  silent: () => silent,
  spawn: () => spawn,
  stderr: () => stderr,
  verbose: () => verbose
});
module.exports = __toCommonJS(spawn_exports);
var import_node_child_process = require("child_process");
var import_node_stream = require("stream");
function spawn(command, args, options) {
  let child = null;
  const captured = { stdout: "", stderr: "" };
  let duration;
  let exitCode;
  let finishError = prepareFutureError(command, new ExitCodeError());
  return Object.assign(
    new Promise(function(resolve, reject) {
      const { captureStdio = true, rejectOnExitCode = true, stdio } = options;
      const input = typeof options.input === "string" && import_node_stream.Stream.Readable.from([options.input], { objectMode: false });
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
      child = (0, import_node_child_process.spawn)(command, args, optionsWithAlteredStdio);
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
        else if (normalizedStdio[1] instanceof import_node_stream.Stream)
          child.stdout.pipe(normalizedStdio[1]);
        if (normalizedStdio[2] === "inherit") child.stderr.pipe(process.stderr);
        else if (normalizedStdio[2] instanceof import_node_stream.Stream)
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  silent,
  spawn,
  stderr,
  verbose
});
