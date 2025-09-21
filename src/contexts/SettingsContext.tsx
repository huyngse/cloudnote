import { settingsStorageKey } from "@/constants/storageKeys";
import { createContext, useContext, useEffect, useState } from "react";


interface Settings {
  bgColor: string;
}

interface SettingsContextType {
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const defaultSettings: Settings = {
  bgColor: "#f1f5f9",
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem(settingsStorageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as Settings;
      setSettings({ ...defaultSettings, ...parsed });
      document.body.style.backgroundColor = parsed.bgColor;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    document.body.style.backgroundColor = settings.bgColor;
  }, [settings]);

  const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useSettings must be used within SettingsProvider");
  return context;
}
