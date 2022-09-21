import colors from 'ansi-colors';

class Logger {
  private static instance?: Logger;
  private prefix = colors.blue('SSSX:');

  constructor() {
    //
  }

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log = (message?: unknown, ...optionalParams: unknown[]) => {
    console.log(this.prefix, message, ...optionalParams);
  };
}

export default Logger.getInstance();
