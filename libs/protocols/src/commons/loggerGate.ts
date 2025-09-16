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

  enableLevel(level: LogLevel): void {
    this.config.levels[level] = true;
    this.saveConfig();
  }

  disableLevel(level: LogLevel): void {
    this.config.levels[level] = false;
    this.saveConfig();
  }

  toggleLevel(level: LogLevel): boolean {
    this.config.levels[level] = !this.config.levels[level];
    this.saveConfig();
    return this.config.levels[level];
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<LoggerConfig>): void {
    if (this.isNode) return;
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  reset(): void {
    if (this.isNode) return;
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

  private attachToWindow(): void {
    if (typeof window !== "undefined") {
      // biome-ignore lint/suspicious/noExplicitAny: Please, let me
      (window as any).logger = {
        enable: () => this.enable(),
        disable: () => this.disable(),
        toggle: () => this.toggle(),
        enableLevel: (level: LogLevel) => this.enableLevel(level),
        disableLevel: (level: LogLevel) => this.disableLevel(level),
        toggleLevel: (level: LogLevel) => this.toggleLevel(level),
        getConfig: () => this.getConfig(),
        setConfig: (config: Partial<LoggerConfig>) => this.setConfig(config),
        reset: () => this.reset(),
        enableAll: () => {
          this.enable();
          Object.keys(this.config.levels).forEach((level) => {
            this.enableLevel(level as LogLevel);
          });
        },
        disableAll: () => {
          this.disable();
        },
        status: () => {
          const config = this.getConfig();
          console.table({
            "Logger Enabled": config.enabled,
            "Log (includes info/debug)": config.levels.log,
            Warn: config.levels.warn,
            Error: config.levels.error,
            Prefix: config.prefix || "(none)",
            Timestamp: config.timestamp,
          });
        },
        help: () => {
          console.log(
            "%cLogger Gate Help",
            "color: #4a90e2; font-size: 16px; font-weight: bold",
          );
          console.log(
            "%cAvailable commands:",
            "color: #7cb342; font-weight: bold",
          );
          console.log(
            "  window.logger.enable()            - Enable all logging",
          );
          console.log(
            "  window.logger.disable()           - Disable all logging",
          );
          console.log(
            "  window.logger.toggle()            - Toggle logging on/off (returns new state)",
          );
          console.log(
            "  window.logger.enableLevel(level)  - Enable specific level ('log', 'warn', 'error')",
          );
          console.log(
            "  window.logger.disableLevel(level) - Disable specific level",
          );
          console.log(
            "  window.logger.toggleLevel(level)  - Toggle specific level (returns new state)",
          );
          console.log(
            "  window.logger.getConfig()         - Get current configuration object",
          );
          console.log(
            "  window.logger.setConfig(config)   - Set partial configuration",
          );
          console.log(
            "                                       { enabled, levels, prefix, timestamp }",
          );
          console.log(
            "  window.logger.reset()             - Reset to default settings",
          );
          console.log(
            "  window.logger.enableAll()         - Enable logger and all levels",
          );
          console.log(
            "  window.logger.disableAll()        - Disable everything",
          );
          console.log(
            "  window.logger.status()            - Show current status table",
          );
          console.log("  window.logger.help()              - Show this help");
          console.log("");
          console.log(
            "%cConfiguration is persisted in localStorage",
            "color: #888; font-style: italic",
          );
        },
      };

      if (
        // biome-ignore lint/suspicious/noExplicitAny: Please, let me
        (window as any).location?.hostname === "localhost" ||
        // biome-ignore lint/suspicious/noExplicitAny: Please, let me
        (window as any).location?.hostname === "127.0.0.1"
      ) {
        console.log(
          "%cLogger Gate initialized!",
          "color: #4a90e2; font-weight: bold",
        );
        console.log("Use window.logger.help() to see available commands");
      }
    }
  }
}

export const loggerGate = new LoggerGate();
