import { logger } from "@icod2/protocols";

export const FEATURE_FLAGS = {
  CLOSE_INITITIAL_PEER_CONNECTION_ASAP: "CLOSE_INITITIAL_PEER_CONNECTION_ASAP",
} as const;

export type FeatureFlagName =
  (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

type FeatureFlagValue = boolean | string | number | Record<string, unknown>;

type FeatureFlags = {
  [K in FeatureFlagName]?: FeatureFlagValue;
};

const getDefaultFlags = (): FeatureFlags => {
  return {
    [FEATURE_FLAGS.CLOSE_INITITIAL_PEER_CONNECTION_ASAP]: false,
  };
};

declare global {
  interface Window {
    __featureFlags?: FeatureFlags;
    __featureFlagsDebug?: () => void;
  }
}

const STORAGE_KEY = "featureFlags";
const URL_PARAM_KEY = "ff";

class FeatureFlagsManager {
  private flags: FeatureFlags = {};
  private initialized = false;
  private listeners: Map<string, Set<(value: FeatureFlagValue) => void>> =
    new Map();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;

    this.flags = getDefaultFlags();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.keys(parsed).forEach((key) => {
          if (this.isValidFlag(key)) {
            this.flags[key as FeatureFlagName] = parsed[key];
          }
        });
      }
    } catch (error) {
      logger.warn("Failed to parse stored feature flags:", error);
    }

    this.applyUrlParams();

    if (typeof window !== "undefined") {
      window.__featureFlags = this.flags;
      window.__featureFlagsDebug = () => this.debug();
    }

    this.initialized = true;
  }

  private applyUrlParams(): void {
    if (typeof window === "undefined") return;

    try {
      const params = new URLSearchParams(window.location.search);
      const ffParam = params.get(URL_PARAM_KEY);

      if (ffParam) {
        const pairs = ffParam.split(",");
        pairs.forEach((pair) => {
          const [flag, value] = pair.split(":");
          if (this.isValidFlag(flag)) {
            if (value === "true") {
              this.flags[flag as FeatureFlagName] = true;
            } else if (value === "false") {
              this.flags[flag as FeatureFlagName] = false;
            } else if (!Number.isNaN(Number(value))) {
              this.flags[flag as FeatureFlagName] = Number(value);
            } else {
              this.flags[flag as FeatureFlagName] = value;
            }
          }
        });
      }
    } catch (error) {
      logger.warn("Failed to parse URL params for feature flags:", error);
    }
  }

  private isValidFlag(flagName: string): boolean {
    return Object.values(FEATURE_FLAGS).includes(flagName as FeatureFlagName);
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.flags));
    } catch (error) {
      logger.warn("Failed to persist feature flags:", error);
    }
  }

  private notifyListeners(
    flagName: FeatureFlagName,
    value: FeatureFlagValue,
  ): void {
    const listeners = this.listeners.get(flagName);
    if (listeners) {
      listeners.forEach((callback) => {
        callback(value);
      });
    }
  }

  isEnabled(flagName: FeatureFlagName): boolean {
    if (!this.isValidFlag(flagName)) {
      logger.warn(`Invalid feature flag: ${flagName}`);
      return false;
    }

    const value = this.flags[flagName];

    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true";
    if (typeof value === "number") return value > 0;
    if (typeof value === "object" && value !== null) return true;

    return false;
  }

  getValue<T extends FeatureFlagValue = FeatureFlagValue>(
    flagName: FeatureFlagName,
  ): T | undefined {
    if (!this.isValidFlag(flagName)) {
      logger.warn(`Invalid feature flag: ${flagName}`);
      return undefined;
    }
    return this.flags[flagName] as T;
  }

  enable(flagName: FeatureFlagName): void {
    if (!this.isValidFlag(flagName)) {
      logger.warn(`Invalid feature flag: ${flagName}`);
      return;
    }

    this.flags[flagName] = true;
    this.persist();
    this.notifyListeners(flagName, true);

    if (window.__featureFlags) {
      window.__featureFlags[flagName] = true;
    }
  }

  disable(flagName: FeatureFlagName): void {
    if (!this.isValidFlag(flagName)) {
      logger.warn(`Invalid feature flag: ${flagName}`);
      return;
    }

    this.flags[flagName] = false;
    this.persist();
    this.notifyListeners(flagName, false);

    if (window.__featureFlags) {
      window.__featureFlags[flagName] = false;
    }
  }

  toggle(flagName: FeatureFlagName): boolean {
    if (!this.isValidFlag(flagName)) {
      logger.warn(`Invalid feature flag: ${flagName}`);
      return false;
    }

    const newValue = !this.isEnabled(flagName);
    if (newValue) {
      this.enable(flagName);
    } else {
      this.disable(flagName);
    }
    return newValue;
  }

  set(flagName: FeatureFlagName, value: FeatureFlagValue): void {
    if (!this.isValidFlag(flagName)) {
      logger.warn(`Invalid feature flag: ${flagName}`);
      return;
    }

    this.flags[flagName] = value;
    this.persist();
    this.notifyListeners(flagName, value);

    if (window.__featureFlags) {
      window.__featureFlags[flagName] = value;
    }
  }

  setMultiple(flags: Partial<FeatureFlags>): void {
    for (const [key, value] of Object.entries(flags)) {
      if (this.isValidFlag(key)) {
        this.set(key as FeatureFlagName, value as FeatureFlagValue);
      }
    }
  }

  reset(flagName: FeatureFlagName): void {
    if (!this.isValidFlag(flagName)) {
      logger.warn(`Invalid feature flag: ${flagName}`);
      return;
    }

    const defaults = getDefaultFlags();
    const defaultValue = defaults[flagName];

    if (defaultValue !== undefined) {
      this.set(flagName, defaultValue);
    }
  }

  resetAll(): void {
    this.flags = getDefaultFlags();
    this.persist();

    for (const [key, value] of Object.entries(this.flags)) {
      this.notifyListeners(key as FeatureFlagName, value as FeatureFlagValue);
    }

    if (window.__featureFlags) {
      window.__featureFlags = this.flags;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.resetAll();
    } catch (error) {
      logger.warn("Failed to clear feature flags:", error);
    }
  }

  getAll(): FeatureFlags {
    return { ...this.flags };
  }

  getAllFlagNames(): FeatureFlagName[] {
    return Object.values(FEATURE_FLAGS);
  }

  subscribe(
    flagName: FeatureFlagName,
    callback: (value: FeatureFlagValue) => void,
  ): () => void {
    if (!this.isValidFlag(flagName)) {
      logger.warn(`Invalid feature flag: ${flagName}`);
      return () => {};
    }

    if (!this.listeners.has(flagName)) {
      this.listeners.set(flagName, new Set());
    }

    const listeners = this.listeners.get(flagName);
    if (listeners) {
      listeners.add(callback);
    }

    return () => {
      const listeners = this.listeners.get(flagName);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  debug(): void {
    const flags = this.getAll();
    const defaults = getDefaultFlags();

    logger.log("🚩 Feature Flags Debug");
    logger.log(
      Object.entries(flags).map(([key, value]) => ({
        Flag: key,
        Current: value,
        Default: defaults[key as FeatureFlagName],
        Type: typeof value,
      })),
    );
    logger.log("Available flags:", this.getAllFlagNames());
    logger.log("URL param format: ?ff=flag1:true,flag2:false");
    logger.log("Access via: window.__featureFlagsDebug()");
  }

  generateUrl(baseUrl?: string): string {
    const url = new URL(baseUrl || window.location.href);
    const defaults = getDefaultFlags();
    const overrides: string[] = [];

    for (const [key, value] of Object.entries(this.flags)) {
      const defaultValue = defaults[key as FeatureFlagName];
      if (value !== defaultValue) {
        overrides.push(`${key}:${value}`);
      }
    }

    if (overrides.length > 0) {
      url.searchParams.set(URL_PARAM_KEY, overrides.join(","));
    }

    return url.toString();
  }
}

const manager = new FeatureFlagsManager();

export const isEnabled = (flagName: FeatureFlagName): boolean =>
  manager.isEnabled(flagName);

export const getValue = <T extends FeatureFlagValue = FeatureFlagValue>(
  flagName: FeatureFlagName,
): T | undefined => manager.getValue<T>(flagName);

export const enable = (flagName: FeatureFlagName): void =>
  manager.enable(flagName);

export const disable = (flagName: FeatureFlagName): void =>
  manager.disable(flagName);

export const toggle = (flagName: FeatureFlagName): boolean =>
  manager.toggle(flagName);

export const set = (flagName: FeatureFlagName, value: FeatureFlagValue): void =>
  manager.set(flagName, value);

export const setMultiple = (flags: Partial<FeatureFlags>): void =>
  manager.setMultiple(flags);

export const reset = (flagName: FeatureFlagName): void =>
  manager.reset(flagName);

export const resetAll = (): void => manager.resetAll();

export const clear = (): void => manager.clear();

export const getAll = (): FeatureFlags => manager.getAll();

export const getAllFlagNames = (): FeatureFlagName[] =>
  manager.getAllFlagNames();

export const subscribe = (
  flagName: FeatureFlagName,
  callback: (value: FeatureFlagValue) => void,
): (() => void) => manager.subscribe(flagName, callback);

export const debug = (): void => manager.debug();

export const generateUrl = (baseUrl?: string): string =>
  manager.generateUrl(baseUrl);

export const useFeatureFlag = (flagName: FeatureFlagName): boolean => {
  return isEnabled(flagName);
};

if (process.env.NODE_ENV === "development") {
  logger.log(
    "🚩 Feature Flags initialized. Run window.__featureFlagsDebug() for details.",
  );
}

export const featureFlagsManager = manager;
