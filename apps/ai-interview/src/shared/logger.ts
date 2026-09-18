export const logger = {
  info: (msg: string, ...args: any[]) => {
    console.log(`\x1b[36m[AI-INTERVIEW]\x1b[0m ${msg}`, ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(`\x1b[33m[AI-INTERVIEW WARN]\x1b[0m ${msg}`, ...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.error(`\x1b[31m[AI-INTERVIEW ERROR]\x1b[0m ${msg}`, ...args);
  },
  success: (msg: string, ...args: any[]) => {
    console.log(`\x1b[32m[AI-INTERVIEW SUCCESS]\x1b[0m ${msg}`, ...args);
  },
  debug: (msg: string, ...args: any[]) => {
    if (process.env.DEBUG === "true" || process.env.NODE_ENV !== "production") {
      console.log(`\x1b[90m[AI-INTERVIEW DEBUG]\x1b[0m ${msg}`, ...args);
    }
  },
};
