const SHORT_VIDEO_MAX_SECONDS = 90;

const parseIsoDurationSeconds = (duration) => {
  if (!duration || typeof duration !== "string") {
    return null;
  }

  const match = duration.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return null;
  }

  const [, days, hours, minutes, seconds] = match;
  const totalSeconds = (Number(days) || 0) * 86400
    + (Number(hours) || 0) * 3600
    + (Number(minutes) || 0) * 60
    + (Number(seconds) || 0);

  return totalSeconds;
};

export const getVideoType = (duration) => {
  const totalSeconds = parseIsoDurationSeconds(duration);
  if (totalSeconds === null) {
    return { isShort: false };
  }

  return { isShort: totalSeconds <= SHORT_VIDEO_MAX_SECONDS };
};

export const VIDEO_FILTER_TYPES = {
  videos: "videos",
  shorts: "shorts",
  all: "all",
};
