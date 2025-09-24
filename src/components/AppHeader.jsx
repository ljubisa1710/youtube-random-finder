const themeLabel = (theme) => (theme === "dark" ? "light" : "dark");

const filterLabel = (type) => (type === "shorts" ? "Shorts" : "Videos");

const AppHeader = ({ theme, onToggleTheme, filterType, onToggleFilter }) => (
  <header className="app-header">
    <h1>🎥 Random YouTube Videos</h1>
    <button
      type="button"
      className="filter-toggle"
      onClick={onToggleFilter}
      aria-label={`Switch to ${filterType === "shorts" ? "videos" : "shorts"}`}
      aria-pressed={filterType === "shorts"}
    >
      Filter: {filterLabel(filterType)}
    </button>
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
