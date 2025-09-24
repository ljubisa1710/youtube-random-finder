import { useCallback, useState } from "react";
import { GLOBAL_MAX_PER_REGION, GLOBAL_EXTRA_PAGES_PRIMARY } from "../constants/options.js";
import { getVideoType } from "../utils/videoType.js";

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

    const collected = [];
    const seen = new Set();
    let nextPageToken = "";
    let pagesFetched = 0;

    do {
      const tokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&maxResults=${GLOBAL_MAX_PER_REGION}&key=${apiKey}${tokenParam}`;
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

      const items = (data.items || [])
        .map(item => {
          const { isShort } = getVideoType(item.contentDetails?.duration);
          return { id: item.id, isShort };
        })
        .filter(item => Boolean(item.id));

      for (const item of items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          collected.push(item);
        }
      }

      nextPageToken = data.nextPageToken || "";
      pagesFetched += 1;
    } while (nextPageToken && pagesFetched < GLOBAL_EXTRA_PAGES_PRIMARY);

    if (collected.length === 0) {
      throw new Error("No videos found right now, please try again.");
    }

    setState({
      videos: collected,
    });

    return collected;
  }, [state]);

  return { ensureGlobalVideoPool, resetCache };
};
