"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * 三档循环按钮：light → dark → system → light。
 *
 * - 服务端首屏：图标按"日间"画（与 ThemeScript 缺省值一致），无 hydration 警告。
 * - 挂载后：用 `useSyncExternalStore` 切到客户端真实状态，
 *   既不会出现 hydration mismatch，也不需要在 effect 里 setState。
 * - 视觉：与 Nav 的汉堡按钮同尺寸 / 同 hover 风格，保证简约线条一致性。
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { preference, cycle } = useTheme();
  const mounted = useMounted();

  const meta = (() => {
    if (!mounted) {
      // SSR 占位：图标先按"日间"画，避免 layout shift；aria 留中性
      return { icon: <Sun size={16} />, label: "切换主题" };
    }
    if (preference === "light") {
      return { icon: <Sun size={16} />, label: "当前：日间，点击切到夜间" };
    }
    if (preference === "dark") {
      return { icon: <Moon size={16} />, label: "当前：夜间，点击切到跟随系统" };
    }
    return {
      icon: <Monitor size={16} />,
      label: "当前：跟随系统，点击切到日间",
    };
  })();

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={meta.label}
      title={meta.label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/60",
        className,
      )}
    >
      {meta.icon}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  useMounted via useSyncExternalStore                                        */
/* -------------------------------------------------------------------------- */

const NOOP_UNSUBSCRIBE = () => undefined;
const subscribeMounted = () => NOOP_UNSUBSCRIBE;
const getMountedClient = () => true;
const getMountedServer = () => false;

/**
 * 服务端 / 服务端首次渲染时返回 false，挂载后返回 true。
 *
 * 用 useSyncExternalStore 而不是 `useEffect + useState`，
 * 可以避开 React 19 的 `react-hooks/set-state-in-effect` 规则。
 */
function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeMounted,
    getMountedClient,
    getMountedServer,
  );
}
