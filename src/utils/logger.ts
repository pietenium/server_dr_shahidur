import chalk from "chalk";

const isDev = (): boolean => {
  const env = process.env.NODE_ENV;
  return env === "development" || env === "test";
};

const sanitizeLogString = (value: string): string => value.replace(/[\r\n]+/g, " ");

const sanitizeLogArg = (arg: unknown): unknown => {
  if (typeof arg === "string") {
    return sanitizeLogString(arg);
  }

  if (arg instanceof Error) {
    return arg;
  }

  if (Array.isArray(arg)) {
    return arg.map((item) => sanitizeLogArg(item));
  }

  if (arg && typeof arg === "object") {
    const sanitized: Record<string, unknown> = {};
    Object.entries(arg as Record<string, unknown>).forEach(([key, value]) => {
      sanitized[key] = sanitizeLogArg(value);
    });
    return sanitized;
  }

  return arg;
};

const sanitizeLogArgs = (args: unknown[]): unknown[] => args.map((arg) => sanitizeLogArg(arg));


export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev()) {
      const safeArgs = sanitizeLogArgs(args);
      // eslint-disable-next-line no-console
      console.log(...safeArgs);
    }
  },
  info: (...args: unknown[]): void => {
    if (isDev()) {
      const safeArgs = sanitizeLogArgs(args);
      console.info(...safeArgs);
    }
  },
  warn: (...args: unknown[]): void => {
    // Always log warnings
    const safeArgs = sanitizeLogArgs(args);
    console.warn(...safeArgs);
  },
  error: (...args: unknown[]): void => {
    // Always log errors, even in production
    const safeArgs = sanitizeLogArgs(args);
    console.error(...safeArgs);
  },
  debug: (...args: unknown[]): void => {
    if (isDev()) {
      const safeArgs = sanitizeLogArgs(args);
      // eslint-disable-next-line no-console
      console.debug(chalk.gray("[debug]"), ...safeArgs);
    }
  },
} as const;
