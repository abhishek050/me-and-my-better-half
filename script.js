const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const letterDialog = $("#letterDialog");
const readDialog = $("#readDialog");
const lightbox = $("#lightbox");

$("#openLetter").addEventListener("click", () => letterDialog.showModal());
$$("[data-close]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
[letterDialog, readDialog, lightbox].forEach(dialog => dialog.addEventListener("click", e => {
  if (e.target === dialog) dialog.close();
}));
$("#backToTop").addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

const reasons = [
  "The way a simple conversation with you can turn my whole day around.",
  "How even the smallest message from you can leave me smiling.",
  "The feeling that there are so many beautiful things still waiting for us.",
  "How you make the future feel less like a question and more like something to look forward to.",
  "The quiet happiness of getting to know the little things that make you, you.",
  "That I get to choose you, not just today, but in all the ordinary days ahead."
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
