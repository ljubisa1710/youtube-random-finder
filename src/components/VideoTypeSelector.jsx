import { VIDEO_FILTER_TYPES } from "../utils/videoType.js";

const FILTER_OPTIONS = [
  { value: VIDEO_FILTER_TYPES.videos, label: "Videos" },
  { value: VIDEO_FILTER_TYPES.shorts, label: "Shorts" },
  { value: VIDEO_FILTER_TYPES.all, label: "All" },
];

const VideoTypeSelector = ({ value, onChange, disabled }) => (
  <div className="video-type-selector" role="group" aria-label="Filter by video type">
    {FILTER_OPTIONS.map(option => (
      <button
        key={option.value}
        type="button"
        className={`video-type-button${value === option.value ? " is-active" : ""}`}
        onClick={() => onChange(option.value)}
        disabled={disabled}
        aria-pressed={value === option.value}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default VideoTypeSelector;
