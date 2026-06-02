"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

/** 用户层选择：三档。`system` 表示跟随操作系统偏好。 */
export type ThemePreference = "light" | "dark" | "system";

/** 实际生效的颜色模式，仅两档。 */
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  /** 用户的当前选择（持久化到 localStorage）。 */
  preference: ThemePreference;
  /** 实际渲染采用的模式（system 解析后的结果）。 */
  resolved: ResolvedTheme;
  /** 切换到指定档位。 */
  setPreference: (next: ThemePreference) => void;
  /** 在三档之间循环：light → dark → system → light。 */
  cycle: () => void;
}

const STORAGE_KEY = "theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/*  外部 store：localStorage["theme"]                                          */
/* -------------------------------------------------------------------------- */

/**
 * 用 useSyncExternalStore 把 localStorage 当成外部 store。
 *
 * 这避免了"effect 里同步 setState"的反模式（被
 * react-hooks/set-state-in-effect 规则禁止）。
 */
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function subscribePreference(listener: Listener): () => void {
  listeners.add(listener);
  // 跨标签页的同步：监听 storage 事件
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function readPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* 隐私模式下 localStorage 不可用，回退默认 */
  }
  return "light";
}

/** SSR 期间没有 localStorage，统一回 "light" 占位（与 ThemeScript 缺省值一致）。 */
function readPreferenceSSR(): ThemePreference {
  return "light";
}

/* -------------------------------------------------------------------------- */
/*  外部 store：系统颜色偏好                                                    */
/* -------------------------------------------------------------------------- */

function subscribeSystemPref(listener: Listener): () => void {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => undefined;
  }
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", listener);
  return () => mql.removeEventListener("change", listener);
}

function readSystemPref(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
  ) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function readSystemPrefSSR(): ResolvedTheme {
  return "light";
}

/* -------------------------------------------------------------------------- */
/*  应用到 DOM                                                                 */
/* -------------------------------------------------------------------------- */

function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 用 useSyncExternalStore 直接读取最新的 preference / 系统偏好
  const preference = useSyncExternalStore(
    subscribePreference,
    readPreference,
    readPreferenceSSR,
  );
  const systemPref = useSyncExternalStore(
    subscribeSystemPref,
    readSystemPref,
    readSystemPrefSSR,
  );

  const resolved: ResolvedTheme =
    preference === "system" ? systemPref : preference;

  // 把 resolved 同步到 <html>。这是合法的 effect 用法：把 React 状态写到外部 DOM。
  useEffect(() => {
    applyResolvedTheme(resolved);
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* 隐私模式下静默失败，仅本次会话生效 */
    }
    notify();
  }, []);

  const cycle = useCallback(() => {
    const order: ThemePreference[] = ["light", "dark", "system"];
    const curr = readPreference();
    const next = order[(order.indexOf(curr) + 1) % order.length];
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
    notify();
  }, []);

  return (
    <ThemeContext.Provider
      value={{ preference, resolved, setPreference, cycle }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/** 必须包在 ThemeProvider 内使用。 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme 必须在 ThemeProvider 内使用");
  }
  return ctx;
}
