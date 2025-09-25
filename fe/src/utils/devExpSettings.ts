import { loggerGate } from "@icod2/protocols";

const LOCKED_BOX_AUTO_LOAD_LOCAL_STORAGAE_KEY = "ICOD2_DEV_AUTO_LOAD_BOX";
const ICOD2_DEV_COUNT_DOWN_OVERRIDE_STORAGAE_KEY =
  "ICOD2_DEV_COUNT_DOWN_OVERRIDE";
const ICOD2_DEV_TOP_NAV_TOOLS_STORAGAE_KEY = "ICOD2_DEV_TOP_NAV_TOOLS";
const ICOD2_DEV_BOOTSTRAP_MULTIADDR_LOCAL_STORAGAE_KEY =
  "ICOD2_DEV_BOOTSTRAP_MULTIADDR";
const ICOD2_DEV_LOGGER_STORAGAE_KEY = "ICOD2_DEV_LOGGER";

window.icod2Dev = {
  clear: () => {
    localStorage.removeItem(LOCKED_BOX_AUTO_LOAD_LOCAL_STORAGAE_KEY);
    localStorage.removeItem(ICOD2_DEV_COUNT_DOWN_OVERRIDE_STORAGAE_KEY);
    localStorage.removeItem(ICOD2_DEV_TOP_NAV_TOOLS_STORAGAE_KEY);
  },
  bootstrapMultiaddr: {
    set: (multiaddr: string | object) => {
      localStorage.setItem(
        ICOD2_DEV_BOOTSTRAP_MULTIADDR_LOCAL_STORAGAE_KEY,
        JSON.stringify([multiaddr]),
      );
    },
    get: () => {
      try {
        const value = localStorage.getItem(
          ICOD2_DEV_BOOTSTRAP_MULTIADDR_LOCAL_STORAGAE_KEY,
        );

        if (value === null) {
          return undefined;
        }

        const parsedValue = JSON.parse(value);

        if (!Array.isArray(parsedValue)) {
          throw new Error("Invalid bootstrap multiaddr format");
        }
        const filteredValue = parsedValue.filter((x) => !!x);

        if (filteredValue.length === 0) {
          return undefined;
        }

        return filteredValue;
      } catch (e) {
        loggerGate.canWarn && console.warn(e);
        return undefined;
      }
    },
  },
  lockedBoxAutoLoad: {
    set: (box: string | object) => {
      localStorage.setItem(
        LOCKED_BOX_AUTO_LOAD_LOCAL_STORAGAE_KEY,
        typeof box === "string" ? box : JSON.stringify(box),
      );
    },
    get: () => {
      try {
        const value = localStorage.getItem(
          LOCKED_BOX_AUTO_LOAD_LOCAL_STORAGAE_KEY,
        );

        if (value === null) {
          return undefined;
        }

        return JSON.parse(value);
      } catch (e) {
        loggerGate.canWarn && console.warn(e);
        return undefined;
      }
    },
  },
  countDownOverride: {
    set: (timeInMs: number) => {
      localStorage.setItem(
        ICOD2_DEV_COUNT_DOWN_OVERRIDE_STORAGAE_KEY,
        timeInMs.toString(),
      );
    },
    get: () => {
      const value = localStorage.getItem(
        ICOD2_DEV_COUNT_DOWN_OVERRIDE_STORAGAE_KEY,
      );

      if (value === null) {
        return undefined;
      }

      const parsedValue = Number.parseInt(value, 10);
      return Number.isNaN(parsedValue) ? undefined : parsedValue;
    },
  },
  loggerLevel: {
    set: (value: string | undefined) => {
      if (value === undefined) {
        localStorage.removeItem(ICOD2_DEV_LOGGER_STORAGAE_KEY);
        return;
      }
      const possibleValues = ["log", "warn", "error", "none"];
      if (!possibleValues.includes(value)) {
        console.error(`Invalid logger level: ${value}`);
        return;
      }
      localStorage.setItem(ICOD2_DEV_LOGGER_STORAGAE_KEY, value);
    },
    get: () => {
      const value = localStorage.getItem(ICOD2_DEV_LOGGER_STORAGAE_KEY);
      return value;
    },
  },
  topNavTools: {
    set: (box: boolean) => {
      localStorage.setItem(
        ICOD2_DEV_TOP_NAV_TOOLS_STORAGAE_KEY,
        box.toString(),
      );
    },
    get: () => {
      const value = localStorage.getItem(ICOD2_DEV_TOP_NAV_TOOLS_STORAGAE_KEY);
      return value === "true";
    },
  },
};

function printStatus() {
  const lockedBoxAutoLoad = window.icod2Dev.lockedBoxAutoLoad.get();
  const countDownOverride = window.icod2Dev.countDownOverride.get();
  const topNavTools = window.icod2Dev.topNavTools.get();
  const bootstrapMultiaddr = window.icod2Dev.bootstrapMultiaddr.get();
  const loggerLevel = window.icod2Dev.loggerLevel.get();

  if (lockedBoxAutoLoad) {
    console.log("[icod2Dev] Locked Box Auto Load:", lockedBoxAutoLoad);
  }
  if (countDownOverride) {
    console.log("[icod2Dev] Count Down Override:", countDownOverride);
  }
  if (topNavTools) {
    console.log("[icod2Dev] Top Nav Tools:", topNavTools);
  }
  if (bootstrapMultiaddr) {
    console.log("[icod2Dev] Bootstrap Multiaddr:", bootstrapMultiaddr);
  }
  if (loggerLevel) {
    console.log("[icod2Dev] Logger Level:", loggerLevel);
  }
}

printStatus();

interface Icod2Dev {
  clear: () => void;
  lockedBoxAutoLoad: {
    set: (box: string) => void;
    get: () => string | undefined;
  };
  countDownOverride: {
    set: (timeInMs: number) => void;
    get: () => number | undefined;
  };
  topNavTools: {
    set: (isOn: boolean) => void;
    get: () => boolean;
  };
  bootstrapMultiaddr: {
    set: (multiaddr: string) => void;
    get: () => string[] | undefined;
  };
  loggerLevel: {
    set: (level: string) => void;
    get: () => string | null;
  };
}

declare global {
  interface Window {
    icod2Dev: Icod2Dev;
  }
}
