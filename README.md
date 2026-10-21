# For Tanu, Always ♡

A playful, mobile-first love scrapbook made by Abhishek for Tanu. It includes a photo gallery, love meter, tiny surprises, notes, and a list of future adventures. The site is plain HTML, CSS, and JavaScript, so it needs no build step.

## Run locally
1. Unzip the folder.
2. Open `index.html` in a browser, or start a local server from this folder with `python -m http.server 8000` and visit `http://localhost:8000`.
3. No build step, backend, database, or API key is required.

## Personalize it
- **Main letter:** Open `index.html` and edit the content inside `#letterDialog`.
- **Names / anonymity:** The template intentionally avoids names. Add nicknames only if you want to.
- **Photos:** The gallery and hero already use the included WebP images in `assets/photos/`. To add more, add an entry to `memories` in `script.js` and keep the image compressed for mobile.
- **Timeline:** Add real dates, places, or inside jokes if you want to make the story more specific.
- **Reasons:** Edit the `reasons` array in `script.js`.
- **Read-when letters:** Edit the `letters` object in `script.js`.
- **Music:** Replace the three YouTube search links in `index.html` with links to the exact songs or official videos you both love. These open the music provider in a new tab rather than autoplaying.
- **Future bucket list:** Edit the text of each `.bucket-item` in `index.html`. Checkboxes work for the current visit; because this is static, their state does not sync between devices.

## Deploy
The repository can be published with GitHub Pages: open the repository's **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save. The site files are at the repository root.

## Privacy
This is a static site. The photos in this repository and on the published website are publicly accessible. Do not add anything you would not want shared with anyone who can access the repository or site.

## Fonts
The page uses Google Fonts when online and falls back to system fonts if unavailable. For fully offline use, remove the Google Fonts links in `index.html`.
