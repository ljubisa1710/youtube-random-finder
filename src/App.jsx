import { useEffect, useState } from "react";
import { HISTORY_OPTIONS } from "./constants/options.js";
import AppHeader from "./components/AppHeader.jsx";
import ChannelSearch from "./components/ChannelSearch.jsx";
import HistorySelector from "./components/HistorySelector.jsx";
import ActionBar from "./components/ActionBar.jsx";
import VideoPlayer from "./components/VideoPlayer.jsx";
import LegalNotice from "./components/LegalNotice.jsx";
import { useTheme } from "./hooks/useTheme.js";
import { useChannelVideoPool } from "./hooks/useChannelVideoPool.js";
import { useGlobalVideoPool } from "./hooks/useGlobalVideoPool.js";

const pickUniqueVideo = (pool, playedVideos, setPlayedVideos, setError) => {
  const available = pool.filter(id => !playedVideos.includes(id));
  if (available.length === 0) {
    setError("You've already seen every video in this set. Clear history to keep exploring.");
    return null;
  }

  const randomVideoId = available[Math.floor(Math.random() * available.length)];
  setPlayedVideos(prev => [...prev, randomVideoId]);
  return randomVideoId;
};

function App() {
  const { theme, toggleTheme } = useTheme();
  const { ensureVideoPool, resetCache: resetChannelPool } = useChannelVideoPool();
  const { ensureGlobalVideoPool, resetCache: resetGlobalPool } = useGlobalVideoPool();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [selectedChannelName, setSelectedChannelName] = useState("");
  const [videoId, setVideoId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [historyOption, setHistoryOption] = useState(HISTORY_OPTIONS[0].value);
  const [playedVideos, setPlayedVideos] = useState([]);
  const [showLegalNotice, setShowLegalNotice] = useState(false);

  useEffect(() => {
    const term = searchTerm.trim();

    if (!term || term === selectedChannelName || term.length < 3) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    const handler = setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        if (!apiKey) {
          throw new Error("Missing YouTube API key.");
        }

        const query = encodeURIComponent(term);
        const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=channel&maxResults=6&q=${query}`;
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        const channels = (data.items || [])
          .map(item => ({
            id: item.id?.channelId,
            title: item.snippet?.channelTitle,
            description: item.snippet?.description,
            thumbnail: item.snippet?.thumbnails?.default?.url,
          }))
          .filter(channel => channel.id && channel.title);

        setSuggestions(channels);
        setSuggestionsLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Couldn't load channel suggestions.");
        setSuggestions([]);
        setSuggestionsLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [searchTerm, selectedChannelName]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value !== selectedChannelName) {
      setSelectedChannelId("");
      setSelectedChannelName("");
      resetChannelPool();
    }
  };

  const handleSuggestionSelect = (channel) => {
    setSelectedChannelId(channel.id);
    setSelectedChannelName(channel.title);
    setSearchTerm(channel.title);
    setSuggestions([]);
    setVideoId("");
    setPlayedVideos([]);
    resetChannelPool();
    setError("");
  };

  const handleHistoryChange = (event) => {
    setHistoryOption(event.target.value);
    resetChannelPool();
    setVideoId("");
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && suggestions.length > 0) {
      event.preventDefault();
      handleSuggestionSelect(suggestions[0]);
    }
  };

  const handleClearAll = () => {
    setSearchTerm("");
    setSelectedChannelId("");
    setSelectedChannelName("");
    setSuggestions([]);
    setVideoId("");
    setHistoryOption(HISTORY_OPTIONS[0].value);
    setPlayedVideos([]);
    setError("");
    resetChannelPool();
    resetGlobalPool();
  };

  const fetchRandomVideo = async () => {
    if (loading) return;

    const trimmedTerm = searchTerm.trim();

    if (!selectedChannelId) {
      if (trimmedTerm.length > 0) {
        setError("Select a channel from the suggestions first.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const pool = await ensureGlobalVideoPool();
        const uniqueVideoId = pickUniqueVideo(pool, playedVideos, setPlayedVideos, setError);
        if (!uniqueVideoId) {
          return;
        }
        setError("");
        setVideoId(uniqueVideoId);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }

      return;
    }

    setLoading(true);
    setError("");

    try {
      const pool = await ensureVideoPool(selectedChannelId, historyOption);
      const uniqueVideoId = pickUniqueVideo(pool, playedVideos, setPlayedVideos, setError);
      if (!uniqueVideoId) {
        return;
      }
      setError("");
      setVideoId(uniqueVideoId);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <AppHeader theme={theme} onToggleTheme={toggleTheme} />

      <ChannelSearch
        searchTerm={searchTerm}
        onInputChange={handleInputChange}
        onInputKeyDown={handleInputKeyDown}
        suggestions={suggestions}
        suggestionsLoading={suggestionsLoading}
        onSuggestionSelect={handleSuggestionSelect}
      />

      <p className="search-hint">
        Leave the search blank to grab a random trending video.
      </p>

      <HistorySelector
        historyOption={historyOption}
        options={HISTORY_OPTIONS}
        onChange={handleHistoryChange}
        disabled={loading || !selectedChannelId}
      />

      <ActionBar onFetch={fetchRandomVideo} onClear={handleClearAll} loading={loading} />

      {error && <p className="error-text">{error}</p>}

      <VideoPlayer videoId={videoId} />

      <button
        type="button"
        className="legal-trigger"
        onClick={() => setShowLegalNotice(true)}
      >
        Privacy &amp; Terms
      </button>

      <p className="legal-caption">
        Using this app means you agree to the YouTube Terms of Service and our privacy practices.
      </p>

      {showLegalNotice && <LegalNotice onClose={() => setShowLegalNotice(false)} />}
    </div>
  );
}

export default App;
