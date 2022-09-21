import colors from 'ansi-colors';

export enum LogLevel {
  VERBOSE = 'VERBOSE',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

class Logger {
  private static instance?: Logger;
  private prefix = colors.blue('SSSX:');
  private _level: LogLevel;

  constructor() {
    this._level = LogLevel.INFO;
  }

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  set level(l: LogLevel) {
    this._level = l;
  }

  get level() {
    return this._level;
  }

  log = (...data: unknown[]) => {
    console.log(this.prefix, ...data);
  };

  info = this.log;

  verbose = (...data: unknown[]) => {
    console.log(this.prefix, ...data);
  };

  warn = (...data: unknown[]) => {
    console.warn(this.prefix, ...data);
  };

  error = (...data: unknown[]) => {
    console.error(this.prefix, ...data);
  };
}

export default Logger.getInstance();
