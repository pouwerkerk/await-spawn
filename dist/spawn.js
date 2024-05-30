"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.silent = exports.stderr = exports.verbose = exports.spawn = void 0;
const child_process_1 = require("child_process");
const stream_1 = require("stream");
function spawn(command, args, options) {
    let child = null;
    let finishError = prepareFutureError(command, new ExitCodeError());
    return Object.assign(new Promise(function (resolve, reject) {
        const { captureStdio = true, rejectOnExitCode = true, stdio } = options;
        const captured = { stdout: "", stderr: "" };
        const input = typeof options.input === "string" &&
            stream_1.Stream.Readable.from([options.input], { objectMode: false });
        const normalizedStdio = getNormalizedStdio(stdio);
        const alteredStdio = Object.assign([], normalizedStdio, captureStdio && { 1: "pipe", 2: "pipe" }, input && { 0: "pipe" });
        const optionsWithAlteredStdio = Object.assign({}, options, {
            stdio: alteredStdio,
        });
        const start = Date.now();
        child = (0, child_process_1.spawn)(command, args, optionsWithAlteredStdio);
        if (captureStdio) {
            child.stdout.on("data", (aString) => (captured.stdout += aString + ""));
            child.stderr.on("data", (aString) => (captured.stderr += aString + ""));
            if (normalizedStdio[1] === "inherit")
                child.stdout.pipe(process.stdout);
            else if (normalizedStdio[1] instanceof stream_1.Stream)
                child.stdout.pipe(normalizedStdio[1]);
            if (normalizedStdio[2] === "inherit")
                child.stderr.pipe(process.stderr);
            else if (normalizedStdio[2] instanceof stream_1.Stream)
                child.stderr.pipe(normalizedStdio[2]);
        }
        if (input)
            input.pipe(child.stdin);
        child.on("close", function (exitCode) {
            const duration = Date.now() - start;
            const result = Object.assign({ exitCode, duration }, captureStdio && captured);
            if (exitCode !== 0 && rejectOnExitCode) {
                const error = finishError(exitCode, result);
                return reject(error);
            }
            resolve(result);
        });
    }), { process: child });
}
exports.spawn = spawn;
exports.default = spawn;
const verbose = (command, args, options) => spawn(command, args, Object.assign({ stdio: ["ignore", "inherit", "inherit"] }, options));
exports.verbose = verbose;
const stderr = (command, args, options) => spawn(command, args, Object.assign({ stdio: [0, process.stderr, process.stderr] }, options));
exports.stderr = stderr;
const silent = (command, args, options) => spawn(command, args, Object.assign({ stdio: "ignore" }, options));
exports.silent = silent;
function getNormalizedStdio(stdio) {
    if (typeof stdio === "string")
        return [stdio, stdio, stdio];
    if (Array.isArray(stdio))
        return [].concat(stdio);
    return ["pipe", "pipe", "pipe"];
}
// This weird roundabout way making an error is helpful because it preserves the stack
// trace from where the call to `spawn` happened rather than exposing the useless
// internals of how an thrown error via the `close` event gets made.
// Unfortunately it's kind of gross.
function prepareFutureError(command, error) {
    return function finishError(exitCode, result) {
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
function ExitCodeError() { }
ExitCodeError.prototype = Object.create(Error.prototype);
ExitCodeError.prototype.constructor = ExitCodeError;
