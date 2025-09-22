import { useCallback, useEffect, useState } from "react";
import { applyTheme, getDefaultTheme, THEME_STORAGE_KEY } from "../utils/theme.js";

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const initialTheme = getDefaultTheme();
    applyTheme(initialTheme);
    return initialTheme;
  });

  useEffect(() => {
    applyTheme(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme, setTheme };
};
