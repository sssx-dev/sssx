import { MultiBar, Presets, SingleBar } from 'cli-progress';
import type { Options } from 'cli-progress';

class Progress {
  private static instance?: Progress;
  private multibar: MultiBar;
  private bars: Record<string, SingleBar> = {};
  private lengths: Record<string, number> = {};

  constructor() {
    this.multibar = new MultiBar(
      {
        clearOnComplete: false,
        hideCursor: true
      },
      Presets.shades_grey
    );
  }

  static getInstance() {
    if (!Progress.instance) {
      Progress.instance = new Progress();
    }
    return Progress.instance;
  }

  createBar = (
    name: string,
    total: number,
    startValue: number,
    payload?: unknown,
    barOptions?: Options
  ) => {
    const bar = this.multibar.create(total, startValue, payload, barOptions);
    this.bars[name] = bar;
    this.lengths[name] = total;

    return bar;
  };

  getBar = (name: string) => this.bars[name];
  getBarLength = (name: string) => this.lengths[name];

  stop = () => this.multibar.stop();

  log = (data: string) => this.multibar.log(data);
}

export default Progress.getInstance();
