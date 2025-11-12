var audio = document.getElementById("audioPlayer"),
  loader = document.getElementById("preloader");
function settingtoggle() {
  document
    .getElementById("setting-container")
    .classList.toggle("settingactivate"),
    document
      .getElementById("visualmodetogglebuttoncontainer")
      .classList.toggle("visualmodeshow"),
    document
      .getElementById("soundtogglebuttoncontainer")
      .classList.toggle("soundmodeshow");
}
function playpause() {
  !1 == document.getElementById("switchforsound").checked
    ? audio.pause()
    : audio.play();
}
function visualmode() {
  document.body.classList.toggle("light-mode"),
    document.querySelectorAll(".needtobeinvert").forEach(function (e) {
      e.classList.toggle("invertapplied");
    });
}
window.addEventListener("load", function () {
  (loader.style.display = "none"),
    document.querySelector(".hey").classList.add("popup");
});
let emptyArea = document.getElementById("emptyarea"),
  mobileTogglemenu = document.getElementById("mobiletogglemenu");
function hamburgerMenu() {
  document.body.classList.toggle("stopscrolling"),
    document
      .getElementById("mobiletogglemenu")
      .classList.toggle("show-toggle-menu"),
    document
      .getElementById("burger-bar1")
      .classList.toggle("hamburger-animation1"),
    document
      .getElementById("burger-bar2")
      .classList.toggle("hamburger-animation2"),
    document
      .getElementById("burger-bar3")
      .classList.toggle("hamburger-animation3");
}
function hidemenubyli() {
  document.body.classList.toggle("stopscrolling"),
    document
      .getElementById("mobiletogglemenu")
      .classList.remove("show-toggle-menu"),
    document
      .getElementById("burger-bar1")
      .classList.remove("hamburger-animation1"),
    document
      .getElementById("burger-bar2")
      .classList.remove("hamburger-animation2"),
    document
      .getElementById("burger-bar3")
      .classList.remove("hamburger-animation3");
}
const sections = document.querySelectorAll("section"),
  navLi = document.querySelectorAll(".navbar .navbar-tabs .navbar-tabs-ul li"),
  mobilenavLi = document.querySelectorAll(
    ".mobiletogglemenu .mobile-navbar-tabs-ul li"
  );
window.addEventListener("scroll", () => {
  let e = "";
  sections.forEach((t) => {
    let o = t.offsetTop;
    t.clientHeight, pageYOffset >= o - 200 && (e = t.getAttribute("id"));
  }),
    mobilenavLi.forEach((t) => {
      t.classList.remove("activeThismobiletab"),
        t.classList.contains(e) && t.classList.add("activeThismobiletab");
    }),
    navLi.forEach((t) => {
      t.classList.remove("activeThistab"),
        t.classList.contains(e) && t.classList.add("activeThistab");
    });
}),
  console.log(
    "%c Designed and Developed by Makarenko Nikita ",
    "background-image: linear-gradient(90deg,#8000ff,#6bc5f8); color: white;font-weight:900;font-size:1rem; padding:20px;"
  );
let mybutton = document.getElementById("backtotopbutton");
function scrollFunction() {
  document.body.scrollTop > 400 || document.documentElement.scrollTop > 400
    ? (mybutton.style.display = "block")
    : (mybutton.style.display = "none");
}
function scrolltoTopfunction() {
  (document.body.scrollTop = 0), (document.documentElement.scrollTop = 0);
}
(window.onscroll = function () {
  scrollFunction();
}),
  document.addEventListener(
    "contextmenu",
    function (e) {
      "IMG" === e.target.nodeName && e.preventDefault();
    },
    !1
  );
let Pupils = document.getElementsByClassName("footer-pupil"),
  pupilsArr = Array.from(Pupils),
  pupilStartPoint = -10,
  pupilRangeX = 20,
  pupilRangeY = 15,
  mouseXStartPoint = 0,
  mouseXEndPoint = window.innerWidth,
  currentXPosition = 0,
  fracXValue = 0,
  mouseYEndPoint = window.innerHeight,
  currentYPosition = 0,
  fracYValue = 0,
  mouseXRange = mouseXEndPoint - mouseXStartPoint;
const mouseMove = (e) => {
    (fracXValue =
      (currentXPosition = e.clientX - mouseXStartPoint) / mouseXRange),
      (fracYValue = (currentYPosition = e.clientY) / mouseYEndPoint);
    let t = pupilStartPoint + fracXValue * pupilRangeX,
      o = pupilStartPoint + fracYValue * pupilRangeY;
    pupilsArr.forEach((e) => {
      e.style.transform = `translate(${t}px, ${o}px)`;
    });
  },
  windowResize = (e) => {
    (mouseXEndPoint = window.innerWidth),
      (mouseYEndPoint = window.innerHeight),
      (mouseXRange = mouseXEndPoint - mouseXStartPoint);
  };
window.addEventListener("mousemove", mouseMove),
  window.addEventListener("resize", windowResize);

document.querySelectorAll(".project-box").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
  });
});

const previewCursor = document.createElement("div");
previewCursor.className = "live-preview-cursor";
// Default preview text (Russian)
let previewText = "Кликните для просмотра ▶️";
// If the page is the English index (eng/index.html or /eng/), override to English
const pathname = window.location.pathname || "";
const isEngIndex = /\/eng(\/(index\.html)?)?$/.test(pathname);
if (isEngIndex) {
  previewText = "Click to preview ▶️";
}
previewCursor.textContent = previewText;
document.body.appendChild(previewCursor);

const projectCards = document.querySelectorAll(".project-box");
let hideTimeoutId;

function isDesktopScreen() {
  return window.innerWidth >= 900;
}

function updateCursorVisibility() {
  previewCursor.style.display = isDesktopScreen() ? "none" : "none";
}

// Начальная проверка при загрузке
updateCursorVisibility();

// Слушаем изменение размера окна
window.addEventListener("resize", updateCursorVisibility);

projectCards.forEach((card) => {
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
