/* Shared behaviour for both locales. Loaded from / and /ru/ alike, so it must
   never assume a path — locale-dependent strings come from <html lang>. */

const LANG = document.documentElement.lang === "ru" ? "ru" : "en";
const t = (en, ru) => (LANG === "ru" ? ru : en);

/* ---------------------------------------------------------------- language */

const LANG_KEY = "preferred-lang";

// Remember an explicit choice so the sniffer below never overrides it again.
document.querySelectorAll("[data-lang]").forEach((link) => {
  link.addEventListener("click", () => {
    try {
      localStorage.setItem(LANG_KEY, link.dataset.lang);
    } catch (_) {
      /* private mode — the redirect just runs again next visit */
    }
  });
});

// The first-visit redirect itself lives in an inline <head> script on the
// English page — it has to run before first paint.

/* --------------------------------------------------------------- preloader */

const loader = document.getElementById("preloader");
window.addEventListener("load", function () {
  if (loader) loader.style.display = "none";
  const hey = document.querySelector(".hey");
  if (hey) hey.classList.add("popup");
});

/* ----------------------------------------------------------- mobile menu */

function hamburgerMenu() {
  document.body.classList.toggle("stopscrolling");
  document.getElementById("mobiletogglemenu").classList.toggle("show-toggle-menu");
  document.getElementById("burger-bar1").classList.toggle("hamburger-animation1");
  document.getElementById("burger-bar2").classList.toggle("hamburger-animation2");
  document.getElementById("burger-bar3").classList.toggle("hamburger-animation3");
}

function hidemenubyli() {
  document.body.classList.remove("stopscrolling");
  document.getElementById("mobiletogglemenu").classList.remove("show-toggle-menu");
  document.getElementById("burger-bar1").classList.remove("hamburger-animation1");
  document.getElementById("burger-bar2").classList.remove("hamburger-animation2");
  document.getElementById("burger-bar3").classList.remove("hamburger-animation3");
}

/* ------------------------------------------------- scroll spy + back to top */

const sections = document.querySelectorAll("section");
const navLi = document.querySelectorAll(".navbar .navbar-tabs .navbar-tabs-ul li");
const mobilenavLi = document.querySelectorAll(".mobiletogglemenu .mobile-navbar-tabs-ul li");
const backToTop = document.getElementById("backtotopbutton");

function scrolltoTopfunction() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

let scrollQueued = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;

      let current = "";
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 200) {
          current = section.getAttribute("id");
        }
      });

      mobilenavLi.forEach((li) => {
        li.classList.toggle("activeThismobiletab", li.classList.contains(current));
      });
      navLi.forEach((li) => {
        li.classList.toggle("activeThistab", li.classList.contains(current));
      });

      if (backToTop) {
        backToTop.style.display = window.scrollY > 400 ? "block" : "none";
      }
    });
  },
  { passive: true }
);

/* ------------------------------------------------------------ project cards */

// Spotlight that follows the pointer inside each card (CSS reads --x / --y).
document.querySelectorAll(".project-box").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--y", `${e.clientY - rect.top}px`);
  });
});

// "Click to preview" label that trails the cursor over a project card.
const previewCursor = document.createElement("div");
previewCursor.className = "live-preview-cursor";
previewCursor.textContent = t("Click to preview ▶️", "Кликните для просмотра ▶️");
previewCursor.style.display = "none";
document.body.appendChild(previewCursor);

const isDesktopScreen = () => window.innerWidth >= 900;
let hideTimeoutId;

document.querySelectorAll(".project-box").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    if (!isDesktopScreen()) return;
    previewCursor.style.left = `${e.clientX}px`;
    previewCursor.style.top = `${e.clientY}px`;
  });

  card.addEventListener("mouseenter", () => {
    if (!isDesktopScreen()) return;
    clearTimeout(hideTimeoutId);
    previewCursor.style.display = "block";
    setTimeout(() => {
      previewCursor.style.opacity = "1";
    }, 10);
  });

  card.addEventListener("mouseleave", () => {
    if (!isDesktopScreen()) return;
    previewCursor.style.opacity = "0";
    hideTimeoutId = setTimeout(() => {
      previewCursor.style.display = "none";
    }, 300);
  });
});

/* ----------------------------------------------------------- custom cursor */

const cursorInner = document.getElementById("cursor-inner");
const cursorOuter = document.getElementById("cursor-outer");

if (cursorInner && cursorOuter) {
  document.addEventListener(
    "mousemove",
    (e) => {
      cursorInner.style.left = `${e.clientX}px`;
      cursorInner.style.top = `${e.clientY}px`;
      cursorOuter.animate(
        { left: `${e.clientX}px`, top: `${e.clientY}px` },
        { duration: 500, fill: "forwards" }
      );
    },
    { passive: true }
  );

  // Registered once. The old version re-bound these on every mousemove,
  // which leaked thousands of listeners per session.
  document.querySelectorAll("a,label,button").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursorInner.classList.add("hover");
      cursorOuter.classList.add("hover");
    });
    el.addEventListener("mouseleave", () => {
      cursorInner.classList.remove("hover");
      cursorOuter.classList.remove("hover");
    });
  });
}

/* ------------------------------------------------------------- video modal */

const modalLoader = document.getElementById("modalLoader");
const modalLoaderText = document.getElementById("modalLoaderText");
let loaderTimeoutId;

if (modalLoaderText) {
  modalLoaderText.textContent = t("Loading preview…", "Загружаем превью…");
}

function hideModalLoader() {
  clearTimeout(loaderTimeoutId);
  if (modalLoader) modalLoader.classList.add("is-hidden");
}

function showVideoModal(element) {
  const modal = document.getElementById("videoModal");
  const iframe = document.getElementById("videoFrame");
  const url = element.getAttribute("preview-video-url");
  if (!url) return;

  // Google Drive takes a second or two to paint; cover the black rectangle
  // until its frame reports load, and give up after 15s so a blocked embed
  // never leaves the spinner running forever.
  if (modalLoader) modalLoader.classList.remove("is-hidden");
  clearTimeout(loaderTimeoutId);
  loaderTimeoutId = setTimeout(hideModalLoader, 15000);

  iframe.src = url;
  modal.style.display = "block";
  document.body.style.overflowY = "hidden";
}

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  hideModalLoader();
  document.getElementById("videoFrame").src = "";
  modal.style.display = "none";
  document.body.style.overflowY = "auto";
}

const videoModal = document.getElementById("videoModal");
if (videoModal) {
  const frame = document.getElementById("videoFrame");
  // Fires for the real embed and for the about:blank reset on close; harmless
  // either way, since opening always re-shows the loader first.
  if (frame) frame.addEventListener("load", hideModalLoader);

  const closeIfBackdrop = (e) => {
    if (e.target === videoModal) closeVideoModal();
  };
  videoModal.addEventListener("click", closeIfBackdrop);
  videoModal.addEventListener("touchstart", closeIfBackdrop, { passive: true });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeVideoModal();
  });
}

/* -------------------------------------------------------------------- misc */

const yearRange = document.getElementById("yearRange");
if (yearRange) yearRange.textContent = `2021 - ${new Date().getFullYear()}`;

document.addEventListener(
  "contextmenu",
  (e) => {
    if (e.target.nodeName === "IMG") e.preventDefault();
  },
  false
);

console.log(
  "%c Designed and Developed by Makarenko Nikita ",
  "background-image: linear-gradient(90deg,#8000ff,#6bc5f8); color: white;font-weight:900;font-size:1rem; padding:20px;"
);
