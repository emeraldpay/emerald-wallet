/**
 * A handler that buffers incoming data and flushes it to the handler when the buffer is full or a certain time has passed.
 */
export class BufferedHandler<T> {

  /**
   * The maximum size of the buffer before it is flushed.
   * @private
   */
  private readonly limitSize: number = 100;

  /**
   * The maximum time in milliseconds before the buffer is flushed.
   * @private
   */
  private readonly limitTimeMs: number = 250;
  /**
   * The handler that is called when the buffer is flushed.
   * @private
   */
  private readonly handler: (values: T[]) => Promise<void>;

  private buffer: T[] = [];
  private closed = false;
  private lastFlush = Date.now();

  constructor(handler: (values: T[]) => Promise<void>, limitSize?: number, limitTimeMs?: number) {
    this.handler = handler;
    if (limitSize != null) {
      this.limitSize = limitSize;
    }
    if (limitTimeMs != null) {
      this.limitTimeMs = limitTimeMs;
    }
  }

  start() {
    this.scheduleNext();
  }

  private scheduleNext() {
    setTimeout(() => {
      if (this.lastFlush + this.limitTimeMs >= Date.now()) {
        this.flush();
      }
      if (!this.closed) {
        this.scheduleNext();
      }
    }, this.limitTimeMs - (Date.now() - this.lastFlush));
  }

  accept(): (tx: T) => void {
    return (tx) => this.onData(tx);
  }

  onData(tx: T): void {
    this.buffer.push(tx);
    if (this.buffer.length >= this.limitSize) {
      this.flush();
    }
  }

  flush(): void {
    if (this.buffer.length > 0) {
      this.handler(this.buffer)
        .catch((e) => console.error('Error while handling buffer', e));
    }
    this.buffer = [];
    this.lastFlush = Date.now();
  }

  close() {
    this.flush();
    this.closed = true;
  }
}
