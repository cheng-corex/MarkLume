import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

export type RecentFile = {
  path: string;
  name: string;
  openedAt: number;
};

export type SettingsState = {
  theme: ThemeMode;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  contentWidth: "narrow" | "normal" | "wide";
  recentFiles: RecentFile[];
  lastOpenedFile: string | null;
  lastOpenedFolder: string | null;
  scrollPositions: Record<string, number>;
};

const STORAGE_KEY = "marklume-settings";
const MAX_RECENT_FILES = 20;

const DEFAULT_SETTINGS: SettingsState = {
  theme: "system",
  fontSize: 15,
  lineHeight: 1.75,
  fontFamily: "sans-serif",
  contentWidth: "normal",
  recentFiles: [],
  lastOpenedFile: null,
  lastOpenedFolder: null,
  scrollPositions: {},
};

type SettingsContextType = {
  settings: SettingsState;
  updateSettings: (partial: Partial<SettingsState>) => void;
  addRecentFile: (path: string, name: string) => void;
  saveScrollPosition: (path: string, position: number) => void;
  getScrollPosition: (path: string) => number;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

function loadSettingsFromDisk(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveSettingsToDisk(settings: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.removeAttribute("data-theme");

  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "system");
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    return loadSettingsFromDisk();
  });

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    saveSettingsToDisk(settings);
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const addRecentFile = useCallback((path: string, name: string) => {
    setSettings((prev) => {
      // 去重：如果已存在，删除旧记录
      const filtered = prev.recentFiles.filter((f) => f.path !== path);
      // 新记录插到最前
      const updated = [
        { path, name, openedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_FILES);
      return {
        ...prev,
        recentFiles: updated,
        lastOpenedFile: path,
      };
    });
  }, []);

  const saveScrollPosition = useCallback((path: string, position: number) => {
    setSettings((prev) => ({
      ...prev,
      scrollPositions: {
        ...prev.scrollPositions,
        [path]: position,
      },
    }));
  }, []);

  const getScrollPosition = useCallback((path: string): number => {
    // 直接从当前 settings 中读取
    return 0; // 默认值由调用方通过 settings.scrollPositions[path] ?? 0 获取
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, addRecentFile, saveScrollPosition, getScrollPosition }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}