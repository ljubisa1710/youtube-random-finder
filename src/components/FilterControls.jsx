const FilterControls = ({
  locationOption,
  categoryOption,
  onLocationChange,
  onCategoryChange,
  locations,
  categories,
  disabled,
}) => (
  <div className="filters">
    <div className="location-options">
      <label htmlFor="location-select" className="location-label">
        Where should we look?
      </label>
      <select
        id="location-select"
        className="location-select"
        value={locationOption}
        onChange={onLocationChange}
        disabled={disabled}
      >
        {locations.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    <div className="category-options">
      <label htmlFor="category-select" className="category-label">
        What kind of videos?
      </label>
      <select
        id="category-select"
        className="category-select"
        value={categoryOption}
        onChange={onCategoryChange}
        disabled={disabled}
      >
        {categories.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default FilterControls;
