
# Getting Started
```
npm install wtimer
```

# Example
```ts
import createInterval from 'wtimer';

// init
const wtimer = createInterval(10); // 10ms interval in worker

// set interval
const p = wtimer.setInterval(() => {
  console.log('Hello World');
}, 1000);
// clear interval
wtimer.clearInterval(p);

// clear all interval
wtimer.terminate();