import React, { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "theme";

const applyTheme = (nextTheme) => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
  }
};

const getDefaultTheme = () => {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  const prefersLight =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
};

const HISTORY_OPTIONS = [
  { value: "recent", label: "Latest 50 videos", limit: 50 },
  { value: "extended", label: "Latest 200 videos", limit: 200 },
  { value: "all", label: "Entire archive", limit: null },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "1", label: "Film & Animation" },
  { value: "2", label: "Autos & Vehicles" },
  { value: "10", label: "Music" },
  { value: "15", label: "Pets & Animals" },
  { value: "17", label: "Sports" },
  { value: "19", label: "Travel & Events" },
  { value: "20", label: "Gaming" },
  { value: "21", label: "Videoblogging" },
  { value: "22", label: "People & Blogs" },
  { value: "23", label: "Comedy" },
  { value: "24", label: "Entertainment" },
  { value: "25", label: "News & Politics" },
  { value: "26", label: "Howto & Style" },
  { value: "27", label: "Education" },
  { value: "28", label: "Science & Technology" },
  { value: "29", label: "Nonprofits & Activism" },
  { value: "30", label: "Movies" },
  { value: "31", label: "Anime/Animation" },
  { value: "32", label: "Action/Adventure" },
  { value: "33", label: "Classics" },
  { value: "34", label: "Comedy" },
  { value: "35", label: "Documentary" },
  { value: "36", label: "Drama" },
  { value: "37", label: "Family" },
  { value: "38", label: "Foreign" },
  { value: "39", label: "Horror" },
  { value: "40", label: "Sci-Fi/Fantasy" },
  { value: "41", label: "Thriller" },
  { value: "42", label: "Shorts" },
  { value: "43", label: "Shows" },
  { value: "44", label: "Trailers" },
];

const COUNTRY_OPTIONS = [
  { value: "AR", label: "Argentina" },
  { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" },
  { value: "BE", label: "Belgium" },
  { value: "BR", label: "Brazil" },
  { value: "CA", label: "Canada" },
  { value: "CL", label: "Chile" },
  { value: "CO", label: "Colombia" },
  { value: "CZ", label: "Czech Republic" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "HK", label: "Hong Kong" },
  { value: "IN", label: "India" },
  { value: "IE", label: "Ireland" },
  { value: "IT", label: "Italy" },
  { value: "JP", label: "Japan" },
  { value: "MY", label: "Malaysia" },
  { value: "MX", label: "Mexico" },
  { value: "NL", label: "Netherlands" },
  { value: "NZ", label: "New Zealand" },
  { value: "NG", label: "Nigeria" },
  { value: "NO", label: "Norway" },
  { value: "PH", label: "Philippines" },
  { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" },
  { value: "SG", label: "Singapore" },
  { value: "ZA", label: "South Africa" },
  { value: "KR", label: "South Korea" },
  { value: "ES", label: "Spain" },
  { value: "SE", label: "Sweden" },
  { value: "CH", label: "Switzerland" },
  { value: "TH", label: "Thailand" },
  { value: "TR", label: "Turkey" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
];

const GLOBAL_REGIONS = COUNTRY_OPTIONS.map(country => country.value);

const LOCATION_OPTIONS = [{ value: "global", label: "Global (multi-region)" }, ...COUNTRY_OPTIONS];

const GLOBAL_MAX_PER_REGION = 50;
const GLOBAL_EXTRA_PAGES_PRIMARY = 3;

const getCategoryLabel = (value) =>
  CATEGORY_OPTIONS.find(option => option.value === value)?.label || "Videos";

function App() {
  const [theme, setTheme] = useState(() => {
    const initialTheme = getDefaultTheme();
    applyTheme(initialTheme);
    return initialTheme;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [selectedChannelName, setSelectedChannelName] = useState("");
  const [videoId, setVideoId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [videoPool, setVideoPool] = useState([]);
  const [videoPoolChannelId, setVideoPoolChannelId] = useState("");
  const [videoPoolHistoryOption, setVideoPoolHistoryOption] = useState("");
  const [historyOption, setHistoryOption] = useState(HISTORY_OPTIONS[0].value);
  const [globalVideoPool, setGlobalVideoPool] = useState([]);
  const [globalVideoPoolLocation, setGlobalVideoPoolLocation] = useState("");
  const [globalVideoPoolCategory, setGlobalVideoPoolCategory] = useState("");
  const [locationOption, setLocationOption] = useState(LOCATION_OPTIONS[0].value);
  const [categoryOption, setCategoryOption] = useState(CATEGORY_OPTIONS[0].value);
  const [playedVideos, setPlayedVideos] = useState([]);

  const ensureVideoPool = async () => {
    if (
      videoPoolChannelId === selectedChannelId &&
      videoPoolHistoryOption === historyOption &&
      videoPool.length > 0
    ) {
      return videoPool;
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

    setVideoPool(collectedIds);
    setVideoPoolChannelId(selectedChannelId);
    setVideoPoolHistoryOption(historyOption);
    return collectedIds;
  };

  useEffect(() => {
    applyTheme(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const ensureGlobalVideoPool = async () => {
    if (
      globalVideoPool.length > 0 &&
      globalVideoPoolLocation === locationOption &&
      globalVideoPoolCategory === categoryOption
    ) {
      return globalVideoPool;
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
      } catch (err) {
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

    setGlobalVideoPool(ids);
    setGlobalVideoPoolLocation(locationOption);
    setGlobalVideoPoolCategory(categoryOption);
    return ids;
  };

  const pickUniqueVideo = (pool) => {
    const available = pool.filter(id => !playedVideos.includes(id));
    if (available.length === 0) {
      setError(
        "You've already seen every video in this set. Clear history or adjust your filters to keep exploring."
      );
      return null;
    }

    const randomVideoId = available[Math.floor(Math.random() * available.length)];
    setPlayedVideos(prev => [...prev, randomVideoId]);
    return randomVideoId;
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
        const uniqueVideoId = pickUniqueVideo(pool);
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
      const pool = await ensureVideoPool();
      const uniqueVideoId = pickUniqueVideo(pool);
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

  useEffect(() => {
    const term = searchTerm.trim();

    if (!term) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    if (term === selectedChannelName) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    if (term.length < 3) {
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
    }
  };

  const handleSuggestionSelect = (channel) => {
    setSelectedChannelId(channel.id);
    setSelectedChannelName(channel.title);
    setSearchTerm(channel.title);
    setSuggestions([]);
    setError("");
    setVideoId("");
    setVideoPool([]);
    setVideoPoolChannelId("");
    setVideoPoolHistoryOption("");
  };

  const handleHistoryChange = (event) => {
    const value = event.target.value;
    setHistoryOption(value);
    setVideoPool([]);
    setVideoPoolChannelId("");
    setVideoPoolHistoryOption("");
    setVideoId("");
  };

  const handleLocationChange = (event) => {
    const value = event.target.value;
    setLocationOption(value);
    setGlobalVideoPool([]);
    setGlobalVideoPoolLocation("");
    setGlobalVideoPoolCategory("");
    if (!selectedChannelId) {
      setVideoId("");
    }
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setCategoryOption(value);
    setGlobalVideoPool([]);
    setGlobalVideoPoolLocation("");
    setGlobalVideoPoolCategory("");
    if (!selectedChannelId) {
      setVideoId("");
    }
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
    setVideoPool([]);
    setVideoPoolChannelId("");
    setVideoPoolHistoryOption("");
    setGlobalVideoPool([]);
    setGlobalVideoPoolLocation("");
    setGlobalVideoPoolCategory("");
    setCategoryOption(CATEGORY_OPTIONS[0].value);
    setLocationOption(LOCATION_OPTIONS[0].value);
    setPlayedVideos([]);
    setError("");
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎥 Random YouTube Finder</h1>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Activate ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="search-group">
        <input
          type="text"
          placeholder="Search for a YouTube channel"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
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
                  onClick={() => handleSuggestionSelect(channel)}
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

      <div className="filters">
        <div className="location-options">
          <label htmlFor="location-select" className="location-label">
            Where should we look?
          </label>
          <select
            id="location-select"
            className="location-select"
            value={locationOption}
            onChange={handleLocationChange}
            disabled={loading}
          >
            {LOCATION_OPTIONS.map(option => (
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
            onChange={handleCategoryChange}
            disabled={loading}
          >
            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="search-hint">
        Leave the search blank to grab a random trending video.
        <br />
        The location and category filters adjust what we sample when no channel is selected.
      </p>

      <div className="history-options" role="group" aria-labelledby="history-label">
        <span id="history-label" className="history-label">
          How far back should we search?
        </span>
        <div className="history-option-list">
          {HISTORY_OPTIONS.map(option => (
            <label key={option.value} className="history-option">
              <input
                type="radio"
                name="historyDepth"
                value={option.value}
                checked={historyOption === option.value}
                onChange={handleHistoryChange}
                disabled={loading || !selectedChannelId}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={fetchRandomVideo} disabled={loading} className="fetch-button">
          {loading ? "Loading..." : "Get Random Video"}
        </button>
        <button
          type="button"
          className="clear-button"
          onClick={handleClearAll}
          disabled={loading}
        >
          Clear
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {videoId && (
        <div className="video-wrapper">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Random YouTube Video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}

    </div>
  );
}

export default App;
