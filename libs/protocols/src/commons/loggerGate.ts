type LogLevel = "log" | "warn" | "error";

interface LoggerConfig {
  enabled: boolean;
  levels: {
    log: boolean;
    warn: boolean;
    error: boolean;
  };
  prefix?: string;
  timestamp?: boolean;
}

class LoggerGate {
  private static STORAGE_KEY = "custom_logger_config";

  private config: LoggerConfig = {
    enabled: true,
    levels: {
      log: true,
      warn: true,
      error: true,
    },
    prefix: "",
    timestamp: false,
  };
  private isNode: boolean;

  constructor() {
    this.isNode = typeof window === "undefined";
    if (!this.isNode) {
      this.loadConfig();
      this.attachToWindow();
    } else {
      this.showNodeInitialization();
    }
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(LoggerGate.STORAGE_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Failed to load logger config:", error);
    }
  }

  private saveConfig(): void {
    if (this.isNode) return;
    try {
      localStorage.setItem(LoggerGate.STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error("Failed to save logger config:", error);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && this.config.levels[level];
  }

  get canLog(): boolean {
    return this.shouldLog("log");
  }

  get canWarn(): boolean {
    return this.shouldLog("warn");
  }

  get canError(): boolean {
    return this.shouldLog("error");
  }

  enable(): void {
    this.config.enabled = true;
    this.saveConfig();
  }

  disable(): void {
    this.config.enabled = false;
    this.saveConfig();
  }

  toggle(): boolean {
    this.config.enabled = !this.config.enabled;
    this.saveConfig();
    return this.config.enabled;
  }

  setLevel(level: LogLevel | "none" | string): void {
    if (level === "none") {
      this.config.levels = {
        log: false,
        warn: false,
        error: false,
      };
    }
    if (level === "log") {
      this.config.levels = {
        log: true,
        warn: true,
        error: true,
      };
    }
    if (level === "warn") {
      this.config.levels = {
        log: false,
        warn: true,
        error: true,
      };
    }
    if (level === "error") {
      this.config.levels = {
        log: false,
        warn: false,
        error: true,
      };
    }
    this.saveConfig();
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  reset(): void {
    this.config = {
      enabled: true,
      levels: {
        log: true,
        warn: true,
        error: true,
      },
      prefix: "",
      timestamp: false,
    };
    this.saveConfig();
  }

  // Public methods for Node.js usage
  public showHelp(): void {
    console.log("Logger Gate Help");
    console.log("================");
    console.log("Available methods:");
    console.log(
      "  loggerGate.setLevel(level)  - Enable set logging level to ('log', 'warn', 'error') or 'none' to disable all",
    );
    console.log("  loggerGate.status()            - Show current status");
    console.log("  loggerGate.showHelp()          - Show this help");
    if (!this.isNode) {
      console.log("");
      console.log("Configuration is persisted in localStorage");
    }
  }

  public showStatusIfDev(): void {
    if (
      // biome-ignore lint/suspicious/noExplicitAny: Please, let me
      (window as any).location?.hostname === "localhost" ||
      // biome-ignore lint/suspicious/noExplicitAny: Please, let me
      (window as any).location?.hostname === "127.0.0.1"
    ) {
      console.log(
        "Logger Gate initialiazed. Use window.logger.help() to see available commands",
      );
      this.showStatus();
    }
  }

  private showNodeInitialization(): void {
    this.showStatus();
  }

  private showStatus(): void {
    const config = this.getConfig();
    const enabledLevel = (["log", "warn", "error"] as const).find(
      (level) => config.levels[level],
    );

    console.log(
      `Logger Gate Status: ${config.enabled ? "ENABLED" : "DISABLED"} | Active level: ${enabledLevel || "none"}`,
    );
  }

  private attachToWindow(): void {
    if (typeof window !== "undefined") {
      // biome-ignore lint/suspicious/noExplicitAny: Please, let me
      (window as any).logger = {
        enable: () => this.enable(),
        disable: () => this.disable(),
        toggle: () => this.toggle(),
        status: () => this.status(),
        help: () => this.showHelp(),
      };
    }
  }

  status(): void {
    this.showStatus();
  }
}

export const loggerGate = new LoggerGate();
