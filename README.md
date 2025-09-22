# YouTube Random Finder

A lightweight React + Vite app for surfacing surprise YouTube videos. Search for a specific channel or let the app pick from trending videos across regions and categories while avoiding repeats.

## Features
- Channel lookup with debounced YouTube suggestions.
- Random selection from a channel's uploads with adjustable history depth (latest 50, 200, or entire archive).
- Global discovery mode that samples trending videos by region and category when no channel is selected.
- Played-video history so you do not see the same clip twice in one session.
- Quick theme toggle with persisted preference via `localStorage`.

## Requirements
- Node.js 18 or newer.
- A YouTube Data API v3 key with access to the `channels`, `playlistItems`, `videos`, and `search` endpoints.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an environment file (`.env`, `.env.local`, or similar) in the project root with your API key:
   ```bash
   VITE_YOUTUBE_API_KEY=your-google-api-key
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts
- `npm run dev` – Start Vite in dev mode with HMR.
- `npm run build` – Create an optimized production build in `dist/`.
- `npm run preview` – Preview the production build locally.
- `npm run lint` – Run ESLint across the project.

## Usage Tips
- Begin typing a channel name and pick from the live suggestions to search that creator's uploads.
- Leave the search blank to explore trending clips; use the region and category filters to customize the pool.
- Switch between history depths to control how far back channel picks are allowed to go; the video cache resets automatically when you change this option.
- Hit **Clear** to reset all filters, selections, and the session play history.

## Troubleshooting
- "Missing YouTube API key" means the `VITE_YOUTUBE_API_KEY` environment variable is absent or misspelled.
- If you run into quota issues, create an additional API key in the Google Cloud Console or wait for your daily quota to reset.

## Project Structure Highlights
- `src/App.jsx` – Top-level container wiring together UI sections, shared hooks, and discovery logic.
- `src/components/` – Presentation components (header, search input, filters, etc.).
- `src/hooks/` – Custom hooks for theme persistence and video pool management.
- `src/constants/` – Shared option lists for history depth, regions, and categories.

Happy exploring!
