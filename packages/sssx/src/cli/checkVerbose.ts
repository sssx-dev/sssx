import Logger, { LogLevel } from '@sssx/logger';

export const checkVerbose = (args: Record<string, never>) => {
  if (args.verbose) {
    Logger.level = LogLevel.VERBOSE;
  }
};
