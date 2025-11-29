interface Logger {
  error: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  debug: (message: string, data?: unknown) => void;
}

const logger: Logger = {
  error: (message: string, data?: unknown) => {
    console.error(`[ERROR] ${message}`, data);
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data);
  },
  info: (message: string, data?: unknown) => {
    console.info(`[INFO] ${message}`, data);
  },
  debug: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
};

export default logger;