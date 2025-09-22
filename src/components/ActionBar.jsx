const ActionBar = ({ onFetch, onClear, loading }) => (
  <div className="action-buttons">
    <button onClick={onFetch} disabled={loading} className="fetch-button">
      {loading ? "Loading..." : "Get Random Video"}
    </button>
    <button
      type="button"
      className="clear-button"
      onClick={onClear}
      disabled={loading}
    >
      Clear
    </button>
  </div>
);

export default ActionBar;
