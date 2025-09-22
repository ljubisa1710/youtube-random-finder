export const HISTORY_OPTIONS = [
  { value: "recent", label: "Latest 50 videos", limit: 50 },
  { value: "extended", label: "Latest 200 videos", limit: 200 },
  { value: "all", label: "Entire archive", limit: null },
];

export const CATEGORY_OPTIONS = [
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

export const COUNTRY_OPTIONS = [
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

export const GLOBAL_REGIONS = COUNTRY_OPTIONS.map(country => country.value);

export const LOCATION_OPTIONS = [
  { value: "global", label: "Global (multi-region)" },
  ...COUNTRY_OPTIONS,
];

export const GLOBAL_MAX_PER_REGION = 50;
export const GLOBAL_EXTRA_PAGES_PRIMARY = 3;

export const getCategoryLabel = (value) =>
  CATEGORY_OPTIONS.find(option => option.value === value)?.label || "Videos";
