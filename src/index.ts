interface Timer {
  interval: number;
  lastExecutionTime: number;
}

function runInWorker(interval: number) {
  const timers = new Map<MessagePort, Timer>();
  setInterval(() => {
    const currentTime = Date.now();
    timers.forEach((timer, port) => {
      if (currentTime - timer.lastExecutionTime >= timer.interval) {
        port.postMessage({ currentTime });
        timer.lastExecutionTime = currentTime;
      }
    });
  }, interval);
  self.onmessage = (event) => {
    const port = event.ports[0];
    timers.set(port, { interval: event.data, lastExecutionTime: Date.now() });
    port.onmessage = () => timers.delete(port);
  };
}

export default function createWorkerInterval(interval: number = 10) {
  const blob = new Blob([`(${runInWorker})(${interval})`], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  return {
    terminate: () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    },
    setInterval: (callback: (...args: any[]) => void, interval: number, ...args: any[]) => {
      const { port1, port2 } = new MessageChannel();
      worker.postMessage(interval, [port1]);
      port2.onmessage = () => callback(...args);
      return port2;
    },
    clearInterval: (port: MessagePort) => {
      port.postMessage(null);
    }
  };
}