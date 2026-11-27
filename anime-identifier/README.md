# Anime Snapshot Identifier

Arabic website that identifies the anime name, episode number, and timestamp from a single screenshot.

## Features
- Upload a screenshot (drag and drop or file picker)
- Shows anime name, episode number, and exact scene timestamp
- Similarity confidence score
- Anime cover, AniList score, and year fetched automatically
- Dark RTL design, mobile friendly

## Tech
- HTML + CSS + Vanilla JS
- trace.moe API (free, no key) for scene matching
- AniList GraphQL API for extra details

## Run locally
Just open index.html in a browser. No build step needed.

Or serve it:
cd anime-identifier
python3 -m http.server 8080

## Deploy via GitHub Pages
1. Merge feature/anime-snapshot-identifier into main
2. Repo Settings > Pages > Deploy from a branch > main
3. Site will be live at: https://far1992ed.github.io/ch/anime-identifier/

## Notes
- trace.moe free tier is rate limited per IP
- Best results with clear, unedited screenshots
- Matches below 50% similarity are filtered out

License: MIT
