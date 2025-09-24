import { useCallback, useState } from "react";
import { HISTORY_OPTIONS } from "../constants/options.js";
import { getVideoType } from "../utils/videoType.js";

const annotateVideosWithType = async (ids, apiKey) => {
  const metadata = new Map();
  const chunkSize = 50;

  for (let i = 0; i < ids.length; i += chunkSize) {
    const batch = ids.slice(i, i + chunkSize);
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batch.join(",")}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    if (!detailsRes.ok) {
      throw new Error(detailsData.error?.message || "Unable to load video details.");
    }

    for (const item of detailsData.items || []) {
      const { isShort } = getVideoType(item.contentDetails?.duration);
      metadata.set(item.id, { id: item.id, isShort });
    }
  }

  return ids.map(id => metadata.get(id) || { id, isShort: false });
};

const createInitialState = () => ({
  videos: [],
  channelId: "",
  historyOption: "",
});

export const useChannelVideoPool = () => {
  const [state, setState] = useState(createInitialState);

  const resetCache = useCallback(() => {
    setState(createInitialState());
  }, []);

  const ensureVideoPool = useCallback(
    async (selectedChannelId, historyOption) => {
      if (
        state.channelId === selectedChannelId &&
        state.historyOption === historyOption &&
        state.videos.length > 0
      ) {
        return state.videos;
      }

      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error("Missing YouTube API key.");
      }

      const selectedHistory =
        HISTORY_OPTIONS.find(option => option.value === historyOption) || HISTORY_OPTIONS[0];
      const maxVideos = selectedHistory.limit;

      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${selectedChannelId}&key=${apiKey}`;
      const channelRes = await fetch(channelUrl);
      const channelData = await channelRes.json();
      if (!channelRes.ok) {
        throw new Error(channelData.error?.message || "Unable to load channel metadata.");
      }

      const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylistId) {
        throw new Error("Could not find this channel's uploads playlist.");
      }

      let collectedIds = [];
      let nextPageToken = "";

      do {
        const tokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}${tokenParam}`;
        const playlistRes = await fetch(playlistUrl);
        const playlistData = await playlistRes.json();
        if (!playlistRes.ok) {
          throw new Error(playlistData.error?.message || "Unable to load channel uploads.");
        }

        const idsFromPage = (playlistData.items || [])
          .map(item => item.contentDetails?.videoId)
          .filter(Boolean);

        collectedIds = collectedIds.concat(idsFromPage);
        if (maxVideos && collectedIds.length >= maxVideos) {
          collectedIds = collectedIds.slice(0, maxVideos);
          break;
        }

        nextPageToken = playlistData.nextPageToken || "";
      } while (nextPageToken);

      if (collectedIds.length === 0) {
        throw new Error("No videos found for this channel.");
      }

      const annotatedVideos = await annotateVideosWithType(collectedIds, apiKey);

      setState({
        videos: annotatedVideos,
        channelId: selectedChannelId,
        historyOption,
      });

      return annotatedVideos;
    },
    [state]
  );

  return { ensureVideoPool, resetCache };
};
