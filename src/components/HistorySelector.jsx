const HistorySelector = ({ historyOption, options, onChange, disabled }) => (
  <div className="history-options" role="group" aria-labelledby="history-label">
    <span id="history-label" className="history-label">
      How far back should we search?
    </span>
    <div className="history-option-list">
      {options.map(option => (
        <label key={option.value} className="history-option">
          <input
            type="radio"
            name="historyDepth"
            value={option.value}
            checked={historyOption === option.value}
            onChange={onChange}
            disabled={disabled}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

export default HistorySelector;
