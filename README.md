# For Tanu, Always ♡

A polished, mobile-first love scrapbook made by Abhishek for Tanu. The first-visit check-in asks about her mood, what she's feeling, and a playful love rating, setting the room color palette. The page includes an interactive polaroid hero & deck, photo drawer, Polaroid Memory Match game, Scratch-Off Love Coupons, Catch My Heart game, Love Meter, a Reason Jar & wax-sealed notes, floating music player, and a shared adventure list. Plain HTML, CSS, and JavaScript with no build step.

## Run locally
1. Unzip the folder.
2. Open `index.html` in a browser, or start a local server from this folder with `python -m http.server 8000` and visit `http://localhost:8000`.
3. No build step, backend, database, or API key is required.

## Personalize it
- **Main letter:** Open `index.html` and edit the content inside `#letterDialog`.
- **Lock gate & player activity log:** Only `Tanu` (`tanu`) and `Abhishek` (`abhishek`) with passcode `4000` can unlock the site (`ALLOWED_PLAYERS` / `SECRET_PASSCODE` in `script.js`). Game high scores, claimed coupons, wishes, and interactions are saved per player in `localStorage` and viewable in **Play → Scores & Activity**.
- **Check-in questions and palettes:** Edit `welcomeSteps` and `finishWelcome` in `script.js`.
- **Photos:** The gallery and hero already use the included WebP images in `assets/photos/`. To add more, add an entry to `memories` in `script.js` and keep the image compressed for mobile.
- **Timeline:** Add real dates, places, or inside jokes if you want to make the story more specific.
- **Reasons:** Edit the `reasons` array in `script.js`.
- **Read-when letters:** Edit the `letters` object in `script.js`.
- **Music:** Audio tracks live in `assets/audio/` and are configured in the `playlist` array in `script.js` for the floating music player (with playlist drawer, scrubber, volume, and mini-pill mode).
- **Future bucket list:** Edit the text of each `.bucket-item` in `index.html`. Checkboxes work for the current visit; because this is static, their state does not sync between devices.

## Deploy
The repository can be published with GitHub Pages: open the repository's **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save. The site files are at the repository root.

## Privacy
This is a static site. Photos included in the repository or published site are available to people who can access them. If you publish the site publicly, anyone with the URL may be able to view and download its photos. Do not add anything you would not want shared with that audience.

## Fonts
The page uses Google Fonts when online and falls back to system fonts if unavailable. For fully offline use, remove the Google Fonts links in `index.html`.
