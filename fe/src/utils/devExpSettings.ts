const LOCKED_BOX_AUTO_LOAD_LOCAL_STORAGAE_KEY = "ICOD2_DEV_AUTO_LOAD_BOX";
const ICOD2_DEV_COUNT_DOWN_OVERRIDE_STORAGAE_KEY =
  "ICOD2_DEV_COUNT_DOWN_OVERRIDE";
const ICOD2_DEV_TOP_NAV_TOOLS_STORAGAE_KEY = "ICOD2_DEV_TOP_NAV_TOOLS";

window.icod2Dev = {
  clear: () => {
    localStorage.removeItem(LOCKED_BOX_AUTO_LOAD_LOCAL_STORAGAE_KEY);
    localStorage.removeItem(ICOD2_DEV_COUNT_DOWN_OVERRIDE_STORAGAE_KEY);
    localStorage.removeItem(ICOD2_DEV_TOP_NAV_TOOLS_STORAGAE_KEY);
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
        console.warn(e);
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
}

declare global {
  interface Window {
    icod2Dev: Icod2Dev;
  }
}
