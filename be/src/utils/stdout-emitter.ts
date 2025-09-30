import { EventEmitter } from "node:events";

export class StdoutEmitter extends EventEmitter {
  constructor() {
    super();
    const originalWrite = process.stdout.write.bind(process.stdout);

    process.stdout.write = ((chunk, encoding, cb) => {
      this.emit("data", chunk.toString());
      return originalWrite(chunk, encoding, cb);
    }) as typeof process.stdout.write;
  }
}
