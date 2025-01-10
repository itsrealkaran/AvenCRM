import chalk from "chalk";
import debug from "debug";
import { format } from "date-fns";

const log = {
  info: debug("api:info"),
  error: debug("api:error"),
  warn: debug("api:warn"),
  debug: debug("api:debug"),
};

// Helper function to generate a timestamp
const getTimestamp = () => chalk.gray(`[${format(new Date(), "yyyy-MM-dd HH:mm:ss")}]`);

// Icons for log levels
const icons = {
  info: chalk.blue("ℹ️"),
  error: chalk.red("❌"),
  warn: chalk.yellow("⚠️"),
  debug: chalk.magenta("🐛"),
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    const formattedMessage = `${getTimestamp()} ${icons.info} ${chalk.greenBright("INFO")} ${message}`;
    log.info(formattedMessage, ...args);
    console.log(formattedMessage, ...args);
  },
  error: (message: string, ...args: any[]) => {
    const formattedMessage = `${getTimestamp()} ${icons.error} ${chalk.redBright("ERROR")} ${message}`;
    log.error(formattedMessage, ...args);
    console.error(formattedMessage, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    const formattedMessage = `${getTimestamp()} ${icons.warn} ${chalk.yellowBright("WARN")} ${message}`;
    log.warn(formattedMessage, ...args);
    console.warn(formattedMessage, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    const formattedMessage = `${getTimestamp()} ${icons.debug} ${chalk.magentaBright("DEBUG")} ${message}`;
    log.debug(formattedMessage, ...args);
    console.debug(formattedMessage, ...args);
  },
  table: (label: string, data: Record<string, any>) => {
    const formattedLabel = `${getTimestamp()} ${chalk.cyanBright(label)}`;
    console.log(formattedLabel);
    console.table(data);
  },
};

export default logger;
