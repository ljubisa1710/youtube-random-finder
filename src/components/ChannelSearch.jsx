const ChannelSearch = ({
  searchTerm,
  onInputChange,
  onInputKeyDown,
  suggestions,
  suggestionsLoading,
  onSuggestionSelect,
}) => (
  <div className="search-group">
    <input
      type="text"
      placeholder="Search for a YouTube channel"
      value={searchTerm}
      onChange={onInputChange}
      onKeyDown={onInputKeyDown}
      className="channel-input"
      autoComplete="off"
    />
    {(suggestionsLoading || suggestions.length > 0) && (
      <div className="suggestions-panel">
        {suggestionsLoading && <div className="suggestion-pill">Searching…</div>}
        {!suggestionsLoading &&
          suggestions.map(channel => (
            <button
              key={channel.id}
              type="button"
              className="suggestion-item"
              onClick={() => onSuggestionSelect(channel)}
            >
              {channel.thumbnail && (
                <img src={channel.thumbnail} alt="" className="suggestion-thumb" />
              )}
              <div className="suggestion-copy">
                <span className="suggestion-title">{channel.title}</span>
                {channel.description && (
                  <span className="suggestion-description">{channel.description}</span>
                )}
              </div>
            </button>
          ))}
      </div>
    )}
  </div>
);

export default ChannelSearch;
