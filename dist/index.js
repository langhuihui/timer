"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function runInWorker(interval) {
    var timers = new Map();
    setInterval(function () {
        var currentTime = Date.now();
        timers.forEach(function (timer, port) {
            if (currentTime - timer.lastExecutionTime >= timer.interval) {
                port.postMessage({ currentTime: currentTime });
                timer.lastExecutionTime = currentTime;
            }
        });
    }, interval);
    self.onmessage = function (event) {
        var port = event.ports[0];
        timers.set(port, { interval: event.data, lastExecutionTime: Date.now() });
        port.onmessage = function () { return timers.delete(port); };
    };
}
function createWorkerInterval(interval) {
    if (interval === void 0) { interval = 10; }
    var blob = new Blob(["(".concat(runInWorker, ")(").concat(interval, ")")], { type: 'application/javascript' });
    var url = URL.createObjectURL(blob);
    var worker = new Worker(url);
    return {
        terminate: function () {
            worker.terminate();
            URL.revokeObjectURL(url);
        },
        setInterval: function (interval) {
            var port = new MessageChannel().port1;
            worker.postMessage(interval, [port]);
            return port;
        },
        clearInterval: function (port) {
            port.postMessage(null);
        }
    };
}
exports.default = createWorkerInterval;
