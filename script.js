const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const instagramDmLinks = document.querySelectorAll("[data-instagram-dm]");
const instagramStatus = document.querySelector("[data-instagram-status]");
const heroPreviewVideos = Array.from(document.querySelectorAll(".hero-device-screen video"));
const workVideos = Array.from(document.querySelectorAll(".work-video-frame video"));
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileHeroQuery = window.matchMedia("(max-width: 680px)");
const instagramServicesMessage = [
  "Hi Capture Crew, I want to know about your services.",
  "I am interested in:",
  "- Cinematic shoots",
  "- Instagram reels",
  "- Event coverage",
  "- Brand and commercial shoots",
  "- Portrait shoots",
  "- Editing and color",
  "- Content strategy",
  "- iPhone 17 Pro Max style shoots",
  "Please share your packages, availability, and booking details.",
].join("\n");

if (window.lucide) {
  window.lucide.createIcons({
    attrs: {
      "aria-hidden": "true",
      focusable: "false",
    },
  });
}

function updateHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeNavigation() {
  if (!siteNav || !navToggle) return;
  siteNav.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  header?.classList.remove("nav-active");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
}

function toggleNavigation() {
  if (!siteNav || !navToggle) return;
  const isOpen = siteNav.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", isOpen);
  header?.classList.toggle("nav-active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

async function openInstagramDmWithMessage(event) {
  const link = event.currentTarget;
  if (!(link instanceof HTMLAnchorElement)) return;

  event.preventDefault();
  const dmWindow = window.open("", "_blank");
  if (dmWindow) dmWindow.opener = null;

  try {
    const copied = await copyTextToClipboard(instagramServicesMessage);
    if (instagramStatus) {
      instagramStatus.textContent = copied
        ? "Services message copied. Paste it in the Instagram DM."
        : "Instagram DM is opening. Ask for cinematic shoots, reels, events, portraits, and brand work.";
    }
  } catch (error) {
    if (instagramStatus) {
      instagramStatus.textContent = "Instagram DM is opening. Ask for cinematic shoots, reels, events, portraits, and brand work.";
    }
  }

  if (dmWindow) {
    dmWindow.location.href = link.href;
  } else {
    window.location.href = link.href;
  }
}

function pauseVideo(video) {
  video.pause();
  video.closest(".work-video-card")?.classList.remove("is-playing");
}

function prepareSilentLoop(video) {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("loop", "");
  video.setAttribute("playsinline", "");
}

function playVideo(video) {
  const playRequest = video.play();
  if (playRequest) {
    playRequest.catch(() => pauseVideo(video));
  }
}

function isVideoDisplayed(video) {
  return getComputedStyle(video).display !== "none";
}

function syncHeroPreviewPlayback() {
  heroPreviewVideos.forEach((video) => {
    if (reducedMotionQuery.matches || !isVideoDisplayed(video)) {
      video.pause();
      return;
    }

    playVideo(video);
  });
}

function setupHeroPreviewVideos() {
  if (!heroPreviewVideos.length) return;

  heroPreviewVideos.forEach((video) => {
    prepareSilentLoop(video);
    video.autoplay = true;
    video.setAttribute("autoplay", "");
  });

  syncHeroPreviewPlayback();
  reducedMotionQuery.addEventListener?.("change", syncHeroPreviewPlayback);
  mobileHeroQuery.addEventListener?.("change", syncHeroPreviewPlayback);
}

function setupVideoAutoplay() {
  if (!workVideos.length) return;

  workVideos.forEach(prepareSilentLoop);

  if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) return;

  const visibility = new Map(workVideos.map((video) => [video, 0]));

  function syncPlayingVideo() {
    if (document.hidden) {
      workVideos.forEach(pauseVideo);
      return;
    }

    let bestVideo = null;
    let bestRatio = 0;

    visibility.forEach((ratio, video) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestVideo = video;
      }
    });

    workVideos.forEach((video) => {
      if (video === bestVideo && bestRatio >= 0.28) {
        video.closest(".work-video-card")?.classList.add("is-playing");
        playVideo(video);
      } else {
        pauseVideo(video);
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibility.set(entry.target, entry.intersectionRatio);
      });
      syncPlayingVideo();
    },
    {
      root: null,
      rootMargin: "-6% 0px -6% 0px",
      threshold: [0, 0.2, 0.28, 0.48, 0.7, 0.9],
    },
  );

  workVideos.forEach((video) => observer.observe(video));
  document.addEventListener("visibilitychange", syncPlayingVideo);
  reducedMotionQuery.addEventListener?.("change", () => {
    if (reducedMotionQuery.matches) workVideos.forEach(pauseVideo);
  });
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 980) closeNavigation();
});

navToggle?.addEventListener("click", toggleNavigation);
siteNav?.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLAnchorElement) closeNavigation();
});

instagramDmLinks.forEach((link) => {
  link.addEventListener("click", openInstagramDmWithMessage);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNavigation();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

updateHeaderState();
setupHeroPreviewVideos();
setupVideoAutoplay();
