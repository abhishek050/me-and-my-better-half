const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

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

$("#openLetter").addEventListener("click", () => letterDialog.showModal());
$$("[data-close]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
[letterDialog, readDialog, lightbox].forEach(dialog => dialog.addEventListener("click", e => {
  if (e.target === dialog) dialog.close();
}));
$("#backToTop").addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

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
  readDialog.showModal();
}));

// Mobile navigation
const menuToggle = $(".menu-toggle");
const nav = $(".nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "×" : "☰";
});
$$(".nav a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
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
  ["gifts/birthday.webp", "A birthday surprise, just because", "together"]
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
const meter = $("#loveMeter");
const meterMessage = $("#meterMessage");
const meterHearts = $("#meterHearts");
const meterLines = ["Just a little? Try again, miss Tanu. ♡", "A very respectable amount of love.", "Now we're getting somewhere!", "Abhishek-sized, Tanu-shaped love.", "The scale has run out. Love you infinity! ♡"];
let maxConfetti = false;
meter.addEventListener("input", () => {
  const value = Number(meter.value);
  meter.style.setProperty("--meter-fill", `${value}%`);
  meterMessage.textContent = meterLines[Math.min(4, Math.floor(value / 25))];
  meterHearts.textContent = "♥ ".repeat(Math.ceil(value / 20)) + "♡ ".repeat(5 - Math.ceil(value / 20));
  meterHearts.classList.remove("pop");
  void meterHearts.offsetWidth;
  meterHearts.classList.add("pop");
  if (value >= 100 && !maxConfetti) { burstHearts(24); maxConfetti = true; }
  if (value < 100) maxConfetti = false;
});

const surprises = ["Tanu, you are my favourite notification.", "I love you more than chai. And that's serious.", "You + me + snacks = a perfect date.", "If hugs were pixels, this whole page would be one big hug.", "Breaking news: Abhishek is still completely smitten."];
$("#surpriseMe").addEventListener("click", event => {
  const button = event.currentTarget;
  button.innerHTML = `${surprises[Math.floor(Math.random() * surprises.length)]} <span>♡</span>`;
  button.classList.add("surprise-revealed");
  burstHearts(18);
});

function burstHearts(count = 12) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const shapes = ["♡", "♥", "✦", "✿", "✨"];
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "burst-heart";
    heart.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    heart.style.setProperty("--x", `${(Math.random() - 0.5) * 90}vw`);
    heart.style.setProperty("--drift", `${(Math.random() - 0.5) * 140}px`);
    heart.style.setProperty("--spin", `${Math.random() * 80 - 40}deg`);
    heart.style.setProperty("--duration", `${1.5 + Math.random() * 1.5}s`);
    heart.style.left = `${Math.random() * 100}vw`;
    document.body.append(heart);
    heart.addEventListener("animationend", () => heart.remove(), { once: true });
  }
}

// A small heart appears wherever she taps or clicks.
document.addEventListener("pointerdown", event => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (event.pointerType === "touch" || event.pointerType === "mouse") {
    const spark = document.createElement("span");
    spark.className = "tap-spark";
    spark.textContent = Math.random() > 0.5 ? "♡" : "✦";
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    document.body.append(spark);
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
  }
}, { passive: true });

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
    ? "Okay, speedy! My heart never stood a chance. ♡"
    : heartsCaught >= 6
      ? "You caught a bunch. I think you caught me first. ♡"
      : "I was trying to make that easy for you, promise. Run it back? ♡";
  catchResult.textContent = result;
  $("#startCatch").innerHTML = "Play again <span>↻</span>";
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
  $("#startCatch").innerHTML = "You're doing great <span>♡</span>";
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

// Game 02: affectionate questions with answers that only require knowing me.
const quizQuestions = [
  { q: "What's my favorite view?", options: ["A mountain sunset", "You smiling at me", "A perfect cup of chai"], answer: 1 },
  { q: "What do I want to collect more of?", options: ["Little moments with you", "Fancy things", "Unread emails"], answer: 0 },
  { q: "My favorite plan for a day off?", options: ["A packed schedule", "Whatever lets me spend time with you", "A meeting that could be an email"], answer: 1 },
  { q: "What am I most excited about?", options: ["The next ordinary day with you", "Finding my other sock", "Doing laundry"], answer: 0 },
  { q: "Who is my favorite person?", options: ["A famous movie star", "The person reading this", "My alarm clock"], answer: 1 }
];
let quizIndex = 0;
let quizScore = 0;
let answered = false;
let quizFinished = false;

function renderQuestion() {
  answered = false;
  quizFinished = false;
  const question = quizQuestions[quizIndex];
  $("#quizProgress").textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;
  $("#quizQuestion").textContent = question.q;
  $("#quizFeedback").textContent = "";
  const next = $("#nextQuestion");
  next.disabled = true;
  next.innerHTML = quizIndex === quizQuestions.length - 1 ? "See my score <span>♡</span>" : "Pick an answer first <span>↗</span>";
  $("#quizChoices").replaceChildren(...question.options.map((choice, index) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "quiz-choice";
    option.textContent = choice;
    option.addEventListener("click", () => chooseAnswer(index));
    return option;
  }));
}

function chooseAnswer(index) {
  if (answered) return;
  answered = true;
  const question = quizQuestions[quizIndex];
  const options = $$(".quiz-choice", $("#quizChoices"));
  options.forEach((option, optionIndex) => {
    option.disabled = true;
    if (optionIndex === question.answer) option.classList.add("correct");
    if (optionIndex === index && optionIndex !== question.answer) option.classList.add("not-quite");
  });
  if (index === question.answer) {
    quizScore += 1;
    $("#quizFeedback").textContent = ["You know me so well. ♡", "Correct! I had a feeling you'd get that.", "That's my girl. ♡", "I love how you get me.", "Of course it's you. Always."][quizIndex];
  } else {
    $("#quizFeedback").textContent = "Cute guess. The answer I was hoping for is highlighted. ♡";
  }
  $("#nextQuestion").disabled = false;
  $("#nextQuestion").textContent = quizIndex === quizQuestions.length - 1 ? "See my score ♡" : "Next question ↗";
}

$("#nextQuestion").addEventListener("click", () => {
  if (quizFinished) {
    quizIndex = 0;
    quizScore = 0;
    renderQuestion();
    return;
  }
  if (!answered) return;
  quizIndex += 1;
  if (quizIndex >= quizQuestions.length) {
    $("#quizProgress").textContent = "FINAL SCORE";
    $("#quizQuestion").textContent = quizScore === 5 ? "A perfect score! You know my heart." : `${quizScore} out of 5 — and I still pick you every time.`;
    $("#quizChoices").replaceChildren();
    $("#quizFeedback").textContent = "The real answer to every question: I love you, Tanu.";
    $("#nextQuestion").disabled = false;
    $("#nextQuestion").textContent = "Play again ↻";
    quizFinished = true;
    burstHearts(16);
  } else {
    renderQuestion();
  }
});
renderQuestion();

const dateIdeas = [
  "Let's watch the sunset and see who spots the first star. 🌇",
  "Chai, a long walk, and absolutely nowhere else to be. ☕",
  "Let's pick a new place to eat and rate every bite together. 🍰",
  "A little drive, our favorite songs, and your hand in mine. 🎶",
  "Let's make dinner together. I'll be in charge of taste-testing. 🍓",
  "A cozy movie night where we both pretend to share the snacks. 🍿",
  "Let's take silly photos until we accidentally get a favorite one. 📸"
];
let lastDateIdea = -1;
$("#spinDate").addEventListener("click", () => {
  let nextIdea = Math.floor(Math.random() * dateIdeas.length);
  if (dateIdeas.length > 1 && nextIdea === lastDateIdea) nextIdea = (nextIdea + 1) % dateIdeas.length;
  lastDateIdea = nextIdea;
  const idea = $("#dateIdea");
  idea.animate([{ opacity: 0, transform: "translateY(8px) rotate(-1deg)" }, { opacity: 1, transform: "translateY(0) rotate(0)" }], { duration: 450 });
  idea.textContent = dateIdeas[nextIdea];
  burstHearts(8);
});
