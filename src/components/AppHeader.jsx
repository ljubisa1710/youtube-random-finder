const themeLabel = (theme) => (theme === "dark" ? "light" : "dark");

const AppHeader = ({ theme, onToggleTheme }) => (
  <header className="app-header">
    <h1>🎥 Random YouTube Videos</h1>
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggleTheme}
      aria-label={`Activate ${themeLabel(theme)} mode`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  </header>
);

export default AppHeader;
