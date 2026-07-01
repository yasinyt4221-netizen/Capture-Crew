const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const bookingForm = document.querySelector("#booking-form");
const dmPreview = document.querySelector("#dm-preview");
const formStatus = document.querySelector("[data-form-status]");
const copyButton = document.querySelector("[data-copy-dm]");
const whatsappLinks = document.querySelectorAll("[data-whatsapp-link]");
const whatsappBaseUrl = "https://wa.me/917396906771";

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
