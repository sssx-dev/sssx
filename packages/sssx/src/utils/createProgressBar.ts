import colors from "ansi-colors";
import cliProgress from "cli-progress";

const barCompleteChar = "\u2588";
const barIncompleteChar = "\u2591";

export const createProgressBar = () =>
  new cliProgress.SingleBar({
    format:
      "SSSX |" +
      colors.cyan("{bar}") +
      "| {percentage}% | {duration_formatted} | {eta_formatted} left | URL: {url} | Total: {total}",
    barCompleteChar,
    barIncompleteChar,
    hideCursor: true,
  });
