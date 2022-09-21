import colors from 'ansi-colors';

class Logger {
  private static instance?: Logger;

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
    console.log(colors.blue('SSSX:'), message, ...optionalParams);
  };
}

export default Logger.getInstance();
