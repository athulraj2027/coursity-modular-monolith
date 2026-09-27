type LogLevel = "debug" | "info" | "warn" | "error" | "success";

const COLOR_MAP = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

class Logger {
  private formatPrefix(level: LogLevel): string {
    const timestamp = new Date().toISOString().substring(11, 19);
    switch (level) {
      case "debug":
        return `${COLOR_MAP.gray}[${timestamp}] [DEBUG]${COLOR_MAP.reset}`;
      case "info":
        return `${COLOR_MAP.cyan}[${timestamp}] [INFO]${COLOR_MAP.reset}`;
      case "warn":
        return `${COLOR_MAP.yellow}[${timestamp}] [WARN]${COLOR_MAP.reset}`;
      case "error":
        return `${COLOR_MAP.red}[${timestamp}] [ERROR]${COLOR_MAP.reset}`;
      case "success":
        return `${COLOR_MAP.green}[${timestamp}] [SUCCESS]${COLOR_MAP.reset}`;
    }
  }

  public debug(message: string, ...meta: unknown[]): void {
    if (process.env.NODE_ENV !== "production") {
      console.log(`${this.formatPrefix("debug")} ${message}`, ...meta);
    }
  }

  public info(message: string, ...meta: unknown[]): void {
    console.log(`${this.formatPrefix("info")} ${message}`, ...meta);
  }

  public warn(message: string, ...meta: unknown[]): void {
    console.warn(`${this.formatPrefix("warn")} ${message}`, ...meta);
  }

  public error(message: string, ...meta: unknown[]): void {
    console.error(`${this.formatPrefix("error")} ${message}`, ...meta);
  }

  public success(message: string, ...meta: unknown[]): void {
    console.log(`${this.formatPrefix("success")} ${message}`, ...meta);
  }
}

export const logger = new Logger();
