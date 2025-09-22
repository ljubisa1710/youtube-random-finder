import { useCallback, useState } from "react";
import {
  GLOBAL_REGIONS,
  GLOBAL_MAX_PER_REGION,
  GLOBAL_EXTRA_PAGES_PRIMARY,
  getCategoryLabel,
} from "../constants/options.js";

const createInitialState = () => ({
  videos: [],
  location: "",
  category: "",
});

export const useGlobalVideoPool = () => {
  const [state, setState] = useState(createInitialState);

  const resetCache = useCallback(() => {
    setState(createInitialState());
  }, []);

  const ensureGlobalVideoPool = useCallback(
    async (locationOption, categoryOption) => {
      if (
        state.videos.length > 0 &&
        state.location === locationOption &&
        state.category === categoryOption
      ) {
        return state.videos;
      }

      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error("Missing YouTube API key.");
      }

      const collected = new Set();
      const categoryParam = categoryOption !== "all" ? `&videoCategoryId=${categoryOption}` : "";
      const categoryLabel = getCategoryLabel(categoryOption);

      const fetchPopularPage = async (regionCode, pageToken = "") => {
        const tokenParam = pageToken ? `&pageToken=${pageToken}` : "";
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=${GLOBAL_MAX_PER_REGION}&regionCode=${regionCode}&key=${apiKey}${tokenParam}${categoryParam}`;
        const res = await fetch(url);

        let data;
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (!res.ok) {
          const errorMessage = data.error?.message || `Unable to load popular videos for ${regionCode}.`;
          const lowerMessage = errorMessage.toLowerCase();
          const isSkippableError =
            categoryOption !== "all" &&
            (res.status === 400 || res.status === 404 || lowerMessage.includes("not found"));

          if (isSkippableError) {
            return "";
          }

          throw new Error(errorMessage);
        }

        const ids = (data.items || [])
          .map(item => item.id)
          .filter(Boolean);

        ids.forEach(id => collected.add(id));

        return data.nextPageToken || "";
      };

      const fetchCategorySearchPage = async (regionCode = "", pageToken = "") => {
        const params = new URLSearchParams({
          part: "snippet",
          type: "video",
          maxResults: String(GLOBAL_MAX_PER_REGION),
          q: categoryLabel,
          key: apiKey,
        });

        if (regionCode) {
          params.set("regionCode", regionCode);
        }

        if (categoryOption !== "all") {
          params.set("videoCategoryId", categoryOption);
        }

        if (pageToken) {
          params.set("pageToken", pageToken);
        }

        const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          const errorMessage = data.error?.message || "Unable to load search results.";
          const lowerMessage = errorMessage.toLowerCase();
          const isSkippableError =
            res.status === 400 || res.status === 404 || lowerMessage.includes("not found");

          if (isSkippableError) {
            return { ids: [], nextPageToken: "" };
          }

          throw new Error(errorMessage);
        }

        const ids = (data.items || [])
          .map(item => item.id?.videoId)
          .filter(Boolean);

        return { ids, nextPageToken: data.nextPageToken || "" };
      };

      const gatherFallbackVideos = async () => {
        const fallbackCollected = new Set();
        const regionsToTry = locationOption === "global" ? GLOBAL_REGIONS : [locationOption];

        for (let index = 0; index < regionsToTry.length; index += 1) {
          const region = regionsToTry[index];
          let nextPageToken = "";
          let pagesFetched = 0;

          do {
            const { ids, nextPageToken: nextToken } = await fetchCategorySearchPage(region, nextPageToken);
            ids.forEach(id => fallbackCollected.add(id));
            nextPageToken = nextToken;
            pagesFetched += 1;
          } while (
            nextPageToken &&
            pagesFetched < GLOBAL_EXTRA_PAGES_PRIMARY &&
            fallbackCollected.size < GLOBAL_MAX_PER_REGION * GLOBAL_EXTRA_PAGES_PRIMARY
          );

          if (fallbackCollected.size > 0 && locationOption !== "global") {
            break;
          }

          if (fallbackCollected.size >= GLOBAL_MAX_PER_REGION) {
            break;
          }
        }

        if (fallbackCollected.size === 0) {
          const { ids } = await fetchCategorySearchPage("", "");
          ids.forEach(id => fallbackCollected.add(id));
        }

        return Array.from(fallbackCollected);
      };

      if (locationOption === "global") {
        for (let index = 0; index < GLOBAL_REGIONS.length; index += 1) {
          const region = GLOBAL_REGIONS[index];
          let nextPageToken = await fetchPopularPage(region);

          if (index === 0 && nextPageToken) {
            let pagesFetched = 1;
            while (nextPageToken && pagesFetched < GLOBAL_EXTRA_PAGES_PRIMARY) {
              nextPageToken = await fetchPopularPage(region, nextPageToken);
              pagesFetched += 1;
            }
          }
        }
      } else {
        let nextPageToken = await fetchPopularPage(locationOption);
        let pagesFetched = 1;
        while (nextPageToken && pagesFetched < GLOBAL_EXTRA_PAGES_PRIMARY) {
          nextPageToken = await fetchPopularPage(locationOption, nextPageToken);
          pagesFetched += 1;
        }
      }

      let ids = Array.from(collected);

      if (ids.length === 0) {
        if (categoryOption !== "all") {
          ids = await gatherFallbackVideos();
          if (ids.length === 0) {
            throw new Error(
              `No videos found for "${categoryLabel}" right now. Try another category or location.`
            );
          }
        } else {
          throw new Error("No videos found right now, please try again.");
        }
      }

      setState({
        videos: ids,
        location: locationOption,
        category: categoryOption,
      });

      return ids;
    },
    [state]
  );

  return { ensureGlobalVideoPool, resetCache };
};
