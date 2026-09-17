const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`${colors.cyan}[AI-INTERVIEW]${colors.reset} ${message}`, ...args);
  },
  success: (message: string, ...args: any[]) => {
    console.log(`${colors.green}[AI-INTERVIEW SUCCESS]${colors.reset} ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`${colors.yellow}[AI-INTERVIEW WARN]${colors.reset} ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`${colors.red}[AI-INTERVIEW ERROR]${colors.reset} ${message}`, ...args);
  },
};
