const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const bookingForm = document.querySelector("#booking-form");
const dmPreview = document.querySelector("#dm-preview");
const formStatus = document.querySelector("[data-form-status]");
const copyButton = document.querySelector("[data-copy-dm]");
const whatsappLinks = document.querySelectorAll("[data-whatsapp-link]");
const whatsappBaseUrl = "https://wa.me/917396906771";
const hero = document.querySelector(".hero");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

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
    rotateY: -1,
    panX: 0,
    scrollY: 0,
    scale: 1,
    stageShift: 0,
    targetRotateX: 0,
    targetRotateY: -1,
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
    state.targetRotateY = x * 5.2 - 1;
    state.targetRotateX = y * -3.4;
    state.targetPanX = x * 10;
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
    state.targetRotateY = -1;
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

function getSelectedProjectType() {
  const selected = bookingForm?.querySelector("input[name='projectType']:checked");
  return selected?.value || "Cinematic shoot";
}

function buildMessage() {
  if (!bookingForm) return "";

  const formData = new FormData(bookingForm);
  const clientName = formData.get("clientName") || "Name/handle to share";
  const projectType = getSelectedProjectType();
  const date = formData.get("shootDate") || "Flexible date";
  const location = formData.get("shootLocation") || "Location to confirm";
  const notes = formData.get("shootNotes") || "I can share references, timing, and deliverables.";

  return [
    "Hi Capture Crew, I would like to start a project.",
    `Name/handle: ${clientName}`,
    `Project type: ${projectType}`,
    `Date: ${date}`,
    `Location: ${location}`,
    `Brief: ${notes}`,
  ].join("\n");
}

function updateDmPreview() {
  if (!dmPreview) return;
  const message = buildMessage();
  dmPreview.value = message;
  updateWhatsAppLinks(message);
}

function updateWhatsAppLinks(message = buildMessage()) {
  const url = `${whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
  whatsappLinks.forEach((link) => {
    link.href = url;
  });
}

async function copyDmMessage() {
  const message = buildMessage();

  try {
    await navigator.clipboard.writeText(message);
    if (formStatus) {
      formStatus.textContent = "Brief copied. Open WhatsApp or Instagram and paste it to start the booking.";
    }
  } catch (error) {
    dmPreview?.focus();
    dmPreview?.select();
    if (formStatus) formStatus.textContent = "Select the message preview and copy it from the field.";
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

bookingForm?.addEventListener("input", updateDmPreview);
copyButton?.addEventListener("click", copyDmMessage);

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
updateDmPreview();
initHeroMotion();
