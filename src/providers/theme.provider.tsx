import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeProviderState {
  /** The user's selection (may be "system"). */
  theme: Theme;
  /** The actual applied theme after resolving "system". */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "platform_theme";

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? defaultTheme,
  );
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    theme === "system" ? getSystemTheme() : theme,
  );

  useEffect(() => {
    const root = document.documentElement;
    const apply = (next: "light" | "dark") => {
      root.classList.toggle("dark", next === "dark");
      setResolvedTheme(next);
    };

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      apply(media.matches ? "dark" : "light");
      const listener = (event: MediaQueryListEvent) => apply(event.matches ? "dark" : "light");
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }

    apply(theme);
  }, [theme]);

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next: Theme) => {
        localStorage.setItem(STORAGE_KEY, next);
        setThemeState(next);
      },
    }),
    [theme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
