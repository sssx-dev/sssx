import colors from 'chalk';

export enum LogLevel {
  SILENT = 'SILENT',
  VERBOSE = 'VERBOSE',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

class Logger {
  private static instance?: Logger;
  private prefix = 'SSSX:';
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
    this.level != LogLevel.SILENT &&
      (this.level == LogLevel.INFO ||
        this.level == LogLevel.VERBOSE ||
        this.level == LogLevel.DEBUG) &&
      console.log(colors.bgBlue.whiteBright(this.prefix), ...data);
  };

  info = this.log;

  verbose = (...data: unknown[]) => {
    this.level === LogLevel.VERBOSE &&
      console.log(colors.bgBlack.whiteBright(this.prefix), ...data);
  };

  debug = (...data: unknown[]) => {
    this.level === LogLevel.DEBUG && console.log(colors.bgBlack.whiteBright(this.prefix), ...data);
  };

  warn = (...data: unknown[]) => {
    this.level != LogLevel.SILENT && console.warn(colors.bgYellow.black(this.prefix), ...data);
  };

  error = (...data: unknown[]) => {
    this.level != LogLevel.SILENT && console.error(colors.bgRed.whiteBright(this.prefix), ...data);
  };
}

export default Logger.getInstance();
