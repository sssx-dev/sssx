/** High-resolution timer for measuring build performance */
export class Timer {
  private start: bigint;
  private label: string;

  constructor(label: string = "") {
    this.label = label;
    this.start = process.hrtime.bigint();
  }

  /** Returns elapsed time in milliseconds */
  elapsed(): number {
    const end = process.hrtime.bigint();
    return Number(end - this.start) / 1_000_000;
  }

  /** Returns formatted elapsed time string */
  format(): string {
    const ms = this.elapsed();
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(2)}s`;
    const mins = Math.floor(ms / 60_000);
    const secs = ((ms % 60_000) / 1000).toFixed(1);
    return `${mins}m ${secs}s`;
  }

  /** Log elapsed time with label */
  log(): void {
    console.log(`${this.label ? `${this.label}: ` : ""}${this.format()}`);
  }

  /** Reset the timer */
  reset(): void {
    this.start = process.hrtime.bigint();
  }
}
