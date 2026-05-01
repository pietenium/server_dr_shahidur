import chalk from "chalk";

const isDev = (): boolean => {
  const env = process.env.NODE_ENV;
  return env === "development" || env === "test";
};

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  info: (...args: unknown[]): void => {
    if (isDev()) {
      console.info(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (isDev()) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    if (isDev()) {
      console.error(...args);
    }
  },
  debug: (...args: unknown[]): void => {
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.debug(chalk.gray("[debug]"), ...args);
    }
  },
} as const;
