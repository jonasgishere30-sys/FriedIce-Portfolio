// Gallery images. Add, remove or rename entries here.
// Only images that load are shown; the section stays hidden until one does.
const BUILDS = [
  { src: "images/build-1.jpg", title: "Cottage exterior", alt: "A white cottage with a front porch, flower boxes, lanterns and round trees under a blue sky." },
  { src: "images/build-2.jpg", title: "Living room", alt: "A warm living room with a stone fireplace, red armchairs, a green sofa and large windows." },
  { src: "images/build-3.jpg", title: "Treasure chest", alt: "A wooden treasure chest with dark iron bands, rivets and a brass lock." },
  { src: "images/build-4.jpg", title: "Brass lantern", pos: "50% 40%", alt: "A tall black and brass lantern with a ring handle and a caged glass body." },
  { src: "images/build-5.jpg", title: "Kitchen and dining", alt: "A kitchen with green cabinets, a marble island, bar stools and a wooden dining table." },
  { src: "images/build-6.jpg", title: "Longsword hilt", pos: "50% 28%", alt: "Close-up of a longsword hilt with a curved brass guard, leather grip and a ruby in the pommel." },
];

const DISCORD = "friedice_";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- Copy Discord name ---------- */
const toast = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const ok = await copyText(btn.dataset.copy || DISCORD);
    showToast(ok ? "Copied" : `Discord: ${DISCORD}`);
  });
});

/* ---------- Hero: glint + tilt ---------- */
const frame = document.getElementById("frame");

function playGlint() {
  if (reduceMotion || !frame) return;
  frame.classList.remove("glinting");
  void frame.offsetWidth; // restart the animation
  frame.classList.add("glinting");
}

if (frame) {
  const heroImg = frame.querySelector("img");
  const startGlint = () => setTimeout(playGlint, 650);
  if (heroImg.complete) startGlint();
  else heroImg.addEventListener("load", startGlint, { once: true });

  if (!reduceMotion && finePointer) {
    const MAX = 9; // degrees
    let raf = 0;
    let target = { rx: 0, ry: 0 };

    const apply = () => {
      frame.style.setProperty("--rx", target.rx.toFixed(2) + "deg");
      frame.style.setProperty("--ry", target.ry.toFixed(2) + "deg");
      raf = 0;
    };

    frame.addEventListener("mouseenter", () => {
      frame.classList.add("is-tracking");
      playGlint();
    });

    frame.addEventListener("mousemove", (e) => {
      const r = frame.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      target = { rx: -y * MAX, ry: x * MAX };
      if (!raf) raf = requestAnimationFrame(apply);
    });

    frame.addEventListener("mouseleave", () => {
      frame.classList.remove("is-tracking");
      target = { rx: 0, ry: 0 };
      apply();
    });
  }
}

/* ---------- Gallery ---------- */
const section = document.getElementById("builds");
const grid = document.getElementById("grid");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbCap = document.getElementById("lightbox-cap");
let lastFocus = null;

function openLightbox(build) {
  lastFocus = document.activeElement;
  lbImg.src = build.src;
  lbImg.alt = build.alt;
  lbCap.textContent = build.title;
  if (typeof lightbox.showModal === "function") lightbox.showModal();
  else lightbox.setAttribute("open", "");
}

function closeLightbox() {
  if (lightbox.open) lightbox.close();
}

lightbox.addEventListener("click", closeLightbox);
lightbox.addEventListener("close", () => {
  if (lastFocus) lastFocus.focus();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// Placeholders keep the original order even if images load out of order.
const slots = BUILDS.map((build) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tile";
  btn.setAttribute("aria-label", `Open full-size image: ${build.title}`);
  return { build, btn, ok: false };
});

function render() {
  const loaded = slots.filter((s) => s.ok);
  if (!loaded.length) return;
  grid.replaceChildren(...loaded.map((s) => s.btn));
  grid.classList.toggle("has-feature", loaded.length >= 3);
  section.hidden = false;
  requestAnimationFrame(() => loaded.forEach((s) => s.btn.classList.add("is-in")));
}

slots.forEach((slot) => {
  const img = new Image();
  img.decoding = "async";
  img.alt = slot.build.alt;
  if (slot.build.pos) img.style.objectPosition = slot.build.pos;
  img.onload = () => {
    slot.ok = true;
    const cap = document.createElement("span");
    cap.className = "tile__cap";
    cap.textContent = slot.build.title;
    slot.btn.append(img, cap);
    slot.btn.addEventListener("click", () => openLightbox(slot.build));
    render();
  };
  img.onerror = () => { slot.ok = false; };
  img.src = slot.build.src;
});

document.getElementById("year").textContent = new Date().getFullYear();
