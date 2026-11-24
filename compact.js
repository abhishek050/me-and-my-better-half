const c$ = (s, root = document) => root.querySelector(s);
const c$$ = (s, root = document) => [...root.querySelectorAll(s)];
const cRooms = c$$(".room");
function cShowRoom(name) {
  cRooms.forEach(room => { room.hidden = false; });
  c$$(".room-nav [data-room]").forEach(button => {
    button.classList.toggle("active", button.dataset.room === name);
  });
  c$(`#room-${name}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
c$$("[data-room]").forEach(button => {
  button.addEventListener("click", () => cShowRoom(button.dataset.room));
});

// Scroll-spy to highlight active room in sticky header
if ("IntersectionObserver" in window && cRooms.length > 0) {
  const roomSpy = new IntersectionObserver(
    entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const roomName = visible.target.id.replace("room-", "");
      c$$(".room-nav [data-room]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.room === roomName);
      });
    },
    { rootMargin: "-25% 0px -55% 0px", threshold: [0.05, 0.25, 0.5] }
  );
  cRooms.forEach(room => roomSpy.observe(room));
}

const cMoodNames = {
  rose: "warm & soft",
  sage: "quiet & easy",
  honey: "bright & silly",
  plum: "dreamy & slow"
};
const cMoodShortLabels = {
  rose: "Warm",
  sage: "Quiet",
  honey: "Bright",
  plum: "Dreamy"
};
const themeCycle = ["rose", "sage", "honey", "plum"];
let currentThemeIndex = 0;

function cSyncThemeUI(theme) {
  const idx = themeCycle.indexOf(theme);
  if (idx !== -1) currentThemeIndex = idx;
  c$$("[data-compact-theme]").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.compactTheme === theme);
  });
  const moodBtn = c$("#compactMood");
  if (moodBtn && cMoodShortLabels[theme]) {
    moodBtn.textContent = cMoodShortLabels[theme];
  }
}

function cSetTheme(theme) {
  const valid = cMoodNames[theme] ? theme : "rose";
  document.documentElement.dataset.theme = valid;
  if (c$("#compactToday")) {
    c$("#compactToday").textContent = `Today feels ${cMoodNames[valid]}. I changed the room to match you.`;
  }
  window.safeStorage?.set("tanu-room-mood", valid);
  cSyncThemeUI(valid);

  if (typeof setTheme === "function") {
    setTheme(valid);
  } else if (typeof startThemeAnimations === "function") {
    startThemeAnimations(valid);
  }
}

window.addEventListener("tanu-theme-changed", e => {
  const next = e.detail?.theme;
  if (next) cSyncThemeUI(next);
});

// Inline mood pill clicks
c$$("[data-compact-theme]").forEach(btn => {
  btn.addEventListener("click", () => cSetTheme(btn.dataset.compactTheme));
});

// Load saved theme or default to rose
try {
  const savedTheme =
    window.safeStorage?.get("tanu-checkin-theme", true) ||
    window.safeStorage?.get("tanu-room-mood") ||
    "rose";
  cSetTheme(savedTheme);
} catch {
  cSetTheme("rose");
}

// Topbar Mood button cycles through themes
c$("#compactMood")?.addEventListener("click", () => {
  currentThemeIndex = (currentThemeIndex + 1) % themeCycle.length;
  const chosen = themeCycle[currentThemeIndex];
  cSetTheme(chosen);
  window.coupleTracker?.log("Mood", `Switched room vibe to ${cMoodShortLabels[chosen]}`, { icon: "🎨" });
});
const cLetter = c$("#compactLetterDialog"), cLightbox = c$("#compactLightbox");
c$("#compactLetter")?.addEventListener("click", () => {
  const prof = window.coupleTracker?.getActiveProfile();
  if (prof) {
    prof.interactions.notesOpened += 1;
    window.coupleTracker?.log("Love Letter", "Opened the main hand-delivered love letter", { icon: "💌" });
  }
  window.safeOpenDialog ? window.safeOpenDialog(cLetter) : cLetter?.showModal();
});
c$$("[data-compact-close]").forEach(button =>
  button.addEventListener("click", () => {
    const dlg = button.closest("dialog");
    window.safeCloseDialog ? window.safeCloseDialog(dlg) : dlg?.close();
  })
);
[cLetter, cLightbox].forEach(dialog =>
  dialog?.addEventListener("click", event => {
    if (event.target === dialog) {
      window.safeCloseDialog ? window.safeCloseDialog(dialog) : dialog.close();
    }
  })
);
c$("#sendHugBtn")?.addEventListener("click", event => {
  const btn = event.currentTarget;
  const label = btn.querySelector("span:last-child");
  if (label) label.textContent = "Hug received! 🥰💗";
  const prof = window.coupleTracker?.getActiveProfile();
  if (prof) {
    prof.interactions.hugsSent += 1;
    window.coupleTracker?.log("Love Letter", "Sent a warm hug back from the letter", { icon: "🫂" });
  }
  cBurstCuteEmojis(28);
  window.safeAnimate?.(btn, [{ transform: "scale(0.94)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 320 });
});
const cMemories = [
  // Together moments (Engagement / main photo first)
  ["together/main.jpeg", "Our sweetest chapter together", "together"],
  ["together/together2.webp", "My favourite kind of together", "together"],
  ["together/together3.webp", "One of those keep-forever photos", "together"],
  ["together/together4.webp", "Looking very much like my favourite people", "together"],
  ["together/together5.webp", "A little moment, a lot of happy", "together"],
  ["together/together6.webp", "A day with my favourite person", "together"],
  ["together/whatsapp-image-2026-10-20-at-10-09-20-pm.webp", "Us, out making another memory", "together"],
  ["together/whatsapp-image-2026-10-20-at-10-09-53-pm.webp", "Right where I want to be", "together"],
  ["together/whatsapp-image-2026-10-20-at-10-09-56-pm.webp", "My forever plus-one", "together"],
  ["together/date.webp", "A sweet little date", "together"],
  ["together/bouquet-that-i-gifted.webp", "Flowers for my favourite flower", "together"],
  ["together/engagement1.jpeg", "Two hearts, one promise, and a beautiful forever beginning", "together"],
  ["together/engagement2.jpeg", "And just like that, forever had a beginning", "together"],
  ["together/engagement3.jpeg", "A little sparkle, a lifetime of love", "together"],
  ["together/engagement4.jpeg", "Forever, now in our hands.", "together"],
  // Tanu - my beautiful girl
  ["tanu/tanu2.webp", "Tanu being effortlessly adorable", "tanu"],
  ["tanu/tanu3.webp", "The smile that gets me every time", "tanu"],
  ["tanu/tanu4.webp", "Main-character energy", "tanu"],
  ["tanu/tanu5.webp", "A whole heart-eyes moment", "tanu"],
  ["tanu/tanu6.jpeg", "My beautiful girl, looking perfect", "tanu"],
  ["tanu/tanu7.jpeg", "Tanu's lovely smile", "tanu"],
  ["tanu/tanu8.jpeg", "Absolutely stunning", "tanu"],
  ["tanu/tanu9.jpeg", "My favorite person", "tanu"],
  ["tanu/tanu10.jpeg", "Beautiful Tanu", "tanu"],
  ["tanu/tanu11.jpeg", "Every love song makes sense now", "tanu"],
  ["tanu/tanu12.jpeg", "How did I get so lucky?", "tanu"],
  ["tanu/tanu13.jpeg", "My favorite view, forever", "tanu"],
  ["tanu/tanu14.jpeg", "My fiancée My Love", "tanu"],
  ["tanu/whatsapp-image-2026-10-20-at-10-09-57-pm.webp", "My pretty girl", "tanu"],
  ["tanu/whatsapp-image-2026-10-20-at-10-09-58-pm.webp", "Tanu, being Tanu", "tanu"],
  ["tanu/whatsapp-image-2026-10-20-at-10-10-00-pm.webp", "A favourite face, always", "tanu"],
  ["tanu/bangles1.webp", "A little sparkle for a lovely day", "tanu"],
  ["tanu/bangles2.webp", "The bangles deserved their own moment", "tanu"],
  
  // Me (Abhishek)
  ["abhishek/abhishek4.webp", "Me, pretending this is a candid", "me"],
  ["abhishek/abhishek5.jpeg", "Your personal idiot", "me"],
  ["abhishek/abishek2.webp", "Your personal ride-or-die", "me"],
  ["abhishek/whatsapp-image-2026-10-20-at-10-09-57-pm.webp", "Before you stole the camera roll", "me"],
  
  // Childhood memories
  ["tanu/childhood-tanu.webp", "Little Tanu with the biggest future", "childhood"],
  ["tanu/child2.webp", "Tiny Tanu, already a cutie", "childhood"],
  ["abhishek/child.webp", "Tiny me, same big smile", "childhood"],
  ["abhishek/chil2.webp", "Little me, reporting for cuteness duty", "childhood"],
  
  // Gifts & surprises
  ["gifts/birthday.webp", "A birthday surprise, just because", "together"]
];
function cRenderGallery(filter="all"){const gallery=c$("#compactPhotoGrid");window.safeReplaceChildren(gallery,...cMemories.filter(([, ,type])=>filter==="all"||type===filter).map(([file,caption],index)=>{const card=document.createElement("button");card.type="button";card.className=`compact-memory memory-${index%5}`;card.innerHTML=`<img src="assets/photos/${file}" alt="${caption}" loading="lazy" decoding="async"><span>${caption}</span><small>${String(index+1).padStart(2,"0")}</small>`;card.addEventListener("click",()=>{c$("#compactLightboxImage").src=`assets/photos/${file}`;c$("#compactLightboxCaption").textContent=caption;window.safeOpenDialog?window.safeOpenDialog(cLightbox):cLightbox.showModal()});return card}))}cRenderGallery();c$$(".compact-gallery-tab").forEach(tab=>tab.addEventListener("click",()=>{c$$(".compact-gallery-tab").forEach(x=>x.classList.toggle("active",x===tab));cRenderGallery(tab.dataset.compactFilter)}));
/* ==========================================
   HERO POLAROID SWAP & DECK HEART STAMPING
   ========================================== */
const heroPolaroidMoments = [
  ["together/main.jpeg", "our sweetest chapter"],
  ["together/together2.webp", "my favourite kind of us"],
  ["together/date.webp", "a date I want on repeat"],
  ["together/bouquet-that-i-gifted.webp", "flowers for my favourite flower"],
  ["tanu/tanu3.webp", "the smile that ruins my focus"],
  ["together/together4.webp", "right where I belong"],
  ["together/engagement1.jpeg", "Two hearts, one promise, and a beautiful forever beginning", "together"],
  ["together/engagement2.jpeg", "And just like that, forever had a beginning", "together"],
    ["together/engagement3.jpeg", "A little sparkle, a lifetime of love", "together"],
  ["together/engagement4.jpeg", "Forever, now in our hands.", "together"]
];
let heroMomentIdx = 0;
const heroFigure = c$("#heroPolaroidFigure");
if (heroFigure) {
  heroFigure.addEventListener("click", () => {
    heroMomentIdx = (heroMomentIdx + 1) % heroPolaroidMoments.length;
    const [file, caption] = heroPolaroidMoments[heroMomentIdx];
    window.safeAnimate?.(
      heroFigure,
      [
        { transform: "rotate(2deg) scale(1)" },
        { transform: "rotate(-4deg) scale(0.95)", opacity: 0.7 },
        { transform: "rotate(2deg) scale(1)", opacity: 1 }
      ],
      { duration: 360, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
    );
    c$("#heroPolaroidImg").src = `assets/photos/${file}`;
    c$("#heroPolaroidCaption").textContent = caption;
  });
}

let cLikedPhotos = new Set();
try {
  const savedLikes = JSON.parse(window.safeStorage?.get("tanu-liked-photos") || "[]");
  if (Array.isArray(savedLikes)) cLikedPhotos = new Set(savedLikes);
} catch {}

function cSaveLikes() {
  window.safeStorage?.set("tanu-liked-photos", JSON.stringify([...cLikedPhotos]));
}

let cCurrentDeckFile = cMemories[0][0];
let cDeckIndex = 0;

function cSyncDeckLikeUI() {
  const liked = cLikedPhotos.has(cCurrentDeckFile);
  const btn = c$("#deckLikeBtn");
  if (btn) {
    btn.classList.toggle("is-liked", liked);
    btn.setAttribute("aria-pressed", String(liked));
    const icon = c$(".deck-like-icon", btn);
    if (icon) icon.textContent = liked ? "♥" : "♡";
  }
  const badge = c$("#deckLikedCount");
  if (badge) badge.textContent = `💗 ${cLikedPhotos.size} hearted`;
}

function cNextDeck() {
  const [file, caption] = cMemories[cDeckIndex];
  cCurrentDeckFile = file;
  const card = c$("#deckCard");
  window.safeAnimate?.(
    card,
    [
      { transform: "rotate(2deg) scale(1)" },
      { transform: "rotate(-6deg) translateX(-20px)", opacity: 0.25 },
      { transform: "rotate(2deg) scale(1)", opacity: 1 }
    ],
    { duration: 420, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
  );
  c$("#deckImage").src = `assets/photos/${file}`;
  c$("#deckImage").alt = caption;
  c$("#deckCaption").textContent = caption;
  c$("#deckCount").textContent = String(cDeckIndex + 1).padStart(2, "0");
  c$("#deckTotal").textContent = String(cMemories.length).padStart(2, "0");
  cSyncDeckLikeUI();
  cDeckIndex = (cDeckIndex + 1) % cMemories.length;
}

c$("#deckCard")?.addEventListener("click", cNextDeck);
c$("#deckStage")?.addEventListener("keydown", event => {
  if (event.target === c$("#deckLikeBtn")) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    cNextDeck();
  }
});
c$("#deckLikeBtn")?.addEventListener("click", event => {
  event.stopPropagation();
  const prof = window.coupleTracker?.getActiveProfile();
  if (cLikedPhotos.has(cCurrentDeckFile)) {
    cLikedPhotos.delete(cCurrentDeckFile);
  } else {
    cLikedPhotos.add(cCurrentDeckFile);
    if (prof) {
      prof.interactions.photosLiked += 1;
      window.coupleTracker?.log("Polaroid Deck", `Hearted a memory (${c$("#deckCaption")?.textContent || "photo"})`, { icon: "📸" });
    }
    cBurstCuteEmojis(8);
  }
  cSaveLikes();
  cSyncDeckLikeUI();
  window.safeAnimate?.(
    c$("#deckLikeBtn"),
    [{ transform: "scale(1)" }, { transform: "scale(1.32)" }, { transform: "scale(1)" }],
    { duration: 260, easing: "ease-out" }
  );
});
cNextDeck();

c$$(".compact-activity-tab").forEach(tab =>
  tab.addEventListener("click", () => {
    c$$(".compact-activity-tab").forEach(x => x.classList.toggle("active", x === tab));
    c$$(".compact-panel").forEach(panel => {
      const on = panel.id === `compact-activity-${tab.dataset.compactActivity}`;
      panel.hidden = !on;
      panel.classList.toggle("active", on);
    });
    if (tab.dataset.compactActivity === "scratch") {
      requestAnimationFrame(() => initScratchCanvas(false));
    } else if (tab.dataset.compactActivity === "scores") {
      renderCoupleScoreboard();
    }
  })
);

/* ==========================================
   TANU'S LOVE METER 💗
   Maximum score: 1000
   ========================================== */

const cMeter = c$("#compactMeter");
const cMeterNumber = c$("#compactMeterNumber");
const cMeterText = c$("#compactMeterText");

const cLoveMessages = [
  {
    max: 100,
    message: "Oh. So we're just acquaintances now? 🥲"
  },
  {
    max: 300,
    message: "Okay, at least you know my name. 😭"
  },
  {
    max: 500,
    message: "Hmm. I'll accept this temporary affection. 🤨"
  },
  {
    max: 700,
    message: "Look who's getting attached! 😏"
  },
  {
    max: 900,
    message: "Awww, somebody has a favourite person! 🥰"
  },
  {
    max: 999,
    message: "999?! What happened to the last 1 point? Explain yourself! 😤"
  },
  {
    max: 1000,
    message: "I KNEW IT! YOU'RE OBSESSED WITH ME! 💖"
  }
];

let cMaxLoveCelebrated = false;

function cGetLoveMessage(value) {
  return cLoveMessages.find(item => value <= item.max)?.message
    ?? "Love calculation in progress... 💗";
}

function cUpdateLoveMeter(value) {

  // Never allow a score below 0 or above 1000.
  value = Math.max(0, Math.min(1000, Number(value)));

  cMeter.value = String(value);
  cMeterNumber.textContent = String(value);

  // Update the slider fill percentage.
  const percentage = (value / 1000) * 100;

  cMeter.style.setProperty(
    "--compact-meter",
    `${percentage}%`
  );

  // Update the playful message.
  cMeterText.textContent = cGetLoveMessage(value);

  // Animate the score.
  window.safeAnimate?.(
    cMeterNumber,
    [
      { transform: "scale(1)" },
      { transform: "scale(1.12)" },
      { transform: "scale(1)" }
    ],
    { duration: 250, easing: "ease-out" }
  );

  // Maximum score celebration.
  if (value === 1000 && !cMaxLoveCelebrated) {
    cMaxLoveCelebrated = true;
    cMeterText.textContent = "1000/1000?! BABE, YOU'RE DOWN BAD. 😭💗";
    cBurstCuteEmojis(35);
    window.safeAnimate?.(
      cMeterNumber,
      [{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(1)" }],
      { duration: 600, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }
    );
  }

  // Allow another celebration after moving away from 1000.
  if (value < 1000) {
    cMaxLoveCelebrated = false;
  }
}

cMeter.addEventListener("input", () => {
  cUpdateLoveMeter(cMeter.value);
});
cMeter.addEventListener("change", () => {
  const val = Math.max(0, Math.min(1000, Number(cMeter.value)));
  const prof = window.coupleTracker?.getActiveProfile();
  if (prof) {
    prof.games.loveMeterLatest = val;
    if (val > (prof.games.loveMeterMax || 0)) prof.games.loveMeterMax = val;
    window.coupleTracker?.log("Love Meter", `Set the Love Meter to ${val}/1000`, {
      icon: "🌡️",
      scoreLabel: `${val} / 1000`
    });
  }
});

// Initialize the Love Meter.
cUpdateLoveMeter(cMeter.value);



/* ==========================================
   CUTE EMOJI CELEBRATION
   ========================================== */

function cBurstCuteEmojis(count = 20) {
  const emojis = ["💗", "💖", "💕", "🥺", "🫶", "💘", "😍", "😘", "🐻", "✨"];
  for (let i = 0; i < count; i++) {
    const emoji = document.createElement("span");
    emoji.className = "compact-love-burst";
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    emoji.setAttribute("aria-hidden", "true");
    emoji.style.left = `${Math.random() * 100}vw`;
    const dur = 2 + Math.random() * 2;
    emoji.style.setProperty("--compact-drift", `${(Math.random() - 0.5) * 180}px`);
    emoji.style.setProperty("--compact-duration", `${dur}s`);
    document.body.appendChild(emoji);
    const removeEl = () => { if (emoji.parentNode) emoji.remove(); };
    emoji.addEventListener("animationend", removeEl, { once: true });
    setTimeout(removeEl, (dur + 0.6) * 1000);
  }
}


/* ==========================================
   RANDOM LOVE NOTES
   ========================================== */

const cNotes = [
  "You are my favourite notification. 💗",
  "You + me + snacks is a perfect date. 🍿",
  "I'm still completely smitten. 🥰",
  "I saved you a very long hug. 🫂",
  "Officially my favourite human. No refunds. 😌",
  "Your boyfriend is cute. You're welcome. 😏",
  "I love you more than you love me. Probably. 🤨"
];

c$("#compactNote").addEventListener("click", event => {
  event.currentTarget.textContent =
    cNotes[Math.floor(Math.random() * cNotes.length)];
});

/* ==========================================
   GAME 01: POLAROID MEMORY MATCH 🃏
   ========================================== */
const memoryPairsPool = [
  { id: "us-main", src: "assets/photos/together/together2.webp", label: "Us ♡" },
  { id: "date-night", src: "assets/photos/together/date.webp", label: "Sweet date" },
  { id: "flowers", src: "assets/photos/together/bouquet-that-i-gifted.webp", label: "For Tanu" },
  { id: "tanu-smile", src: "assets/photos/tanu/tanu3.webp", label: "Cutest smile" },
  { id: "tiny-tanu", src: "assets/photos/tanu/childhood-tanu.webp", label: "Tiny Tanu" },
  { id: "tiny-abhi", src: "assets/photos/abhishek/child.webp", label: "Tiny Abhi" },
  { id: "forever", src: "assets/photos/together/main.jpeg", label: "Forever" },
  { id: "bangles", src: "assets/photos/tanu/bangles1.webp", label: "Sparkle" }
];

let memDeck = [];
let memFirst = null;
let memSecond = null;
let memLocked = false;
let memMatches = 0;
let memMoves = 0;
function getPlayerMemoryBest() {
  return window.coupleTracker?.getActiveProfile()?.games?.memoryBestMoves ?? null;
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function updateMemoryStatsUI() {
  const best = getPlayerMemoryBest();
  const activeName = window.coupleTracker?.getActivePlayer()?.displayName;
  if (c$("#memoryPairs")) c$("#memoryPairs").textContent = `${memMatches} / 6`;
  if (c$("#memoryMoves")) c$("#memoryMoves").textContent = String(memMoves);
  if (c$("#memoryBest")) {
    c$("#memoryBest").textContent = best ? `${best} moves${activeName ? ` (${activeName})` : ""}` : "—";
  }
}

function setupMemoryGame() {
  const board = c$("#memoryBoard");
  if (!board) return;
  const chosenSix = shuffleArray(memoryPairsPool).slice(0, 6);
  memDeck = shuffleArray([...chosenSix, ...chosenSix]);
  memFirst = null;
  memSecond = null;
  memLocked = false;
  memMatches = 0;
  memMoves = 0;
  updateMemoryStatsUI();
  if (c$("#memoryFeedback")) {
    c$("#memoryFeedback").textContent = "Tap any two polaroids to find a matching memory! ✨";
  }

  const stamps = ["💌", "🌸", "💗", "✨", "🧸", "🎀"];
  window.safeReplaceChildren(
    board,
    ...memDeck.map((item, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "memory-flip-card";
      card.dataset.pairId = item.id;
      card.setAttribute("aria-label", `Memory card ${idx + 1}`);
      card.innerHTML = `
        <span class="memory-card-inner">
          <span class="memory-card-face memory-card-back">
            <i class="memory-stamp">${stamps[idx % stamps.length]}</i>
            <small>A &amp; T</small>
          </span>
          <span class="memory-card-face memory-card-front">
            <img src="${item.src}" alt="${item.label}" loading="lazy">
            <span>${item.label}</span>
          </span>
        </span>
      `;
      card.addEventListener("click", () => flipMemoryCard(card));
      return card;
    })
  );
}

function flipMemoryCard(card) {
  if (memLocked || card === memFirst || card.classList.contains("is-matched")) return;
  card.classList.add("is-flipped");

  if (!memFirst) {
    memFirst = card;
    return;
  }

  memSecond = card;
  memMoves += 1;
  memLocked = true;
  updateMemoryStatsUI();

  if (memFirst.dataset.pairId === memSecond.dataset.pairId) {
    memFirst.classList.add("is-matched");
    memSecond.classList.add("is-matched");
    memMatches += 1;
    updateMemoryStatsUI();

    const cheers = [
      "Found a match! Look how cute we are 🥰",
      "Another pair! Your memory is undefeated ✨",
      "Two of a kind — just like us 💗",
      "Matched! Saving that one forever 📸",
      "Almost there, cutie! 🌸"
    ];
    if (memMatches === 6) {
      const prof = window.coupleTracker?.getActiveProfile();
      const playerName = window.coupleTracker?.getActivePlayer()?.displayName || "You";
      if (prof) {
        prof.games.memoryWins = (prof.games.memoryWins || 0) + 1;
        prof.games.memoryLastMoves = memMoves;
        if (!prof.games.memoryBestMoves || memMoves < prof.games.memoryBestMoves) {
          prof.games.memoryBestMoves = memMoves;
        }
        window.coupleTracker?.log("Memory Match", `Matched all 6 polaroid pairs in ${memMoves} moves`, {
          icon: "🃏",
          scoreLabel: `${memMoves} moves`
        });
      }
      updateMemoryStatsUI();
      c$("#memoryFeedback").textContent = `${playerName} matched all 6 pairs in ${memMoves} moves! Saved to your scoreboard 💖`;
      cBurstCuteEmojis(28);
    } else {
      c$("#memoryFeedback").textContent = cheers[(memMatches - 1) % cheers.length];
    }
    memFirst = null;
    memSecond = null;
    memLocked = false;
  } else {
    c$("#memoryFeedback").textContent = "Almost! Peek closely and try another pair 🙈";
    setTimeout(() => {
      memFirst?.classList.remove("is-flipped");
      memSecond?.classList.remove("is-flipped");
      memFirst = null;
      memSecond = null;
      memLocked = false;
    }, 780);
  }
}

c$("#memoryRestartBtn")?.addEventListener("click", setupMemoryGame);
setupMemoryGame();

/* ==========================================
   GAME 02: SCRATCH-OFF LOVE COUPONS 🎟️
   ========================================== */
const loveCoupons = [
  {
    id: "chai",
    emoji: "🧋",
    title: "Midnight Chai & Snack Delivery",
    note: "Redeemable whenever cravings hit. Zero questions asked."
  },
  {
    id: "argument",
    emoji: "👑",
    title: "Automatic Win in One Silly Argument",
    note: "Abhishek must immediately nod and say “You were right, Tanu.”"
  },
  {
    id: "drive",
    emoji: "🚗",
    title: "Long Sunset Drive + DJ Privileges",
    note: "Windows down, your playlist on loop, my hand in yours."
  },
  {
    id: "hug",
    emoji: "🫂",
    title: "One Unreasonably Long Bear Hug",
    note: "Minimum duration: 60 seconds. Renewal unlimited."
  },
  {
    id: "movie",
    emoji: "🍿",
    title: "Cozy Movie Night (100% Your Pick)",
    note: "I promise not to complain AND you get the best snacks."
  },
  {
    id: "chef",
    emoji: "🍝",
    title: "Personal Chef Abhishek Evening",
    note: "I cook your favourite comfort food while you supervise."
  },
  {
    id: "photoshoot",
    emoji: "📸",
    title: "Dedicated Hype-Man Photo Session",
    note: "100+ angles until we get the exact main-character shot."
  }
];

let currentCouponIdx = 0;
let scratchRevealed = false;
let isScratching = false;
let scratchInitialized = false;
function getActiveClaimedCoupons() {
  const prof = window.coupleTracker?.getActiveProfile();
  if (prof && Array.isArray(prof.games.couponsClaimed)) {
    return prof.games.couponsClaimed;
  }
  return [];
}

function renderClaimedCoupons() {
  const claimed = getActiveClaimedCoupons();
  const playerName = window.coupleTracker?.getActivePlayer()?.displayName || "Tanu";
  const wrap = c$("#claimedCouponsWrap");
  const list = c$("#claimedCouponsList");
  const badge = c$("#couponSavedBadge");
  if (badge) badge.textContent = `${claimed.length} claimed (${playerName})`;
  if (!wrap || !list) return;
  const wrapLabel = c$(".compact-label", wrap);
  if (wrapLabel) wrapLabel.textContent = `${playerName.toUpperCase()}'S CLAIMED WALLET`;
  wrap.hidden = claimed.length === 0;
  window.safeReplaceChildren(
    list,
    ...claimed.map(id => {
      const item = loveCoupons.find(c => c.id === id);
      if (!item) return document.createTextNode("");
      const chip = document.createElement("div");
      chip.className = "claimed-coupon-chip";
      chip.innerHTML = `<span>${item.emoji}</span><strong>${item.title}</strong>`;
      return chip;
    })
  );
}

function paintScratchFoil(canvas) {
  const ctx = canvas.getContext("2d");
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = Math.max(260, Math.round(rect.width || 420));
  const h = Math.max(175, Math.round(rect.height || 205));
  canvas.width = w;
  canvas.height = h;

  ctx.globalCompositeOperation = "source-over";
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#e6c6b8");
  grad.addColorStop(0.48, "#d4a69c");
  grad.addColorStop(1, "#c4948e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle sparkle dots on foil
  ctx.fillStyle = "rgba(255, 250, 245, 0.36)";
  for (let i = 0; i < 42; i++) {
    const x = (i * 73) % w;
    const y = (i * 47) % h;
    ctx.beginPath();
    ctx.arc(x, y, (i % 3) + 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dashed ticket border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 5]);
  ctx.strokeRect(12, 12, w - 24, h - 24);
  ctx.setLineDash([]);

  // Foil callout text
  const activeName = (window.coupleTracker?.getActivePlayer()?.displayName || "TANU").toUpperCase();
  ctx.fillStyle = "#4d2f2c";
  ctx.textAlign = "center";
  ctx.font = "600 11px 'DM Sans', sans-serif";
  ctx.fillText(`✦ FOR ${activeName} ✦`, w / 2, h / 2 - 14);
  ctx.font = "italic 24px 'Playfair Display', Georgia, serif";
  ctx.fillText("Scratch gently to reveal", w / 2, h / 2 + 16);
}

function loadCouponCard(index) {
  const coupon = loveCoupons[index % loveCoupons.length];
  const playerName = window.coupleTracker?.getActivePlayer()?.displayName || "Tanu";
  const claimed = getActiveClaimedCoupons();
  scratchRevealed = false;
  if (c$("#scratchEmoji")) c$("#scratchEmoji").textContent = coupon.emoji;
  if (c$("#scratchTitle")) c$("#scratchTitle").textContent = coupon.title;
  if (c$("#scratchNote")) c$("#scratchNote").textContent = coupon.note;
  const canvas = c$("#scratchCanvas");
  if (canvas) {
    canvas.style.opacity = "1";
    canvas.style.pointerEvents = "auto";
    paintScratchFoil(canvas);
  }
  const claimBtn = c$("#scratchClaimBtn");
  if (claimBtn) {
    claimBtn.hidden = true;
    const already = claimed.includes(coupon.id);
    claimBtn.disabled = already;
    claimBtn.textContent = already ? `Saved in ${playerName}'s wallet ✓` : `Keep in ${playerName}'s wallet 💌`;
  }
  if (c$("#scratchStatus")) {
    c$("#scratchStatus").textContent = "Rub across the rose-gold foil to reveal your surprise!";
  }
}

function checkScratchProgress(canvas) {
  if (scratchRevealed) return;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  if (!width || !height) return;
  const data = ctx.getImageData(0, 0, width, height).data;
  let cleared = 0;
  const step = 16;
  let total = 0;
  for (let i = 3; i < data.length; i += 4 * step) {
    total++;
    if (data[i] < 90) cleared++;
  }
  if (total > 0 && cleared / total > 0.36) {
    revealCouponCompletely();
  }
}

function revealCouponCompletely() {
  if (scratchRevealed) return;
  scratchRevealed = true;
  const canvas = c$("#scratchCanvas");
  if (canvas) {
    canvas.style.transition = "opacity 0.4s ease";
    canvas.style.opacity = "0";
    canvas.style.pointerEvents = "none";
  }
  const coupon = loveCoupons[currentCouponIdx % loveCoupons.length];
  const playerName = window.coupleTracker?.getActivePlayer()?.displayName || "Tanu";
  const prof = window.coupleTracker?.getActiveProfile();
  if (prof) {
    prof.games.couponsScratched = (prof.games.couponsScratched || 0) + 1;
    window.coupleTracker?.log("Scratch Coupon", `Scratched & revealed “${coupon.title}”`, {
      icon: "🎟️",
      scoreLabel: coupon.emoji
    });
  }
  const claimed = getActiveClaimedCoupons();
  const claimBtn = c$("#scratchClaimBtn");
  if (claimBtn) {
    claimBtn.hidden = false;
    const already = claimed.includes(coupon.id);
    claimBtn.disabled = already;
    claimBtn.textContent = already ? `Saved in ${playerName}'s wallet ✓` : `Keep in ${playerName}'s wallet 💌`;
  }
  if (c$("#scratchStatus")) {
    c$("#scratchStatus").textContent = "Tada! Screenshot or save it to your wallet — no expiry date 💖";
  }
  cBurstCuteEmojis(16);
}

function initScratchCanvas(resetCoupon = true) {
  const canvas = c$("#scratchCanvas");
  if (!canvas) return;
  if (resetCoupon || !scratchInitialized) {
    scratchInitialized = true;
    loadCouponCard(currentCouponIdx);
  } else if (!scratchRevealed) {
    paintScratchFoil(canvas);
  }
}

(() => {
  const canvas = c$("#scratchCanvas");
  if (!canvas) return;

  const scratchAt = (clientX, clientY) => {
    if (scratchRevealed) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
  };

  if ("PointerEvent" in window) {
    canvas.addEventListener("pointerdown", e => {
      isScratching = true;
      canvas.setPointerCapture?.(e.pointerId);
      scratchAt(e.clientX, e.clientY);
    });
    canvas.addEventListener("pointermove", e => {
      if (!isScratching) return;
      scratchAt(e.clientX, e.clientY);
      checkScratchProgress(canvas);
    });
    const endScratch = () => {
      if (!isScratching) return;
      isScratching = false;
      checkScratchProgress(canvas);
    };
    canvas.addEventListener("pointerup", endScratch);
    canvas.addEventListener("pointercancel", endScratch);
  } else {
    canvas.addEventListener("mousedown", e => {
      isScratching = true;
      scratchAt(e.clientX, e.clientY);
    });
    window.addEventListener("mousemove", e => {
      if (!isScratching) return;
      scratchAt(e.clientX, e.clientY);
      checkScratchProgress(canvas);
    });
    window.addEventListener("mouseup", () => {
      if (!isScratching) return;
      isScratching = false;
      checkScratchProgress(canvas);
    });
    canvas.addEventListener("touchstart", e => {
      e.preventDefault();
      isScratching = true;
      const t = e.touches[0];
      if (t) scratchAt(t.clientX, t.clientY);
    }, { passive: false });
    canvas.addEventListener("touchmove", e => {
      if (!isScratching) return;
      e.preventDefault();
      const t = e.touches[0];
      if (t) scratchAt(t.clientX, t.clientY);
      checkScratchProgress(canvas);
    }, { passive: false });
    canvas.addEventListener("touchend", () => {
      if (!isScratching) return;
      isScratching = false;
      checkScratchProgress(canvas);
    });
  }

  c$("#scratchNextBtn")?.addEventListener("click", () => {
    currentCouponIdx = (currentCouponIdx + 1) % loveCoupons.length;
    loadCouponCard(currentCouponIdx);
  });

  c$("#scratchClaimBtn")?.addEventListener("click", () => {
    const coupon = loveCoupons[currentCouponIdx % loveCoupons.length];
    const playerName = window.coupleTracker?.getActivePlayer()?.displayName || "Tanu";
    const prof = window.coupleTracker?.getActiveProfile();
    if (prof) {
      if (!Array.isArray(prof.games.couponsClaimed)) prof.games.couponsClaimed = [];
      if (!prof.games.couponsClaimed.includes(coupon.id)) {
        prof.games.couponsClaimed.push(coupon.id);
        window.coupleTracker?.log("Coupon Claimed", `Saved voucher “${coupon.title}” to wallet`, {
          icon: "💝",
          scoreLabel: `${prof.games.couponsClaimed.length} saved`
        });
        cBurstCuteEmojis(10);
      }
    }
    renderClaimedCoupons();
    c$("#scratchClaimBtn").disabled = true;
    c$("#scratchClaimBtn").textContent = `Saved in ${playerName}'s wallet ✓`;
  });
  renderClaimedCoupons();
})();

/* ==========================================
   GAME 03: CATCH MY RUNAWAY HEART 💗
   ========================================== */
let cScore = 0;
let cSeconds = 15;
let cRunning = false;
let cClock = null;
let cIsGolden = false;
function updateCatchBestUI() {
  const best = window.coupleTracker?.getActiveProfile()?.games?.catchBestScore || 0;
  const name = window.coupleTracker?.getActivePlayer()?.displayName;
  if (c$("#compactCatchBest")) {
    c$("#compactCatchBest").textContent = `Best: ${best}${name ? ` (${name})` : ""}`;
  }
}
updateCatchBestUI();
const cArena = c$("#compactCatchArena");
const cHeart = c$("#compactCatchHeart");
const cHeartSprites = ["💗", "💖", "💘", "💝", "💕"];

function cMove() {
  cIsGolden = Math.random() < 0.22;
  cHeart.textContent = cIsGolden ? "🌟" : cHeartSprites[Math.floor(Math.random() * cHeartSprites.length)];
  cHeart.classList.toggle("is-golden", cIsGolden);
  cHeart.style.left = `${12 + Math.random() * Math.max(1, cArena.clientWidth - 62)}px`;
  cHeart.style.top = `${12 + Math.random() * Math.max(1, cArena.clientHeight - 62)}px`;
}

c$("#compactStartCatch")?.addEventListener("click", () => {
  if (cRunning) return;
  cRunning = true;
  cSeconds = 15;
  cScore = 0;
  c$("#compactCatchScore").textContent = "0";
  c$("#compactCatchCombo").textContent = "";
  c$("#compactCatchTimer").textContent = "15 sec";
  c$("#compactCatchHint").hidden = true;
  cHeart.hidden = false;
  c$("#compactCatchResult").textContent = "";
  c$("#compactStartCatch").textContent = "Catching…";
  cMove();
  cClock = setInterval(() => {
    cSeconds--;
    c$("#compactCatchTimer").textContent = `${cSeconds} sec`;
    if (cSeconds <= 0) {
      clearInterval(cClock);
      cRunning = false;
      cHeart.hidden = true;
      c$("#compactCatchHint").hidden = false;
      c$("#compactStartCatch").textContent = "Play again ↻";
      const prof = window.coupleTracker?.getActiveProfile();
      const playerName = window.coupleTracker?.getActivePlayer()?.displayName || "You";
      if (prof) {
        prof.games.catchGamesPlayed = (prof.games.catchGamesPlayed || 0) + 1;
        prof.games.catchLastScore = cScore;
        if (cScore > (prof.games.catchBestScore || 0)) {
          prof.games.catchBestScore = cScore;
        }
        window.coupleTracker?.log("Catch My Heart", `Scored ${cScore} points in 15 seconds`, {
          icon: "💗",
          scoreLabel: `${cScore} pts`
        });
      }
      updateCatchBestUI();
      c$("#compactCatchResult").textContent =
        cScore >= 16
          ? `${playerName} scored ${cScore} pts! My heart never stood a chance 💖`
          : cScore >= 9
            ? `${playerName} scored ${cScore} pts — caught me fair and square 🥰`
            : `${playerName} scored ${cScore} pts — saved to scoreboard! Rematch?`;
      if (cScore >= 10) cBurstCuteEmojis(15);
    }
  }, 1000);
});

cHeart?.addEventListener("click", event => {
  event.stopPropagation();
  if (!cRunning) return;
  const pts = cIsGolden ? 3 : 1;
  cScore += pts;
  c$("#compactCatchScore").textContent = String(cScore);
  c$("#compactCatchCombo").textContent = cIsGolden ? "+3 golden! ✨" : "";
  window.safeAnimate?.(
    cHeart,
    [{ transform: "scale(0.65)" }, { transform: "scale(1.28)" }, { transform: "scale(1)" }],
    { duration: 210 }
  );
  cMove();
});

/* ==========================================
   THE LITTLE LOVE JAR (NOTES ROOM) 🏺💌
   ========================================== */
const jarReasons = [
  "The way a little conversation with you can turn my whole day around.",
  "How your smile makes every single photo my new favourite photo.",
  "Because doing absolutely nothing with you still feels like the best plan.",
  "The way my phone lighting up with your name makes me grin like an idiot.",
  "How kind, warm, and effortlessly lovely you are without even trying.",
  "Because every future daydream I have looks 100x better with you in it.",
  "The way you can make me laugh even when I’m trying to act serious.",
  "How safe, calm, and happy it feels just being on your team.",
  "Because I still get butterflies — and I hope that never stops.",
  "Every little habit, expression, and giggle that is uniquely Tanu.",
  "How you turned ordinary days into memories I want to keep forever.",
  "Because you’re my best friend and my favourite person all in one.",
  "The way I catch myself smiling randomly just thinking about you.",
  "Because out of everyone in the world, I get to call you mine. ♡"
];
let jarIndex = 0;

function pullNextJarNote() {
  jarIndex = (jarIndex + 1) % jarReasons.length;
  const slip = c$("#jarReasonSlip");
  const counter = c$("#jarSlipCounter");
  const jar = c$("#loveJarBtn");
  if (jar) {
    window.safeAnimate?.(
      jar,
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-7deg) scale(1.04)" },
        { transform: "rotate(6deg) scale(1.04)" },
        { transform: "rotate(-3deg)" },
        { transform: "rotate(0deg)" }
      ],
      { duration: 460, easing: "ease-in-out" }
    );
  }
  if (slip) {
    slip.textContent = `“${jarReasons[jarIndex]}”`;
    window.safeAnimate?.(
      slip,
      [
        { opacity: 0, transform: "translateY(10px) rotate(-1deg)" },
        { opacity: 1, transform: "translateY(0) rotate(0deg)" }
      ],
      { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
    );
  }
  if (counter) {
    counter.textContent = `Note ${String(jarIndex + 1).padStart(2, "0")} of ${jarReasons.length}`;
  }
  const prof = window.coupleTracker?.getActiveProfile();
  if (prof) {
    prof.interactions.jarNotesPulled += 1;
    window.coupleTracker?.log("Reason Jar", `Pulled reason slip #${jarIndex + 1} from the jar`, { icon: "🏺" });
  }
}

c$("#pullJarSlipBtn")?.addEventListener("click", pullNextJarNote);
c$("#loveJarBtn")?.addEventListener("click", pullNextJarNote);
c$("#loveJarBtn")?.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    pullNextJarNote();
  }
});

/* ==========================================
   DELICATE TAP-SPARKLE MICRO-INTERACTION ✨
   ========================================== */
document.addEventListener("pointerdown", event => {
  if (event.target.closest("button, a, input, dialog, #music-player, canvas, #siteLockGate")) return;
  const glyphs = ["💗", "✨", "♡", "🌸"];
  for (let i = 0; i < 3; i++) {
    const spark = document.createElement("span");
    spark.className = "cute-click-spark";
    spark.setAttribute("aria-hidden", "true");
    spark.textContent = glyphs[(i + Math.floor(Math.random() * glyphs.length)) % glyphs.length];
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    spark.style.setProperty("--spark-dx", `${(Math.random() - 0.5) * 56}px`);
    spark.style.setProperty("--spark-dy", `${-26 - Math.random() * 38}px`);
    document.body.appendChild(spark);
    const removeSpark = () => { if (spark.parentNode) spark.remove(); };
    spark.addEventListener("animationend", removeSpark, { once: true });
    setTimeout(removeSpark, 900);
  }
});
let cWishes = [];
const cDefault = [
  "Watch the sky change colours at sunset.",
  "Take a long drive with our favourite songs.",
  "Find a small place neither of us has been."
];
try {
  cWishes =
    JSON.parse(window.safeStorage?.get("tanu-together-list") || "null") ||
    cDefault.map(text => ({ text, done: false, author: "Abhishek" }));
} catch {
  cWishes = cDefault.map(text => ({ text, done: false, author: "Abhishek" }));
}
function cSave() {
  window.safeStorage?.set("tanu-together-list", JSON.stringify(cWishes));
}
function cRenderWishes() {
  const list = c$("#compactWishList");
  if (!list) return;
  c$("#compactWishCount").textContent = cWishes.length;
  window.safeReplaceChildren(
    list,
    ...cWishes.map((wish, index) => {
      const item = document.createElement("li");
      item.className = wish.done ? "done" : "";
      const checkBtn = document.createElement("button");
      checkBtn.type = "button";
      checkBtn.className = "compact-check";
      checkBtn.setAttribute("aria-label", `Toggle ${wish.text}`);
      checkBtn.textContent = wish.done ? "✓" : "";

      const textWrap = document.createElement("span");
      textWrap.className = "wish-text-wrap";
      const textSpan = document.createElement("span");
      textSpan.textContent = wish.text;
      textWrap.appendChild(textSpan);
      if (wish.author) {
        const authorBadge = document.createElement("small");
        authorBadge.className = "wish-author-tag";
        authorBadge.textContent = wish.done && wish.completedBy ? `added by ${wish.author} · ✓ ${wish.completedBy}` : `by ${wish.author}`;
        textWrap.appendChild(authorBadge);
      }

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "compact-delete";
      delBtn.setAttribute("aria-label", `Remove ${wish.text}`);
      delBtn.textContent = "Remove";

      checkBtn.addEventListener("click", () => {
        const nowDone = !cWishes[index].done;
        cWishes[index].done = nowDone;
        const activeName = window.coupleTracker?.getActivePlayer()?.displayName;
        if (nowDone && activeName) {
          cWishes[index].completedBy = activeName;
          const prof = window.coupleTracker?.getActiveProfile();
          if (prof) prof.interactions.wishesCompleted += 1;
          window.coupleTracker?.log("Our List", `Completed plan: “${cWishes[index].text}”`, { icon: "✅" });
        }
        cSave();
        cRenderWishes();
      });
      delBtn.addEventListener("click", () => {
        const removed = cWishes[index];
        cWishes.splice(index, 1);
        if (removed) {
          window.coupleTracker?.log("Our List", `Removed plan: “${removed.text}”`, { icon: "🗑️" });
        }
        cSave();
        cRenderWishes();
      });
      item.append(checkBtn, textWrap, delBtn);
      return item;
    })
  );
}
c$("#compactWishForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const input = c$("#compactWishInput");
  const text = input.value.trim();
  if (!text) return;
  const author = window.coupleTracker?.getActivePlayer()?.displayName || "Us";
  cWishes.unshift({ text, done: false, author });
  input.value = "";
  const prof = window.coupleTracker?.getActiveProfile();
  if (prof) prof.interactions.wishesAdded += 1;
  window.coupleTracker?.log("Our List", `Added a new plan: “${text}”`, { icon: "📝" });
  cSave();
  cRenderWishes();
});
c$$("[data-compact-idea]").forEach(button =>
  button.addEventListener("click", () => {
    c$("#compactWishInput").value = button.dataset.compactIdea;
    c$("#compactWishInput").focus();
  })
);
cRenderWishes();

/* ==========================================
   COUPLE SCOREBOARD & WHOLE ACTIVITY FEED 🏆
   ========================================== */
let activeTimelineFilter = "all";

function formatRelativeTime(iso) {
  if (!iso) return "Not played yet";
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 15) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function renderCoupleScoreboard() {
  const tracker = window.coupleTracker;
  if (!tracker) return;
  const store = tracker.getStore();
  const active = tracker.getActivePlayer();
  const statusPill = c$("#currentPlayerStatusPill");
  if (statusPill) {
    statusPill.textContent = active ? `Unlocked as ${active.avatar} ${active.displayName}` : "Locked";
  }

  const grid = c$("#scoreboardGrid");
  if (grid) {
    const cards = ["tanu", "abhishek"].map(key => {
      const p = store.players[key];
      const isCurrent = active?.key === key;
      const avatar = key === "tanu" ? "👸🏻" : "🤴🏻";
      const card = document.createElement("article");
      card.className = `player-score-card${isCurrent ? " is-active-player" : ""}`;
      const totalActions = store.activities.filter(a => a.playerKey === key).length;
      card.innerHTML = `
        <div class="psc-head">
          <div class="psc-identity">
            <span class="psc-avatar">${avatar}</span>
            <div>
              <strong>${p.displayName}</strong>
              <small>${p.lastSeenAt ? `Active ${formatRelativeTime(p.lastSeenAt)}` : "Waiting to unlock"}</small>
            </div>
          </div>
          ${isCurrent ? `<span class="psc-playing-tag">Playing now</span>` : `<span class="psc-visits-tag">${p.unlockCount} visits</span>`}
        </div>
        <div class="psc-stats-grid">
          <div class="psc-stat">
            <span>🃏 Memory Match</span>
            <strong>${p.games.memoryBestMoves ? `${p.games.memoryBestMoves} moves` : "—"}</strong>
            <small>${p.games.memoryWins || 0} wins</small>
          </div>
          <div class="psc-stat">
            <span>💗 Catch Heart</span>
            <strong>${p.games.catchBestScore || 0} pts</strong>
            <small>${p.games.catchGamesPlayed || 0} rounds</small>
          </div>
          <div class="psc-stat">
            <span>🌡️ Love Meter</span>
            <strong>${p.games.loveMeterLatest ?? 500} / 1000</strong>
            <small>Peak: ${p.games.loveMeterMax ?? 500}</small>
          </div>
          <div class="psc-stat">
            <span>🎟️ Love Coupons</span>
            <strong>${(p.games.couponsClaimed || []).length} saved</strong>
            <small>${p.games.couponsScratched || 0} scratched</small>
          </div>
        </div>
        <div class="psc-activity-summary">
          <span>💌 ${p.interactions.notesOpened || 0} notes</span>
          <span>🏺 ${p.interactions.jarNotesPulled || 0} jar slips</span>
          <span>📝 ${p.interactions.wishesAdded || 0} wishes</span>
          <span>✨ ${totalActions} logged actions</span>
        </div>
      `;
      return card;
    });
    window.safeReplaceChildren(grid, ...cards);
  }

  const timeline = c$("#activityTimelineList");
  if (timeline) {
    const filtered = store.activities.filter(
      item => activeTimelineFilter === "all" || item.playerKey === activeTimelineFilter
    );
    if (filtered.length === 0) {
      const empty = document.createElement("li");
      empty.className = "activity-empty";
      empty.textContent = "No recorded moves here yet — play a game or open a note to start the log! ✨";
      window.safeReplaceChildren(timeline, empty);
    } else {
      window.safeReplaceChildren(
        timeline,
        ...filtered.slice(0, 40).map(entry => {
          const li = document.createElement("li");
          li.className = `activity-row player-${entry.playerKey}`;
          const iconSpan = document.createElement("span");
          iconSpan.className = "activity-icon";
          iconSpan.textContent = entry.icon || "✨";

          const mainDiv = document.createElement("div");
          mainDiv.className = "activity-main";
          const topLine = document.createElement("div");
          topLine.className = "activity-topline";
          const who = document.createElement("strong");
          who.textContent = entry.playerName;
          const cat = document.createElement("span");
          cat.className = "activity-cat-pill";
          cat.textContent = entry.category;
          topLine.append(who, cat);
          if (entry.scoreLabel) {
            const scoreBadge = document.createElement("em");
            scoreBadge.className = "activity-score-badge";
            scoreBadge.textContent = entry.scoreLabel;
            topLine.appendChild(scoreBadge);
          }
          const desc = document.createElement("p");
          desc.textContent = entry.summary;
          mainDiv.append(topLine, desc);

          const timeSpan = document.createElement("time");
          timeSpan.className = "activity-time";
          timeSpan.textContent = formatRelativeTime(entry.timestamp);

          li.append(iconSpan, mainDiv, timeSpan);
          return li;
        })
      );
    }
  }
}

c$$(".activity-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    activeTimelineFilter = btn.dataset.activityFilter || "all";
    c$$(".activity-filter-btn").forEach(x => x.classList.toggle("active", x === btn));
    renderCoupleScoreboard();
  });
});

function syncAllPlayerDependentUI() {
  const prof = window.coupleTracker?.getActiveProfile();
  const player = window.coupleTracker?.getActivePlayer();
  if (player) {
    const heroH1 = c$("#room-home .compact-copy h1");
    if (heroH1) {
      heroH1.innerHTML =
        player.key === "abhishek"
          ? `Hey Abhishek,<br><em>welcome to Tanu’s world.</em>`
          : `Hey Tanu,<br><em>you make life lovely.</em>`;
    }
  }
  if (prof && cMeter) {
    cUpdateLoveMeter(prof.games.loveMeterLatest ?? 500);
  }
  updateMemoryStatsUI();
  updateCatchBestUI();
  renderClaimedCoupons();
  loadCouponCard(currentCouponIdx);
  renderCoupleScoreboard();
}

window.addEventListener("couple-player-changed", syncAllPlayerDependentUI);
window.addEventListener("couple-activity-updated", renderCoupleScoreboard);
syncAllPlayerDependentUI();
