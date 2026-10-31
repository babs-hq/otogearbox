// Otogearbox site scripts: branch list, region filter, part request form, hero carousel

const branches = [
  { city: "Lagos", region: "sw", hq: true, phone: "08035382603",
    addr: "Shop 79, Block G75-76, Tudas International (Bakkasi) Market, Ladipo, Lagos" },
  { city: "Abuja", region: "n", phone: "09063342570",
    addr: "Shop 15, Ijele Zuba, behind Motor Spare Part, Abuja" },
  { city: "Ibadan", region: "sw", phone: "07077766460",
    addr: "Shop 4, E/201 Ibrahim Complex, opp. NTA Junction, Agodi Gate, Ibadan, Oyo State" },
  { city: "Onitsha", region: "se", phone: "08151799341",
    addr: "Block E, Shop 60, Gift Plaza, 108 City Biscuit Road, Ugwuagba, Obosi, Onitsha, Anambra State" },
  { city: "Port Harcourt", region: "se", phone: "08064746131", photo: "port-harcourt",
    addr: "No. 37 Azikiwe Road, Mile 2 Diobu, Port Harcourt" },
  { city: "Kaduna", region: "n", phone: "08144275417", photo: "kaduna",
    addr: "5 Lagos Street, by Gwandu Road, Kaduna" },
  { city: "Kano", region: "n", phone: "07010634394", photo: "kano",
    addr: "No. 90 Niger Road / Ibo Road, Sabon Gari, Kano" },
];

const intl = p => "+234" + p.slice(1);
const pretty = p => p.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
const pin = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';

// Shopfront photo, or a placeholder until that branch sends one
const shopfront = b => b.photo
  ? `<img class="branch-photo" src="assets/branches/${b.photo}.webp" width="800" height="600"
       loading="lazy" alt="Otogearbox shopfront in ${b.city}">`
  : `<div class="branch-photo is-empty"><img src="assets/logo-sm.webp" alt=""><span>Shop photo coming soon</span></div>`;

const grid = document.getElementById("branchGrid");
function render(region) {
  grid.innerHTML = branches
    .filter(b => region === "all" || b.region === region)
    .map(b => `
      <article class="card branch">
        ${shopfront(b)}
        <div class="branch-top">
          <h3>${b.city}</h3>
          ${b.hq ? '<span class="tag">Head office</span>' : ""}
        </div>
        <a class="phone" href="tel:${intl(b.phone)}">${pretty(b.phone)}</a>
        <div class="addr">${pin}<span>${b.addr}</span></div>
        <div class="branch-actions">
          <a class="btn btn-navy btn-sm" href="tel:${intl(b.phone)}">Call</a>
          <a class="btn btn-wa btn-sm" target="_blank" rel="noopener"
             href="https://wa.me/${intl(b.phone).slice(1)}?text=${encodeURIComponent(`Hello Otogearbox ${b.city}, I'd like to ask about a part.`)}">WhatsApp</a>
          <a class="btn btn-outline btn-sm btn-dir" target="_blank" rel="noopener"
             href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.addr)}">Directions</a>
        </div>
      </article>`).join("");
}
render("all");

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", "false"));
    chip.setAttribute("aria-pressed", "true");
    render(chip.dataset.region);
  });
});

document.getElementById("branchSelect").innerHTML =
  branches.map(b => `<option>${b.city}</option>`).join("");
document.getElementById("footBranches").innerHTML =
  branches.map(b => `<li><a href="tel:${intl(b.phone)}">${b.city}: ${pretty(b.phone)}</a></li>`).join("");
document.getElementById("yr").textContent = new Date().getFullYear();

document.getElementById("reqForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const msg = [
    "Hello Otogearbox, I'd like to request a part.",
    `Name: ${f.get("name")}`,
    `Nearest branch: ${f.get("branch")}`,
    `Vehicle: ${f.get("vehicle")} ${f.get("year") || ""}`.trim(),
    `Part: ${f.get("part")}`,
    f.get("details") ? `Details: ${f.get("details")}` : ""
  ].filter(Boolean).join("\n");
  window.open("https://wa.me/19087647494?text=" + encodeURIComponent(msg), "_blank", "noopener");
});

// Hero parts carousel: cross-fade every 3.5s, pause on hover/focus or when the tab is hidden
(function () {
  const stage = document.getElementById("stage");
  const slides = [...stage.querySelectorAll(".slide")];
  const nameEl = document.querySelector("#partName span");
  const dots = document.getElementById("dots");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i = 0, timer = null;

  slides.forEach((s, n) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Show " + s.querySelector("img").alt);
    b.addEventListener("click", () => { go(n); restart(); });
    dots.appendChild(b);
  });

  function go(n) {
    if (n === i) return paint();
    const prev = slides[i];
    prev.classList.remove("is-active");
    prev.classList.add("is-leaving");
    setTimeout(() => prev.classList.remove("is-leaving"), 1100);
    i = n;
    paint();
  }
  function paint() {
    slides.forEach((s, n) => s.classList.toggle("is-active", n === i));
    [...dots.children].forEach((d, n) => d.setAttribute("aria-current", n === i ? "true" : "false"));
    nameEl.parentElement.style.opacity = 0;
    setTimeout(() => { nameEl.textContent = slides[i].querySelector("img").alt; nameEl.parentElement.style.opacity = 1; }, 250);
  }
  function start() { if (!reduce && !timer) timer = setInterval(() => go((i + 1) % slides.length), 3500); }
  function stop() { clearInterval(timer); timer = null; }
  function restart() { stop(); start(); }

  const box = stage.parentElement;
  box.addEventListener("mouseenter", stop);
  box.addEventListener("mouseleave", start);
  box.addEventListener("focusin", stop);
  box.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  paint();
  start();
})();
