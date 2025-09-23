import { useCallback, useState } from "react";
import { GLOBAL_MAX_PER_REGION, GLOBAL_EXTRA_PAGES_PRIMARY } from "../constants/options.js";

const createInitialState = () => ({
  videos: [],
});

export const useGlobalVideoPool = () => {
  const [state, setState] = useState(createInitialState);

  const resetCache = useCallback(() => {
    setState(createInitialState());
  }, []);

  const ensureGlobalVideoPool = useCallback(async () => {
    if (state.videos.length > 0) {
      return state.videos;
    }

    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("Missing YouTube API key.");
    }

    const collected = new Set();
    let nextPageToken = "";
    let pagesFetched = 0;

    do {
      const tokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=${GLOBAL_MAX_PER_REGION}&key=${apiKey}${tokenParam}`;
      const res = await fetch(url);

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        const errorMessage = data.error?.message || "Unable to load trending videos right now.";
        throw new Error(errorMessage);
      }

      const ids = (data.items || [])
        .map(item => item.id)
        .filter(Boolean);

      ids.forEach(id => collected.add(id));

      nextPageToken = data.nextPageToken || "";
      pagesFetched += 1;
    } while (nextPageToken && pagesFetched < GLOBAL_EXTRA_PAGES_PRIMARY);

    const ids = Array.from(collected);

    if (ids.length === 0) {
      throw new Error("No videos found right now, please try again.");
    }

    setState({
      videos: ids,
    });

    return ids;
  }, [state]);

  return { ensureGlobalVideoPool, resetCache };
};
