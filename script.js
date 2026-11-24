const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

// Global theme animation intervals
let themeAnimationInterval = null;
let envelopeInterval = null;
let currentTheme = "rose";

/* ============================================================================
   UNIVERSAL CROSS-BROWSER / CROSS-ENV COMPATIBILITY HELPERS
   ============================================================================ */
const memoryStorageFallback = new Map();
const safeStorage = {
  get(key, preferSession = false) {
    try {
      const primary = preferSession ? window.sessionStorage : window.localStorage;
      const val = primary.getItem(key);
      if (val !== null) return val;
    } catch {}
    try {
      const secondary = preferSession ? window.localStorage : window.sessionStorage;
      const val = secondary.getItem(key);
      if (val !== null) return val;
    } catch {}
    return memoryStorageFallback.has(key) ? memoryStorageFallback.get(key) : null;
  },
  set(key, value, preferSession = false) {
    const str = String(value);
    memoryStorageFallback.set(key, str);
    try {
      const primary = preferSession ? window.sessionStorage : window.localStorage;
      primary.setItem(key, str);
    } catch {
      try {
        window.localStorage.setItem(key, str);
      } catch {}
    }
  },
  remove(key, preferSession = false) {
    memoryStorageFallback.delete(key);
    try {
      (preferSession ? window.sessionStorage : window.localStorage).removeItem(key);
    } catch {}
  }
};

function safeAnimate(el, keyframes, options) {
  if (!el || typeof el.animate !== "function") return null;
  try {
    return el.animate(keyframes, options);
  } catch {
    return null;
  }
}

function safeOpenDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === "function") {
    try {
      if (!dialog.open) dialog.showModal();
      return;
    } catch {}
  }
  dialog.setAttribute("open", "");
}

function safeCloseDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === "function") {
    try {
      if (dialog.open) dialog.close();
      else dialog.removeAttribute("open");
      return;
    } catch {}
  }
  dialog.removeAttribute("open");
}

function safeReplaceChildren(parent, ...nodes) {
  if (!parent) return;
  if (typeof parent.replaceChildren === "function") {
    parent.replaceChildren(...nodes);
  } else {
    parent.innerHTML = "";
    nodes.forEach(n => {
      if (n) parent.appendChild(n);
    });
  }
}

window.safeStorage = safeStorage;
window.safeAnimate = safeAnimate;
window.safeOpenDialog = safeOpenDialog;
window.safeCloseDialog = safeCloseDialog;
window.safeReplaceChildren = safeReplaceChildren;

/* ============================================================================
   COUPLE LOCK GATE & PLAYER ACTIVITY STORE (Tanu & Abhishek · Passcode 4000)
   ============================================================================ */
const ALLOWED_PLAYERS = {
  tanu: { key: "tanu", displayName: "Tanu", avatar: "👸🏻", role: "My Favourite Human" },
  abhishek: { key: "abhishek", displayName: "Abhishek", avatar: "🤴🏻", role: "Your Personal Idiot" }
};
const SECRET_PASSCODE = "4000";
const ACTIVITY_STORAGE_KEY = "for-you-always-couple-store-v1";
const ACTIVE_SESSION_KEY = "for-you-always-unlocked-player";

function createDefaultPlayerProfile(key, displayName) {
  return {
    key,
    displayName,
    unlockCount: 0,
    lastSeenAt: null,
    games: {
      memoryBestMoves: null,
      memoryWins: 0,
      memoryLastMoves: null,
      catchBestScore: 0,
      catchGamesPlayed: 0,
      catchLastScore: null,
      loveMeterLatest: 500,
      loveMeterMax: 500,
      couponsScratched: 0,
      couponsClaimed: []
    },
    interactions: {
      notesOpened: 0,
      jarNotesPulled: 0,
      wishesAdded: 0,
      wishesCompleted: 0,
      photosLiked: 0,
      hugsSent: 0
    }
  };
}

function loadCoupleStore() {
  const fallback = {
    players: {
      tanu: createDefaultPlayerProfile("tanu", "Tanu"),
      abhishek: createDefaultPlayerProfile("abhishek", "Abhishek")
    },
    activities: []
  };
  try {
    const raw = JSON.parse(safeStorage.get(ACTIVITY_STORAGE_KEY) || "null");
    if (!raw || typeof raw !== "object") return fallback;
    for (const k of ["tanu", "abhishek"]) {
      const base = createDefaultPlayerProfile(k, ALLOWED_PLAYERS[k].displayName);
      const saved = raw.players?.[k] || {};
      fallback.players[k] = {
        ...base,
        ...saved,
        games: { ...base.games, ...(saved.games || {}) },
        interactions: { ...base.interactions, ...(saved.interactions || {}) }
      };
    }
    if (Array.isArray(raw.activities)) {
      fallback.activities = raw.activities.slice(0, 120);
    }
  } catch {}
  return fallback;
}

let coupleStore = loadCoupleStore();
let activePlayerKey = null;
try {
  const savedSession = safeStorage.get(ACTIVE_SESSION_KEY, true);
  if (savedSession && ALLOWED_PLAYERS[savedSession]) {
    activePlayerKey = savedSession;
  }
} catch {}

function saveCoupleStore() {
  safeStorage.set(ACTIVITY_STORAGE_KEY, JSON.stringify(coupleStore));
}

function getActivePlayer() {
  return ALLOWED_PLAYERS[activePlayerKey] || null;
}

function getActiveProfile() {
  const player = getActivePlayer();
  return player ? coupleStore.players[player.key] : null;
}

function recordPlayerActivity(category, summary, meta = {}) {
  const player = getActivePlayer();
  if (!player) return;
  const profile = coupleStore.players[player.key];
  const nowIso = new Date().toISOString();
  profile.lastSeenAt = nowIso;
  coupleStore.activities.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    playerKey: player.key,
    playerName: player.displayName,
    category,
    summary,
    scoreLabel: meta.scoreLabel || null,
    icon: meta.icon || "✨",
    timestamp: nowIso
  });
  if (coupleStore.activities.length > 120) {
    coupleStore.activities.length = 120;
  }
  saveCoupleStore();
  window.dispatchEvent(new CustomEvent("couple-activity-updated", { detail: { store: coupleStore, activePlayer: player } }));
}

window.coupleTracker = {
  getActivePlayer,
  getActiveProfile,
  getStore: () => coupleStore,
  save: saveCoupleStore,
  log: recordPlayerActivity
};
// Animations are always active across all OS/browser environments
function isReducedMotion() {
  return false;
}
// Floating decorations overlay
let floatingOverlay = null;
function getFloatingOverlay() {
  if (!floatingOverlay) {
    floatingOverlay = document.getElementById('floating-overlay');
    if (!floatingOverlay) {
      // Create overlay if missing
      floatingOverlay = document.createElement('div');
      floatingOverlay.id = 'floating-overlay';
      floatingOverlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(floatingOverlay);
console.log('Floating overlay created and appended to body');
    }
  }
console.log('Floating overlay element:', floatingOverlay);
  return floatingOverlay;
}

const letterDialog = $("#letterDialog");
const readDialog = $("#readDialog");
const lightbox = $("#lightbox");
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
progressBar.setAttribute("aria-hidden", "true");
document.body.append(progressBar);

let scrollQueued = false;
window.addEventListener("scroll", () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${maxScroll > 0 ? window.scrollY / maxScroll : 0})`;
    scrollQueued = false;
  });
}, { passive: true });

$("#openLetter")?.addEventListener("click", () => safeOpenDialog(letterDialog));
$$("[data-close]").forEach(button => button.addEventListener("click", () => safeCloseDialog(button.closest("dialog"))));
[letterDialog, readDialog, lightbox].forEach(dialog => dialog?.addEventListener("click", e => {
  if (e.target === dialog) safeCloseDialog(dialog);
}));
$("#backToTop")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const reasons = [
  "The way a little conversation with you can turn my whole day around.",
  "How even the smallest message from you leaves me smiling at my phone.",
  "I get to discover a new little thing about you all the time.",
  "You make the future feel like somewhere I can't wait to go.",
  "I love the quiet happiness of being right there beside you.",
  "I get to choose you in the ordinary days, too. That's my favorite part."
];
let reasonIndex = 0;
$("#nextReason").addEventListener("click", () => {
  reasonIndex = (reasonIndex + 1) % reasons.length;
  const target = $("#reasonText");
  target.animate([{opacity:0, transform:"translateY(8px)"},{opacity:1,transform:"translateY(0)"}], {duration:350});
  target.textContent = reasons[reasonIndex];
});

const letters = {
  miss: {
    kicker: "open when you miss me",
    title: "Close, even from far away.",
    message: "If I were there, I'd probably pull you into a hug and let the world be quiet for a little while. Until I can do that, let this remind you that you're on my mind in the middle of ordinary things, too. We may not be in the same place every moment, but I'm always looking forward to the next one we get together."
  },
  hard: {
    kicker: "open when the day feels heavy",
    title: "Take a breath, love.",
    message: "You don't have to have everything figured out today. Rest if you need to. Tell me about it if you want to. You never have to pretend to be okay just to make things easier for anyone. I want to know your happy days, but I want to make space for the difficult ones, too."
  },
  doubt: {
    kicker: "open when you need a reminder",
    title: "You matter to me.",
    message: "I hope you never feel you have to earn kindness or make yourself smaller to be loved. I want to keep learning who you are, what makes you happy, what worries you, what you dream about, and all the little things in between. I'm grateful that our paths crossed, and I'm glad we're getting to know each other."
  },
  future: {
    kicker: "open on our wedding day",
    title: "Look how far our beginning brought us.",
    message: "Remember when this was all so new? We were still learning each other's stories, favourite songs, and little habits. Today, we get to begin a new chapter — not because we know everything about each other, but because we're ready to keep learning. I hope our life is full of patience, laughter, friendship, and a love that feels like home."
  }
};
$$("[data-letter]").forEach(card => card.addEventListener("click", () => {
  const content = letters[card.dataset.letter];
  $("#readKicker").textContent = content.kicker;
  $("#readTitle").textContent = content.title;
  $("#readMessage").textContent = content.message;
  const prof = getActiveProfile();
  if (prof) {
    prof.interactions.notesOpened += 1;
    recordPlayerActivity("Note", `Opened envelope: “${content.title}”`, { icon: "💌" });
  }
  safeOpenDialog(readDialog);
}));

// Mobile navigation
const menuToggle = $(".menu-toggle");
const nav = $(".nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuToggle.textContent = open ? "Close" : "Menu";
});
$$(".nav a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  menuToggle.textContent = "Menu";
}));

// Gentle reveal on scroll; gracefully falls back if IntersectionObserver is unavailable.
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  $$(".reveal").forEach(el => observer.observe(el));
} else {
  $$(".reveal").forEach(el => el.classList.add("visible"));
}

// A tiny, locally hosted scrapbook. All original pictures live in assets/photos.
const memories = [
  ["together/together2.webp", "Our favourite kind of together", "together"],
  ["together/together3.webp", "One of those keep-forever photos", "together"],
  ["together/together4.webp", "Looking very much like my favourite people", "together"],
  ["together/together5.webp", "A little moment, a lot of happy", "together"],
  ["together/together6.webp", "A day with my favourite person", "together"],
  ["together/whatsapp-image-2026-10-20-at-10-09-20-pm.webp", "Us, out making another memory", "together"],
  ["together/whatsapp-image-2026-10-20-at-10-09-53-pm.webp", "Right where I want to be", "together"],
  ["together/whatsapp-image-2026-10-20-at-10-09-56-pm.webp", "My forever plus-one", "together"],
  ["together/date.webp", "A sweet little date", "together"],
  ["together/bouquet-that-i-gifted.webp", "Flowers for my favourite flower", "together"],
  ["tanu/tanu2.webp", "Tanu being effortlessly adorable", "tanu"],
  ["tanu/tanu3.webp", "The smile that gets me every time", "tanu"],
  ["tanu/tanu4.webp", "Main-character energy", "tanu"],
  ["tanu/tanu5.webp", "A whole heart-eyes moment", "tanu"],
  ["tanu/whatsapp-image-2026-10-20-at-10-09-57-pm.webp", "My pretty girl", "tanu"],
  ["tanu/whatsapp-image-2026-10-20-at-10-09-58-pm.webp", "Tanu, being Tanu", "tanu"],
  ["tanu/whatsapp-image-2026-10-20-at-10-10-00-pm.webp", "A favourite face, always", "tanu"],
  ["tanu/bangles1.webp", "A little sparkle for a lovely day", "tanu"],
  ["tanu/bangles2.webp", "The bangles deserved their own moment", "tanu"],
  ["abhishek/abhishek4.webp", "Abhishek, pretending this is a candid", "abhishek"],
  ["abhishek/abishek2.webp", "Your personal ride-or-die", "abhishek"],
  ["abhishek/whatsapp-image-2026-10-20-at-10-09-57-pm.webp", "Before Tanu stole the camera roll", "abhishek"],
  ["tanu/childhood-tanu.webp", "Little Tanu with the biggest future", "childhood"],
  ["tanu/child2.webp", "Tiny Tanu, already a cutie", "childhood"],
  ["abhishek/child.webp", "Tiny Abhishek, same big smile", "childhood"],
  ["abhishek/chil2.webp", "Little Abhishek, reporting for cuteness duty", "childhood"],
  ["gifts/birthday.webp", "A birthday surprise, just because", "together"],
  ["tanu/tanu6.jpeg", "Another adorable Tanu moment", "tanu"],
  ["tanu/tanu7.jpeg", "My beautiful girl", "tanu"],
  ["tanu/tanu8.jpeg", "Tanu's lovely smile", "tanu"],
  ["tanu/tanu9.jpeg", "Cutie pie", "tanu"],
  ["tanu/tanu10.jpeg", "Absolutely stunning", "tanu"],
  ["together/main.jpeg", "A special moment together", "together"],
  ["abhishek/abhishek5.jpeg", "Another goofy picture of me", "me"],
  // Engagement photos
  ["together/together2.webp", "Our beautiful engagement moment", "together"],
  ["together/together3.webp", "Forever starts here", "together"],
  ["together/together4.webp", "The beginning of our forever", "together"],
  ["together/together5.webp", "Happiness captured", "together"],
  ["together/together6.webp", "Together as one", "together"],
  ["together/bouquet-that-i-gifted.webp", "The bouquet that started it all", "together"],
  ["together/date.webp", "A date to remember", "together"],
  ["together/whatsapp-image-2026-10-20-at-10-09-20-pm.webp", "Special memories", "together"],
  ["together/whatsapp-image-2026-10-20-at-10-09-53-pm.webp", "Cherished moments", "together"],
  ["together/whatsapp-image-2026-10-20-at-10-09-56-pm.webp", "Our love story", "together"],
  ["together/engagement1.jpeg", "Two hearts, one promise, and a beautiful forever beginning", "together"],
  ["together/engagement2.jpeg", "And just like that, forever had a beginning", "together"],

];

const gallery = $("#photoGrid");
function renderGallery(filter = "all") {
  gallery.replaceChildren(...memories.filter(([, , group]) => filter === "all" || group === filter).map(([file, caption, group], index) => {
    const card = document.createElement("button");
    card.className = `memory-card reveal ${index % 7 === 1 ? "memory-tall" : ""} ${index % 7 === 4 ? "memory-wide" : ""}`;
    card.type = "button";
    card.dataset.caption = caption;
    card.dataset.group = group;
    const img = document.createElement("img");
    img.src = `assets/photos/${file}`;
    img.alt = caption;
    img.loading = "lazy";
    const label = document.createElement("span");
    label.className = "photo-caption";
    label.textContent = caption;
    const number = document.createElement("small");
    number.textContent = String(index + 1).padStart(2, "0");
    card.append(img, label, number);
    requestAnimationFrame(() => card.classList.add("visible"));
    return card;
  }));
}
renderGallery();
$$(".gallery-tab").forEach(tab => tab.addEventListener("click", () => {
  $$(".gallery-tab").forEach(item => item.classList.toggle("active", item === tab));
  renderGallery(tab.dataset.filter);
}));
gallery.addEventListener("click", event => {
  const card = event.target.closest(".memory-card");
  if (!card) return;
  const img = $("img", card);
  $("#lightboxImage").src = img.src;
  $("#lightboxCaption").textContent = card.dataset.caption;
  lightbox.showModal();
});

// The very serious love meter has an entirely unscientific answer.

/* ==========================================
   TANU'S VERY SERIOUS LOVE AUDIT 💗
   Rating: 0 to 1000
   ========================================== */

// Skip legacy features if compact experience is active
const compactExperience = document.getElementById("compactExperience");
const isCompactMode = compactExperience && !compactExperience.hidden;

const meter = $("#loveMeter");
const meterMessage = $("#meterMessage");
const meterNumber = $("#meterNumber");

const meterLines = [
  {
    min: 0,
    max: 100,
    message: "Oh. So we're just acquaintances now? 🥲"
  },
  {
    min: 101,
    max: 300,
    message: "Okay, at least you know my name. 😭"
  },
  {
    min: 301,
    max: 500,
    message: "Hmm. I shall accept this temporary affection. 🤨"
  },
  {
    min: 501,
    max: 700,
    message: "Look who's getting attached! 😏"
  },
  {
    min: 701,
    max: 900,
    message: "Awww, somebody has a favourite person! 🥰"
  },
  {
    min: 901,
    max: 999,
    message: "999?! What happened to the last 1 point? Explain yourself! 😤"
  },
  {
    min: 1000,
    max: 1000,
    message: "I KNEW IT! YOU'RE OBSESSED WITH ME! 💖"
  }
];

let lastMeterValue = 500;
let maxLoveCelebrated = false;
let maxLoveCooldown = false;

function getLoveMessage(value) {
  return meterLines.find(
    line => value >= line.min && value <= line.max
  )?.message ?? "Love calculation in progress... 💗";
}

function updateLoveMeter(value) {
  // Hard limit: she can never go above 1000.
  value = Math.max(0, Math.min(1000, Number(value)));

  meter.value = String(value);
  meterNumber.textContent = String(value);

  // The slider fill is calculated against 1000.
  meter.style.setProperty(
    "--meter-fill",
    `${(value / 1000) * 100}%`
  );

  meterMessage.textContent = getLoveMessage(value);

  // Animate the score whenever it changes.
  meterNumber.classList.remove("pop");
  void meterNumber.offsetWidth;
  meterNumber.classList.add("pop");

  // Celebrate when she reaches the maximum score.
  if (value === 1000 && !maxLoveCelebrated) {
    maxLoveCelebrated = true;

    burstCuteEmojis(35);

    meterMessage.animate(
      [
        { transform: "scale(1)", opacity: 0.7 },
        { transform: "scale(1.15)", opacity: 1 },
        { transform: "scale(1)", opacity: 1 }
      ],
      {
        duration: 650,
        easing: "ease-out"
      }
    );
  }

  // Reset celebration if she moves away from 1000.
  if (value < 1000) {
    maxLoveCelebrated = false;
  }

  lastMeterValue = value;
}

if (!isCompactMode && meter) {
  meter.addEventListener("input", () => {
    const value = Number(meter.value);

    updateLoveMeter(value);

    // Extra playful reaction at the maximum score.
    if (value === 1000 && !maxLoveCooldown) {
      maxLoveCooldown = true;

      meterMessage.textContent =
        "1000/1000?! BABE, YOU'RE DOWN BAD. 😭💗";

      burstCuteEmojis(20);

      setTimeout(() => {
        maxLoveCooldown = false;
      }, 1800);
    }
  });

  // Initial state
  updateLoveMeter(Number(meter.value));
}


/* ==========================================
   CUTE EMOJI CELEBRATION
   ========================================== */

function burstCuteEmojis(count = 20) {
  const reducedMotion = isReducedMotion();
  // Adjust parameters for reduced motion
  const driftFactor = reducedMotion ? 0.3 : 1;
  const durationFactor = reducedMotion ? 2 : 1;

  const cuteEmojis = [
    "💗",
    "💖",
    "💕",
    "🥺",
    "🫶",
    "💘",
    "😍",
    "😘",
    "🐻",
    "✨"
  ];

  for (let i = 0; i < count; i++) {
    const emoji = document.createElement("span");

    emoji.className = "cute-love-burst";
    emoji.textContent =
      cuteEmojis[Math.floor(Math.random() * cuteEmojis.length)];

    emoji.setAttribute("aria-hidden", "true");

    emoji.style.setProperty(
      "--x",
      `${(Math.random() - 0.5) * 90}vw`
    );

    emoji.style.setProperty(
      "--drift",
      `${(Math.random() - 0.5) * 180 * driftFactor}px`
    );

    emoji.style.setProperty(
      "--spin",
      `${Math.random() * 100 - 50}deg`
    );

    emoji.style.setProperty(
      "--duration",
      `${(1.8 + Math.random() * 1.8) * durationFactor}s`
    );

    emoji.style.left = `${Math.random() * 100}vw`;

    document.body.append(emoji);

    const cleanupMs = Math.ceil((1.8 + 1.8) * durationFactor * 1000) + 400;
    const removeNode = () => { if (emoji.parentNode) emoji.remove(); };
    emoji.addEventListener("animationend", removeNode, { once: true });
    setTimeout(removeNode, cleanupMs);
  }
}


const surprises = ["Tanu, you are my favourite notification.", "I love you more than chai. And that's serious.", "You + me + snacks = a perfect date.", "If hugs were pixels, this whole page would be one big hug.", "Breaking news: Abhishek is still completely smitten."];
$("#surpriseMe").addEventListener("click", event => {
  const button = event.currentTarget;
  button.textContent = surprises[Math.floor(Math.random() * surprises.length)];
  button.classList.add("surprise-revealed");
  burstHearts(18);
});

function burstHearts(count = 12) {
  const reducedMotion = isReducedMotion();
  // Adjust parameters for reduced motion
  const driftFactor = reducedMotion ? 0.3 : 1;
  const durationFactor = reducedMotion ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "burst-heart";
    heart.setAttribute("aria-hidden", "true");
    heart.style.setProperty("--x", `${(Math.random() - 0.5) * 90}vw`);
    heart.style.setProperty("--drift", `${(Math.random() - 0.5) * 140 * driftFactor}px`);
    heart.style.setProperty("--spin", `${Math.random() * 80 - 40}deg`);
    heart.style.setProperty("--duration", `${(1.5 + Math.random() * 1.5) * durationFactor}s`);
    heart.style.left = `${Math.random() * 100}vw`;
    document.body.append(heart);
    heart.addEventListener("animationend", () => heart.remove(), { once: true });
  }
}

// Game 01: a tiny, increasingly chaotic heart-catching challenge.
const catchArena = $("#catchArena");
const catchHeart = $("#catchHeart");
const catchScore = $("#catchScore");
const catchTimer = $("#catchTimer");
const catchHint = $("#catchHint");
const catchResult = $("#catchResult");
let heartsCaught = 0;
let secondsLeft = 15;
let catchClock;
let catchRunning = false;

function moveHeart() {
  const maxLeft = Math.max(0, catchArena.clientWidth - catchHeart.offsetWidth - 10);
  const maxTop = Math.max(0, catchArena.clientHeight - catchHeart.offsetHeight - 10);
  catchHeart.style.left = `${10 + Math.random() * maxLeft}px`;
  catchHeart.style.top = `${10 + Math.random() * maxTop}px`;
  catchHeart.style.setProperty("--wiggle", `${Math.random() > 0.5 ? 1 : -1}`);
}

function finishCatchGame() {
  catchRunning = false;
  window.clearInterval(catchClock);
  catchHeart.hidden = true;
  catchHint.hidden = false;
  catchHint.textContent = "Time for a little victory dance.";
  catchTimer.textContent = "Time!";
  const result = heartsCaught >= 12
    ? "Okay, speedy! My heart never stood a chance."
    : heartsCaught >= 6
      ? "You caught a bunch. I think you caught me first."
      : "I was trying to make that easy for you, promise. Run it back?";
  catchResult.textContent = result;
  $("#startCatch").textContent = "Play again";
  burstHearts(Math.min(25, Math.max(10, heartsCaught + 8)));
}

$("#startCatch").addEventListener("click", () => {
  if (catchRunning) return;
  heartsCaught = 0;
  secondsLeft = 15;
  catchRunning = true;
  catchScore.textContent = "0";
  catchTimer.textContent = "15 sec";
  catchResult.textContent = "";
  catchHint.textContent = "Go go go, Tanu!";
  catchHint.hidden = true;
  $("#startCatch").textContent = "You're doing great";
  catchHeart.hidden = false;
  moveHeart();
  catchClock = window.setInterval(() => {
    secondsLeft -= 1;
    catchTimer.textContent = `${secondsLeft} sec`;
    if (secondsLeft <= 0) finishCatchGame();
  }, 1000);
});

catchHeart.addEventListener("click", () => {
  if (!catchRunning) return;
  heartsCaught += 1;
  catchScore.textContent = String(heartsCaught);
  catchHeart.classList.remove("caught");
  void catchHeart.offsetWidth;
  catchHeart.classList.add("caught");
  moveHeart();
});


// Tanu's first-visit check-in sets the page palette and gives the tour a personal start.
const welcomeDialog = $("#welcomeDialog");
const welcomeSteps = [
  {
    key: "mood",
    question: "How are you feeling today, my love?",
    description: "Pick the emotion that feels most like you right now, and I'll dress this little place around it.",
    choices: [
      { value: "angry", title: "Angry / Annoyed", theme: "sage", themeName: "calm sage" },
      { value: "romantic", title: "Romantic / Lovey-dovey", theme: "rose", themeName: "warm rose" },
      { value: "tense", title: "Tense / Anxious", theme: "plum", themeName: "evening plum" },
      { value: "happy", title: "Happy / Excited", theme: "honey", themeName: "sunlit honey" },
      { value: "sad", title: "Sad / Melancholy", theme: "rose", themeName: "warm rose" },
      { value: "playful", title: "Playful / Silly", theme: "honey", themeName: "sunlit honey" },
      { value: "cozy", title: "Cozy / Comfortable", theme: "sage", themeName: "quiet sage" },
      { value: "dreamy", title: "Dreamy / Thoughtful", theme: "plum", themeName: "evening plum" }
    ]
  },
  {
    key: "feeling",
    question: "And what would feel good right now?",
    description: "I want this to meet you where you are.",
    choices: [
      { value: "cozy", title: "Something cozy" },
      { value: "laugh", title: "Make me laugh" },
      { value: "hug", title: "A little reassurance" },
      { value: "curious", title: "Let me explore" }
    ]
  },
  {
    key: "love",
    question: "How much do you love me today?",
    description: "An extremely official rating, recorded for my records.",
    range: true
  }
];
let welcomeIndex = 0;
let welcomeAnswers = { love: 500 };

function renderWelcomeStep() {
  const step = welcomeSteps[welcomeIndex];
  $("#welcomeStepCount").textContent = `${String(welcomeIndex + 1).padStart(2, "0")} / ${String(welcomeSteps.length).padStart(2, "0")}`;
  $("#welcomeProgress").style.width = `${((welcomeIndex + 1) / welcomeSteps.length) * 100}%`;
  $("#welcomeQuestion").textContent = step.question;
  $("#welcomeQuestion").animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 320, easing: "ease-out" });
  $("#welcomeDescription").textContent = step.description;
  $("#welcomeBack").hidden = welcomeIndex === 0;
  $("#welcomeFeedback").textContent = "";
  const options = $("#welcomeOptions");
  const range = $("#welcomeRangeWrap");
  options.replaceChildren();
  range.hidden = !step.range;

  if (step.range) {
    const input = $("#loveRate");
    input.value = welcomeAnswers.love ?? 500;
    $("#loveRateValue").textContent = input.value;
    $("#welcomeNext").disabled = false;
  } else {
    const selected = welcomeAnswers[step.key];
    $("#welcomeNext").disabled = !selected;
    step.choices.forEach(choice => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "welcome-option";
      button.setAttribute("aria-pressed", String(selected === choice.value));
      if (choice.theme) button.dataset.themeChoice = choice.theme;
      const title = document.createElement("strong");
      title.textContent = choice.title;
      button.append(title);
      button.addEventListener("click", () => {
        welcomeAnswers[step.key] = choice.value;
        if (step.key === "mood") {
          welcomeAnswers.themeName = choice.themeName;
          // Let the page respond as soon as she picks a mood, while she is still in the check-in.
          setTheme(choice.theme);
        }
        $$(".welcome-option", options).forEach(option => option.setAttribute("aria-pressed", String(option === button)));
        $("#welcomeNext").disabled = false;
        $("#welcomeFeedback").textContent = step.key === "mood" ? `I'll make this feel like ${choice.themeName}.` : "Got it. I'll keep that in mind as you wander.";
      });
      options.append(button);
    });
  }

  $("#welcomeNext").textContent = welcomeIndex === welcomeSteps.length - 1 ? "Finish" : "Continue";
}


$("#loveRate").addEventListener("input", event => {
  const value = Math.max(
    0,
    Math.min(1000, Number(event.currentTarget.value))
  );

  welcomeAnswers.love = value;

  $("#loveRateValue").textContent = String(value);

  $("#welcomeFeedback").textContent =
    value === 1000
      ? "I KNEW IT! YOU'RE OBSESSED WITH ME! 💖"
      : value >= 900
        ? "999?! What happened to the last 1 point? Explain yourself! 😤"
        : value >= 700
          ? "Awww, somebody has a favourite person! 🥰"
          : value >= 500
            ? "Look who's getting attached! 😏"
            : value >= 300
              ? "Hmm. I'll accept this temporary affection. 🤨"
              : value >= 100
                ? "Okay, at least you know my name. 😭"
                : "Oh. So we're just acquaintances now? 🥲";

  if (value === 1000) {
    burstCuteEmojis(20);
  }
});


function finishWelcome(skip = false) {
  const mood = welcomeSteps[0].choices.find(choice => choice.value === welcomeAnswers.mood);
  const theme = mood?.theme ?? document.documentElement.dataset.theme ?? "rose";
  setTheme(theme);
  safeStorage.set("tanu-checkin-done", "yes", true);
  safeStorage.set("tanu-checkin-theme", theme, true);
  safeStorage.set("tanu-room-mood", theme);

  const feelingNotes = {
    cozy: "I hope this little corner feels like sitting beside me for a minute.",
    laugh: "I hope something in here makes you laugh the way you make me laugh.",
    hug: "If I were there, I'd give you the longest hug. For now, here's a little one in pixels.",
    curious: "I put a lot of little pieces of my heart in here. I hope you find them."
  };
  const rating = Number(welcomeAnswers.love ?? 500);

  const ratingNote = rating === 1000
    ? "1000/1000?! I KNEW YOU WERE OBSESSED WITH ME. 😭💗"
    : rating >= 900
      ? "999?! What happened to the last 1 point? Explain yourself! 😤"
      : rating >= 700
        ? "Awww, somebody has a favourite person! 🥰"
        : rating >= 500
          ? "Look who's getting attached! 😏"
          : rating >= 300
            ? "Hmm. I'll accept this temporary affection. 🤨"
            : rating >= 100
              ? "Okay, at least you know my name. 😭"
              : "Oh. So we're just acquaintances now? 🥲";
  const personalized = skip
    ? "I made this little place because I love you. Take your time looking around. — Abhishek"
    : `${feelingNotes[welcomeAnswers.feeling] ?? feelingNotes.cozy} ${ratingNote}`;
  if ($("#todayNote")) $("#todayNote").textContent = `${personalized} — Abhishek`;
  if ($("#checkinNote")) $("#checkinNote").hidden = false;
  if ($("#compactToday") && !skip) $("#compactToday").textContent = personalized;
  if (welcomeDialog?.open) safeCloseDialog(welcomeDialog);

  if (!skip) {
    recordPlayerActivity("Check-in", `Set room mood to ${theme} & rated love ${rating}/1000`, {
      icon: "🌸",
      scoreLabel: `${rating}/1000`
    });
  }

  window.dispatchEvent(new CustomEvent("tanu-theme-changed", { detail: { theme } }));

  // Start background music after welcome flow
  startMusic();
  if (!skip) {
    const first = welcomeAnswers.first;
    if (first === "letter") setTimeout(() => letterDialog.showModal(), 300);
    else if (first === "surprise") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => $("#surpriseMe").click(), 400);
    } else if (first) {
      setTimeout(() => document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    }
  }
}

$("#welcomeNext").addEventListener("click", () => {
  if ($("#welcomeNext").disabled) return;
  if (welcomeIndex < welcomeSteps.length - 1) {
    welcomeIndex += 1;
    renderWelcomeStep();
  } else {
    finishWelcome();
  }
});
$("#welcomeBack").addEventListener("click", () => {
  if (welcomeIndex > 0) {
    welcomeIndex -= 1;
    renderWelcomeStep();
  }
});
$("#welcomeSkip").addEventListener("click", () => finishWelcome(true));
welcomeDialog.addEventListener("cancel", event => {
  event.preventDefault();
  finishWelcome(true);
});
$("#reopenWelcome").addEventListener("click", () => {
  welcomeIndex = 0;
  welcomeAnswers = { love: 500 };
  renderWelcomeStep();
  welcomeDialog.showModal();
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  menuToggle.textContent = "Menu";
});

function launchPostUnlockWelcome() {
  try {
    const player = getActivePlayer();
    const doneKey = `tanu-checkin-done-${player?.key || "guest"}`;
    if (!safeStorage.get(doneKey, true) && !safeStorage.get("tanu-checkin-done", true)) {
      welcomeIndex = 0;
      renderWelcomeStep();
      safeOpenDialog(welcomeDialog);
      safeStorage.set(doneKey, "yes", true);
    } else {
      startMusic();
    }
  } catch {
    startMusic();
  }
}

function syncUnlockedUI() {
  const player = getActivePlayer();
  const gate = $("#siteLockGate");
  const badge = $("#activePlayerBadge");
  if (player) {
    document.body.classList.remove("is-locked");
    if (gate) gate.hidden = true;
    if (badge) badge.textContent = `${player.avatar} ${player.displayName}`;
    window.dispatchEvent(new CustomEvent("couple-player-changed", { detail: { player, store: coupleStore } }));
  } else {
    document.body.classList.add("is-locked");
    if (gate) gate.hidden = false;
    if (badge) badge.textContent = "🔒 Locked";
    if (welcomeDialog?.open) safeCloseDialog(welcomeDialog);
    setTimeout(() => $("#lockNameInput")?.focus(), 60);
  }
}

function lockWebsiteForSwitch() {
  activePlayerKey = null;
  safeStorage.remove(ACTIVE_SESSION_KEY, true);
  if ($("#lockPassInput")) $("#lockPassInput").value = "";
  if ($("#lockErrorMsg")) $("#lockErrorMsg").textContent = "";
  syncUnlockedUI();
}

window.lockWebsiteForSwitch = lockWebsiteForSwitch;






// Theme-specific assets
// ============================================================================
// ENHANCED THEME SYSTEM
// ============================================================================

// Romantic messages for envelope popups (30+ messages)
const romanticMessages = [
  "I love you more than words can express.",
  "You are my everything.",
  "I can't imagine my life without you.",
  "You are the sunshine of my life.",
  "You are so beautiful inside and out.",
  "My love for you grows stronger every day.",
  "You make me a better person.",
  "I'm so grateful to have you in my life.",
  "You are my dream come true.",
  "My heart beats only for you.",
  "You are the most amazing person I've ever met.",
  "I fall in love with you more every day.",
  "You complete me.",
  "You are my soulmate.",
  "I cherish every moment with you.",
  "You are my happiness.",
  "I'm so lucky to call you mine.",
  "You are my forever and always.",
  "You are the reason I smile.",
  "I adore everything about you.",
  "You are my greatest blessing.",
  "I love you to the moon and back.",
  "You are my one and only.",
  "You mean the world to me.",
  "I'm forever yours.",
  "You are my perfect match.",
  "I love you more than yesterday, less than tomorrow.",
  "You are the love of my life.",
  "My heart belongs to you.",
  "You are my everything and more.",
  "I'm so in love with you.",
  "You are my favorite person.",
  "I can't wait to spend the rest of my life with you.",
  "You are my dream girl.",
  "I love you endlessly.",
  "You are my precious angel.",
  "You make my world brighter.",
  "I'm crazy about you.",
  "You are my heart's desire.",
  "I love you more than anything in this world."
];

// Enhanced theme assets with distinct elements for each theme
const themeAssets = {
  rose: {
    name: "Romantic Rose",
    mood: "Warm & Loving",
    colors: {
      primary: "var(--rose)",
      secondary: "var(--wine)"
    },
    elements: ["heart", "heart", "heart", "rose", "kiss", "bouquet"],
    emojis: ["💖", "💗", "💕", "💘", "💝", "💞", "🥰", "😍", "🌹", "💐"],
    pictures: [
      "assets/photos/together/together2.webp",
      "assets/photos/together/together3.webp",
      "assets/photos/together/together4.webp",
      "assets/photos/together/together5.webp",
      "assets/photos/together/together6.webp",
      "assets/photos/together/main.jpeg",
      "assets/photos/together/date.webp"
    ],
    floatingSpeed: "15s",
    envelopeIcon: "💌",
    envelopeColor: "#ff6b8b"
  },
  sage: {
    name: "Calm Sage",
    mood: "Peaceful & Serene",
    colors: {
      primary: "var(--wine)",
      secondary: "var(--sage)"
    },
    elements: ["leaf", "leaf", "feather", "droplet", "butterfly", "bird"],
    emojis: ["🍃", "🌿", "🍂", "🌱", "🕊️", "✨", "🌾", "🍀", "🦋", "💧"],
    pictures: [
      "assets/photos/tanu/childhood-tanu.webp",
      "assets/photos/abhishek/child.webp",
      "assets/photos/tanu/child2.webp",
      "assets/photos/abhishek/chil2.webp",
      "assets/photos/tanu/tanu2.webp",
      "assets/photos/tanu/tanu3.webp"
    ],
    floatingSpeed: "20s",
    envelopeIcon: "📜",
    envelopeColor: "#5a7d5a"
  },
  honey: {
    name: "Sunny Honey",
    mood: "Bright & Joyful",
    colors: {
      primary: "var(--wine)",
      secondary: "var(--honey)"
    },
    elements: ["sun", "sun", "star", "sparkle", "butterfly", "flower"],
    emojis: ["☀️", "🌟", "✨", "⭐", "💫", "🌼", "🦋", "😊", "🌻", "🌈"],
    pictures: [
      "assets/photos/together/date.webp",
      "assets/photos/together/bouquet-that-i-gifted.webp",
      "assets/photos/gifts/birthday.webp",
      "assets/photos/tanu/tanu6.jpeg",
      "assets/photos/tanu/tanu7.jpeg"
    ],
    floatingSpeed: "18s",
    envelopeIcon: "✉️",
    envelopeColor: "#ffb347"
  },
  plum: {
    name: "Dreamy Plum",
    mood: "Magical & Dreamy",
    colors: {
      primary: "var(--rose)",
      secondary: "var(--plum)"
    },
    elements: ["cloud", "cloud", "moon", "star", "sparkle", "butterfly"],
    emojis: ["☁️", "🌙", "✨", "🌟", "🫧", "🌸", "🌠", "💭", "🦄", "🔮"],
    pictures: [
      "assets/photos/tanu/tanu2.webp",
      "assets/photos/tanu/tanu3.webp",
      "assets/photos/abhishek/abhishek4.webp",
      "assets/photos/abhishek/abishek2.webp",
      "assets/photos/tanu/tanu8.jpeg",
      "assets/photos/tanu/tanu9.jpeg"
    ],
    floatingSpeed: "22s",
    envelopeIcon: "📮",
    envelopeColor: "#9d7bb8"
  }
};



const floatingWhisperNotes = [
  "you + me, always ♡",
  "my favourite human",
  "thinking of you ✨",
  "keep smiling, Tanu",
  "saved a hug for you",
  "forever plus-one 💗",
  "you make life lovely",
  "luckiest guy alive"
];

// Create a floating element (bubble, heart/emoji, whisper note, polaroid mini-card, clickable envelope)
function createFloatingElement(theme, type = "random", options = {}) {
  const reducedMotion = isReducedMotion();
  const assets = themeAssets[theme] || themeAssets.rose;
  if (!assets) return null;

  const element = document.createElement("div");
  element.className = `floating-element floating-${theme}`;
  element.setAttribute("aria-hidden", "true");

  // Spread smoothly across the entire horizontal viewport (3% to 95%)
  const left = 3 + Math.random() * 92;
  const size = 24 + Math.random() * 26;
  const rotation = (Math.random() - 0.5) * 44;
  const driftFactor = reducedMotion ? 0.25 : 1;
  const driftX = (Math.random() - 0.5) * 110 * driftFactor;
  const baseDuration = parseInt(assets.floatingSpeed, 10) || 18;
  const durationFactor = reducedMotion ? 1.8 : 1;
  const duration = (baseDuration + Math.random() * 9) * durationFactor;

  element.style.left = `${left}%`;
  element.style.top = "104vh";
  element.style.animationDuration = `${duration}s`;
  if (options.initialProgress) {
    element.style.animationDelay = `-${(duration * options.initialProgress).toFixed(2)}s`;
  }
  element.style.setProperty("--float-rotation", `${rotation}deg`);
  element.style.setProperty("--float-drift-x", `${driftX}px`);

  let resolvedType = type;
  if (resolvedType === "random") {
    const roll = Math.random();
    if (roll < 0.2) resolvedType = "bubble";
    else if (roll < 0.36) resolvedType = "firefly";
    else if (roll < 0.48) resolvedType = "petal";
    else if (roll < 0.55) resolvedType = "whisper";
    else if (roll < 0.65) resolvedType = "picture";
    else if (roll < 0.72) resolvedType = "envelope";
    else resolvedType = "emoji";
  }

  if (resolvedType === "bubble") {
    const bubbleSize = 16 + Math.random() * 32;
    element.style.width = `${bubbleSize}px`;
    element.style.height = `${bubbleSize}px`;
    element.style.setProperty("--float-opacity", (0.35 + Math.random() * 0.35).toFixed(2));
    element.classList.add("floating-bubble");
  } else if (resolvedType === "firefly") {
    const glowSize = 7 + Math.random() * 10;
    element.style.width = `${glowSize}px`;
    element.style.height = `${glowSize}px`;
    element.style.setProperty("--float-opacity", (0.65 + Math.random() * 0.3).toFixed(2));
    element.classList.add("floating-firefly");
  } else if (resolvedType === "petal") {
    const petalSize = 12 + Math.random() * 11;
    element.style.width = `${petalSize}px`;
    element.style.height = `${petalSize * 1.25}px`;
    element.style.setProperty("--float-rotation", `${(Math.random() > 0.5 ? 1 : -1) * (160 + Math.random() * 140)}deg`);
    element.style.setProperty("--float-opacity", (0.58 + Math.random() * 0.26).toFixed(2));
    element.classList.add("floating-petal");
  } else if (resolvedType === "whisper") {
    const text = floatingWhisperNotes[Math.floor(Math.random() * floatingWhisperNotes.length)];
    element.textContent = text;
    element.style.setProperty("--float-opacity", "0.88");
    element.classList.add("floating-message-pill");
    element.removeAttribute("aria-hidden");
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", `Love note: ${text}. Click for a surprise message`);
    element.addEventListener("click", handleEnvelopeClick);
  } else if (resolvedType === "picture" && assets.pictures.length > 0) {
    const picWidth = 46 + Math.random() * 18;
    element.style.width = `${picWidth}px`;
    element.style.height = `${picWidth * 1.15}px`;
    element.style.setProperty("--float-opacity", "0.78");
    const img = document.createElement("img");
    img.src = assets.pictures[Math.floor(Math.random() * assets.pictures.length)];
    img.alt = "";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "6px";
    element.appendChild(img);
    element.classList.add("floating-picture");
  } else if (resolvedType === "envelope") {
    element.textContent = assets.envelopeIcon;
    element.style.width = `${size * 1.25}px`;
    element.style.height = `${size * 1.25}px`;
    element.style.fontSize = `${Math.round(size * 1.05)}px`;
    element.style.setProperty("--float-opacity", "0.94");
    element.classList.add("floating-envelope");
    element.removeAttribute("aria-hidden");
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", "Open a floating love note");
    element.addEventListener("click", handleEnvelopeClick);
    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleEnvelopeClick(e);
      }
    });
  } else {
    const emoji = assets.emojis[Math.floor(Math.random() * assets.emojis.length)];
    element.textContent = emoji;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.fontSize = `${Math.round(size * 0.82)}px`;
    element.style.setProperty("--float-opacity", "0.76");
    element.style.filter = "drop-shadow(0 4px 10px rgba(51, 36, 31, 0.1))";
  }

  return element;
}

// Handle floating envelope / whisper pill click - show romantic note modal
function handleEnvelopeClick(event) {
  event.stopPropagation();
  const reducedMotion = isReducedMotion();
  const trigger = event.currentTarget;
  const randomMessage = romanticMessages[Math.floor(Math.random() * romanticMessages.length)];
  const prof = getActiveProfile();
  if (prof) {
    prof.interactions.notesOpened += 1;
    recordPlayerActivity("Floating Note", "Caught a floating love note in the sky", { icon: "💌" });
  }
  document.querySelectorAll(".envelope-popup-backdrop").forEach(el => el.remove());

  const backdrop = document.createElement("div");
  backdrop.className = "envelope-popup-backdrop";

  const popup = document.createElement("div");
  popup.className = "envelope-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "envelope-popup-close";
  closeBtn.setAttribute("aria-label", "Close note");
  closeBtn.textContent = "×";

  const kicker = document.createElement("span");
  kicker.className = "envelope-popup-kicker";
  kicker.textContent = "A FLOATING NOTE FOR TANU";

  const message = document.createElement("p");
  message.textContent = `“${randomMessage}”`;

  const signature = document.createElement("p");
  signature.textContent = "— Abhishek";
  signature.style.fontFamily = "var(--script)";
  signature.style.fontSize = "25px";
  signature.style.color = "var(--wine)";
  signature.style.margin = "0";

  const closePopup = () => {
    backdrop.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => {
    if (e.key === "Escape") closePopup();
  };

  closeBtn.addEventListener("click", closePopup);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closePopup();
  });
  document.addEventListener("keydown", onKey);

  popup.append(closeBtn, kicker, message, signature);
  backdrop.appendChild(popup);
  document.body.appendChild(backdrop);

  safeAnimate(
    popup,
    [
      { opacity: 0, transform: "translateY(10px) scale(0.92)" },
      { opacity: 1, transform: "translateY(0) scale(1)" }
    ],
    { duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
  );
  if (trigger && trigger.parentNode) {
    const anim = safeAnimate(
      trigger,
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(1.45)" }
      ],
      { duration: 280, easing: "ease-out" }
    );
    if (anim) anim.onfinish = () => trigger.remove();
    else trigger.remove();
  }
}

function spawnFloatingNode(theme, type = "random", options = {}) {
  const overlay = getFloatingOverlay();
  const maxNodes = window.innerWidth < 600 ? 18 : 28;
  if (overlay.childElementCount >= maxNodes) return;
  const element = createFloatingElement(theme, type, options);
  if (!element) return;
  overlay.appendChild(element);
  const durSec = parseFloat(element.style.animationDuration) || 24;
  const removeEl = () => { if (element.parentNode) element.remove(); };
  element.addEventListener("animationend", removeEl, { once: true });
  setTimeout(removeEl, (durSec + 2) * 1000);
}

// Start theme animations (continuous full-screen floating elements)
function startThemeAnimations(theme) {
  stopThemeAnimations();
  currentTheme = theme || "rose";

  const overlay = getFloatingOverlay();
  safeReplaceChildren(overlay);
  // Seed elements already mid-flight across the whole screen height immediately
  const initialCount = 16;
  const seedTypes = ["firefly", "petal", "bubble", "emoji", "firefly", "whisper", "petal", "envelope", "picture"];
  for (let i = 0; i < initialCount; i++) {
    const seededType = seedTypes[i % seedTypes.length];
    const progress = (i + 0.5) / initialCount * 0.88;
    spawnFloatingNode(currentTheme, seededType, { initialProgress: progress });
  }

  // Continuous gentle stream from bottom to top across the entire viewport
  themeAnimationInterval = setInterval(() => {
    const batchCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < batchCount; i++) {
      setTimeout(() => spawnFloatingNode(currentTheme, "random"), i * 450);
    }
  }, 2400);

  // Dedicated love envelope / whisper stream
  envelopeInterval = setInterval(() => {
    spawnFloatingNode(currentTheme, Math.random() < 0.55 ? "envelope" : "whisper");
  }, 8500);
}

// Stop all theme animations
function stopThemeAnimations() {
  if (themeAnimationInterval) {
    clearInterval(themeAnimationInterval);
    themeAnimationInterval = null;
  }
  if (envelopeInterval) {
    clearInterval(envelopeInterval);
    envelopeInterval = null;
  }
}

function setTheme(theme) {
  const validTheme = themeAssets[theme] ? theme : "rose";
  const themeUnchanged = document.documentElement.dataset.theme === validTheme && themeAnimationInterval !== null;
  document.documentElement.dataset.theme = validTheme;
  const themeColor = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);

  if (!themeUnchanged) {
    startThemeAnimations(validTheme);
  }

  window.dispatchEvent(new CustomEvent("tanu-theme-changed", { detail: { theme: validTheme } }));
}
(() => {
  const previousTheme = safeStorage.get("tanu-checkin-theme", true) || safeStorage.get("tanu-room-mood");
  setTheme(previousTheme || "rose");

  const lockForm = $("#lockGateForm");
  const nameInput = $("#lockNameInput");
  const passInput = $("#lockPassInput");
  const errorEl = $("#lockErrorMsg");
  const lockCard = $("#lockCard");

  lockForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const rawName = (nameInput?.value || "").trim().toLowerCase();
    const rawPass = (passInput?.value || "").trim();

    const matchedPlayer = ALLOWED_PLAYERS[rawName];
    if (!matchedPlayer) {
      if (errorEl) {
        errorEl.textContent = "Only Tanu or Abhishek are allowed inside this little room 🔒";
      }
      lockCard?.classList.remove("shake-error");
      void lockCard?.offsetWidth;
      lockCard?.classList.add("shake-error");
      nameInput?.focus();
      return;
    }

    if (rawPass !== SECRET_PASSCODE) {
      if (errorEl) {
        errorEl.textContent = `Wrong passcode, ${matchedPlayer.displayName}! Try our secret 4-digit code 💗`;
      }
      lockCard?.classList.remove("shake-error");
      void lockCard?.offsetWidth;
      lockCard?.classList.add("shake-error");
      passInput?.select();
      return;
    }

    // Valid credentials!
    if (errorEl) errorEl.textContent = "";
    activePlayerKey = matchedPlayer.key;
    safeStorage.set(ACTIVE_SESSION_KEY, matchedPlayer.key, true);

    const profile = coupleStore.players[matchedPlayer.key];
    profile.unlockCount += 1;
    recordPlayerActivity("Session", `${matchedPlayer.displayName} unlocked our little world`, { icon: "🔓" });

    syncUnlockedUI();
    burstCuteEmojis(18);
    launchPostUnlockWelcome();
  });

  $("#switchPlayerBtn")?.addEventListener("click", () => {
    lockWebsiteForSwitch();
  });

  if (activePlayerKey && ALLOWED_PLAYERS[activePlayerKey]) {
    syncUnlockedUI();
  } else {
    syncUnlockedUI();
  }
})();

/* ============================================================================
   FLOATING MUSIC PLAYER (MODERN MUSIC APP EXPERIENCE)
   ============================================================================ */
const musicPlayer = $("#music-player");
const backgroundMusic = $("#background-music");
const musicToggle = $("#music-toggle");
const musicPrev = $("#music-prev");
const musicNext = $("#music-next");
const musicVolume = $("#music-volume");
const musicMute = $("#music-mute");
const musicSeek = $("#music-seek");
const musicCurrent = $("#music-current");
const musicDuration = $("#music-duration");
const musicTitle = $("#music-title");
const musicArtist = $("#music-artist");
const musicCover = $("#music-cover");
const musicTrackIndex = $("#music-track-index");
const musicDrawer = $("#music-playlist-drawer");
const musicTrackList = $("#music-track-list");
const musicQueueToggle = $("#music-queue-toggle");
const musicExpand = $("#music-expand");
const musicPlaylistClose = $("#music-playlist-close");
const musicMinimize = $("#music-minimize");

const playlist = [
  {
    title: "Lover",
    artist: "Taylor Swift",
    tag: "Our song",
    src: "assets/audio/Taylor Swift - Lover.mp3",
    fallbackSrc: "../Songs/Taylor Swift - Lover.mp3",
    cover: "assets/photos/together/together2.webp"
  },
  {
    title: "Perfect",
    artist: "Ed Sheeran",
    tag: "Slow dance",
    src: "assets/audio/Edd_Sheeran_-_Perfect_(mp3.pm).mp3",
    fallbackSrc: "../Songs/Edd_Sheeran_-_Perfect_(mp3.pm).mp3",
    cover: "assets/photos/together/main.jpeg"
  },
  {
    title: "Tum Se Hi",
    artist: "Mohit Chauhan · Jab We Met",
    tag: "Hindi classic",
    src: "assets/audio/MOHIT_CHAUHAN_-_TUM_SE_HI_FILM_JAB_WE_MET_(mp3.pm).mp3",
    fallbackSrc: "../Songs/MOHIT_CHAUHAN_-_TUM_SE_HI_FILM_JAB_WE_MET_(mp3.pm).mp3",
    cover: "assets/photos/together/date.webp"
  },
  {
    title: "Pehli Nazar Mein",
    artist: "Atif Aslam",
    tag: "First look",
    src: "assets/audio/Atif_Aslam_-_Pehli_Nazar_Mein_From_Race_(mp3.pm).aac",
    fallbackSrc: "../Songs/Atif_Aslam_-_Pehli_Nazar_Mein_From_Race_(mp3.pm).aac",
    cover: "assets/photos/tanu/tanu3.webp"
  },
  {
    title: "Just the Way You Are",
    artist: "Bruno Mars",
    tag: "For Tanu",
    src: "assets/audio/Bruno_Mars_-_Just_Way_You_Are_(mp3.pm).mp3",
    fallbackSrc: "../Songs/Bruno_Mars_-_Just_Way_You_Are_(mp3.pm).mp3",
    cover: "assets/photos/tanu/tanu6.jpeg"
  },
  {
    title: "Love Story",
    artist: "Taylor Swift",
    tag: "Forever",
    src: "assets/audio/Tailor_Swift_-_Love_Story._(mp3.pm).mp3",
    fallbackSrc: "../Songs/Tailor_Swift_-_Love_Story._(mp3.pm).mp3",
    cover: "assets/photos/together/together4.webp"
  },
  {
    title: "Can't Help Falling in Love",
    artist: "Elvis Presley",
    tag: "Timeless",
    src: "assets/audio/Elvis_Presle_-_Can_t_Help_Falling_in_Love_(mp3.pm).mp3",
    fallbackSrc: "../Songs/Elvis_Presle_-_Can_t_Help_Falling_in_Love_(mp3.pm).mp3",
    cover: "assets/photos/together/bouquet-that-i-gifted.webp"
  },
  {
    title: "I Will Always Love You",
    artist: "Whitney Houston",
    tag: "Always",
    src: "assets/audio/Whitney_Huoston_-_i_will_always_love_you_(mp3.pm).aac",
    fallbackSrc: "../Songs/Whitney_Huoston_-_i_will_always_love_you_(mp3.pm).aac",
    cover: "assets/photos/together/together6.webp"
  }
];

let currentSongIndex = 0;
let isSeeking = false;
let lastNonZeroVolume = 0.4;
let musicStarted = false;

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function updateRangeFill(input, ratio) {
  if (!input) return;
  const pct = Math.max(0, Math.min(100, ratio * 100));
  input.style.setProperty("--range-pct", `${pct.toFixed(1)}%`);
}

function syncPlayingUI(playing) {
  if (!musicPlayer || !musicToggle) return;
  musicPlayer.classList.toggle("is-playing", playing);
  musicToggle.setAttribute("aria-label", playing ? "Pause music" : "Play music");
}

function renderPlaylistDrawer() {
  if (!musicTrackList) return;
  musicTrackList.replaceChildren(
    ...playlist.map((track, idx) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `mp-track-item${idx === currentSongIndex ? " active" : ""}`;
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", String(idx === currentSongIndex));
      btn.innerHTML = `
        <span class="mp-track-num">${idx === currentSongIndex ? "♪" : String(idx + 1).padStart(2, "0")}</span>
        <img class="mp-track-thumb" src="${track.cover}" alt="">
        <span class="mp-track-info">
          <strong>${track.title}</strong>
          <small>${track.artist}</small>
        </span>
        <span class="mp-track-tag">${track.tag}</span>
      `;
      btn.addEventListener("click", () => {
        currentSongIndex = idx;
        loadSong(currentSongIndex);
        playAudioSafe();
      });
      li.appendChild(btn);
      return li;
    })
  );
}

function loadSong(index) {
  const track = playlist[index];
  if (!track || !backgroundMusic) return;
  backgroundMusic.dataset.usedFallback = "false";
  backgroundMusic.src = track.src;
  backgroundMusic.load();
  if (musicTitle) musicTitle.textContent = track.title;
  if (musicArtist) musicArtist.textContent = track.artist;
  if (musicCover) {
    musicCover.src = track.cover;
    musicCover.alt = `${track.title} cover`;
  }
  if (musicTrackIndex) musicTrackIndex.textContent = `${index + 1} / ${playlist.length}`;
  if (musicSeek) {
    musicSeek.value = "0";
    updateRangeFill(musicSeek, 0);
  }
  if (musicCurrent) musicCurrent.textContent = "0:00";
  if (musicDuration) musicDuration.textContent = "0:00";
  renderPlaylistDrawer();
}

function playAudioSafe() {
  if (!backgroundMusic) return;
  const playPromise = backgroundMusic.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise
      .then(() => {
        musicStarted = true;
        syncPlayingUI(true);
      })
      .catch(() => {
        syncPlayingUI(false);
      });
  } else {
    syncPlayingUI(!backgroundMusic.paused);
  }
}

function playPauseMusic() {
  if (!backgroundMusic) return;
  if (backgroundMusic.paused) {
    playAudioSafe();
  } else {
    backgroundMusic.pause();
    syncPlayingUI(false);
  }
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadSong(currentSongIndex);
  playAudioSafe();
}

function prevSong() {
  if (backgroundMusic && backgroundMusic.currentTime > 3.5) {
    backgroundMusic.currentTime = 0;
    return;
  }
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentSongIndex);
  playAudioSafe();
}

function setVolume(value) {
  if (!backgroundMusic) return;
  const vol = Math.max(0, Math.min(1, Number(value)));
  backgroundMusic.volume = vol;
  backgroundMusic.muted = vol === 0;
  if (vol > 0) lastNonZeroVolume = vol;
  if (musicVolume) {
    musicVolume.value = String(vol);
    updateRangeFill(musicVolume, vol);
  }
  musicPlayer?.classList.toggle("is-muted", vol === 0 || backgroundMusic.muted);
}

function togglePlaylistDrawer(forceOpen) {
  if (!musicDrawer) return;
  if (musicPlayer?.classList.contains("is-minimized")) {
    musicPlayer.classList.remove("is-minimized");
  }
  const willOpen = typeof forceOpen === "boolean" ? forceOpen : musicDrawer.hidden;
  musicDrawer.hidden = !willOpen;
  musicQueueToggle?.setAttribute("aria-expanded", String(willOpen));
}

function startMusic() {
  if (!backgroundMusic || musicStarted) return;
  playAudioSafe();
}

if (backgroundMusic) {
  loadSong(0);
  setVolume(0.4);

  musicToggle?.addEventListener("click", playPauseMusic);
  musicNext?.addEventListener("click", nextSong);
  musicPrev?.addEventListener("click", prevSong);

  musicVolume?.addEventListener("input", (e) => setVolume(e.target.value));
  musicMute?.addEventListener("click", () => {
    if (backgroundMusic.muted || backgroundMusic.volume === 0) {
      setVolume(lastNonZeroVolume || 0.4);
    } else {
      setVolume(0);
    }
  });

  musicSeek?.addEventListener("input", () => {
    isSeeking = true;
    const ratio = Number(musicSeek.value) / 1000;
    updateRangeFill(musicSeek, ratio);
    if (musicCurrent && Number.isFinite(backgroundMusic.duration)) {
      musicCurrent.textContent = formatTime(ratio * backgroundMusic.duration);
    }
  });

  musicSeek?.addEventListener("change", () => {
    if (Number.isFinite(backgroundMusic.duration) && backgroundMusic.duration > 0) {
      backgroundMusic.currentTime = (Number(musicSeek.value) / 1000) * backgroundMusic.duration;
    }
    isSeeking = false;
  });

  backgroundMusic.addEventListener("timeupdate", () => {
    if (isSeeking || !musicSeek) return;
    const dur = backgroundMusic.duration;
    const cur = backgroundMusic.currentTime;
    if (musicCurrent) musicCurrent.textContent = formatTime(cur);
    if (Number.isFinite(dur) && dur > 0) {
      const ratio = cur / dur;
      musicSeek.value = String(Math.round(ratio * 1000));
      updateRangeFill(musicSeek, ratio);
      if (musicDuration) musicDuration.textContent = formatTime(dur);
    }
  });

  backgroundMusic.addEventListener("loadedmetadata", () => {
    if (musicDuration && Number.isFinite(backgroundMusic.duration)) {
      musicDuration.textContent = formatTime(backgroundMusic.duration);
    }
  });

  backgroundMusic.addEventListener("play", () => syncPlayingUI(true));
  backgroundMusic.addEventListener("pause", () => syncPlayingUI(false));
  backgroundMusic.addEventListener("ended", nextSong);

  backgroundMusic.addEventListener("error", () => {
    const track = playlist[currentSongIndex];
    if (track && backgroundMusic.dataset.usedFallback !== "true" && track.fallbackSrc) {
      backgroundMusic.dataset.usedFallback = "true";
      backgroundMusic.src = track.fallbackSrc;
      backgroundMusic.load();
      if (musicStarted) playAudioSafe();
    }
  });

  musicQueueToggle?.addEventListener("click", () => togglePlaylistDrawer());
  musicExpand?.addEventListener("click", () => {
    if (musicPlayer?.classList.contains("is-minimized")) {
      musicPlayer.classList.remove("is-minimized");
      musicMinimize?.setAttribute("aria-label", "Minimize music player");
      musicMinimize?.setAttribute("title", "Minimize");
    } else {
      togglePlaylistDrawer();
    }
  });
  musicPlaylistClose?.addEventListener("click", () => togglePlaylistDrawer(false));

  musicMinimize?.addEventListener("click", () => {
    const minimized = musicPlayer.classList.toggle("is-minimized");
    if (minimized && musicDrawer) {
      musicDrawer.hidden = true;
      musicQueueToggle?.setAttribute("aria-expanded", "false");
    }
    musicMinimize.setAttribute("aria-label", minimized ? "Expand music player" : "Minimize music player");
    musicMinimize.setAttribute("title", minimized ? "Expand" : "Minimize");
  });

  document.addEventListener("click", (e) => {
    if (musicDrawer && !musicDrawer.hidden && musicPlayer && !musicPlayer.contains(e.target)) {
      togglePlaylistDrawer(false);
    }
  });

  if (welcomeDialog) {
    welcomeDialog.addEventListener("close", startMusic);
  }
}

// A small, pointer-led shift makes the cover photograph feel like a keepsake, not a stock card.
const heroPhoto = $("#heroPhoto");
if (heroPhoto && !isReducedMotion()) {
  heroPhoto.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    const box = heroPhoto.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    heroPhoto.style.setProperty("--photo-x", `${x * 5}px`);
    heroPhoto.style.setProperty("--photo-y", `${y * 5}px`);
  });
  heroPhoto.addEventListener("pointerleave", () => {
    heroPhoto.style.setProperty("--photo-x", "0px");
    heroPhoto.style.setProperty("--photo-y", "0px");
  });
}

