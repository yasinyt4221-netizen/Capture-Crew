const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const hero = document.querySelector(".hero");
const instagramDmLinks = document.querySelectorAll("[data-instagram-dm]");
const instagramStatus = document.querySelector("[data-instagram-status]");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
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

function initHeroMotion() {
  if (!hero || reduceMotionQuery.matches) return;

  const root = document.documentElement;
  const state = {
    rotateX: 0,
    rotateY: 0,
    panX: 0,
    scrollY: 0,
    scale: 1,
    stageShift: 0,
    targetRotateX: 0,
    targetRotateY: 0,
    targetPanX: 0,
    targetScrollY: 0,
    targetScale: 1,
    targetStageShift: 0,
  };

  const lerp = (start, end, amount) => start + (end - start) * amount;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function updatePointer(clientX, clientY) {
    const x = clamp((clientX / window.innerWidth - 0.5) * 2, -1, 1);
    const y = clamp((clientY / window.innerHeight - 0.5) * 2, -1, 1);
    state.targetRotateY = x * 2.8;
    state.targetRotateX = y * -2.4;
    state.targetPanX = x * 2;
  }

  function updateScrollMotion() {
    const viewport = window.innerHeight || 1;
    const progress = clamp(window.scrollY / viewport, 0, 1);
    state.targetScrollY = progress * 26;
    state.targetScale = 1 + progress * 0.018;
    state.targetStageShift = progress * 18;
  }

  function renderMotion() {
    state.rotateX = lerp(state.rotateX, state.targetRotateX, 0.08);
    state.rotateY = lerp(state.rotateY, state.targetRotateY, 0.08);
    state.panX = lerp(state.panX, state.targetPanX, 0.08);
    state.scrollY = lerp(state.scrollY, state.targetScrollY, 0.08);
    state.scale = lerp(state.scale, state.targetScale, 0.08);
    state.stageShift = lerp(state.stageShift, state.targetStageShift, 0.08);

    root.style.setProperty("--logo-rotate-x", `${state.rotateX.toFixed(2)}deg`);
    root.style.setProperty("--logo-rotate-y", `${state.rotateY.toFixed(2)}deg`);
    root.style.setProperty("--logo-pan-x", `${state.panX.toFixed(2)}px`);
    root.style.setProperty("--logo-scroll-y", `${state.scrollY.toFixed(2)}px`);
    root.style.setProperty("--logo-scale", state.scale.toFixed(3));
    root.style.setProperty("--stage-shift", `${state.stageShift.toFixed(2)}px`);

    requestAnimationFrame(renderMotion);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      updatePointer(event.clientX, event.clientY);
    },
    { passive: true },
  );

  window.addEventListener("pointerleave", () => {
    state.targetRotateX = 0;
    state.targetRotateY = 0;
    state.targetPanX = 0;
  });

  window.addEventListener("scroll", updateScrollMotion, { passive: true });
  window.addEventListener("resize", updateScrollMotion);
  updateScrollMotion();
  requestAnimationFrame(renderMotion);
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
initHeroMotion();
