/* =========================================================
   trpgfox — landing page interactions
   - clock
   - rarity tier coloring
   - dice roll (konami / `roll` keyword / ?roll / stat click)
   - logo 7-click easter egg
   - console greeting
   ========================================================= */

(() => {
  "use strict";

  /* ---------- console greeting ---------- */
  const fox = [
    "%c",
    "   /\\   /\\        trpgfox",
    "  ( o.o )       solo dev · Unity · TRPG",
    "   > ^ <        github.com/trpgfox",
    "",
    "  > 발견 보상: 콘솔에 trpg.roll() 입력",
  ].join("\n");
  console.log(fox, "color:#efece5;font-family:monospace;line-height:1.4");

  /* ---------- tier color tagging ---------- */
  document.querySelectorAll(".tier").forEach((el) => {
    const t = el.textContent.trim().toLowerCase();
    if (t) el.classList.add("t-" + t);
  });

  /* ---------- clock ---------- */
  const clock = document.getElementById("clock");
  const seed = document.getElementById("seed");
  const lvl = document.getElementById("lvl");

  const tick = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    if (clock) clock.textContent = `${hh}:${mm}:${ss}`;
  };
  tick(); setInterval(tick, 1000);

  // session seed (stable for the session, varies per visit)
  if (seed) {
    const s = Math.random().toString(36).slice(2, 7);
    seed.textContent = `seed ${s}`;
  }

  // level — playful: random 7~14 per session, hint of experience
  if (lvl) lvl.textContent = (7 + Math.floor(Math.random() * 8)).toString();

  /* ---------- dice roller ---------- */
  const stage = document.getElementById("diceStage");
  const dice = document.getElementById("dice");
  const result = document.getElementById("diceResult");
  let rollLock = false;

  const rollD20 = (flavor = "") => {
    if (rollLock || !stage || !dice) return;
    rollLock = true;
    const n = 1 + Math.floor(Math.random() * 20);
    stage.classList.add("show");
    dice.classList.remove("rolling");
    void dice.offsetWidth; // restart anim
    dice.classList.add("rolling");
    // mid-roll number scramble
    let ticks = 0;
    const scramble = setInterval(() => {
      dice.querySelector(".d-face").textContent = 1 + Math.floor(Math.random() * 20);
      ticks++;
      if (ticks > 7) {
        clearInterval(scramble);
        dice.querySelector(".d-face").textContent = n;
        let line = `d20 → ${n}`;
        if (flavor) line += ` · ${flavor}`;
        if (n === 20) line += " · CRITICAL";
        if (n === 1) line += " · FUMBLE";
        if (result) result.textContent = line;
      }
    }, 60);
    setTimeout(() => {
      stage.classList.remove("show");
      rollLock = false;
    }, 1800);
  };

  // expose for console
  window.trpg = {
    roll: (sides = 20) => {
      const n = 1 + Math.floor(Math.random() * sides);
      console.log(`%c d${sides} → ${n}`, "font-family:monospace;color:#efece5;font-weight:700");
      rollD20();
      return n;
    },
    fox: () => console.log(fox, "color:#efece5;font-family:monospace"),
  };

  /* ---------- stat click = ability check ---------- */
  document.querySelectorAll(".stat").forEach((el) => {
    el.addEventListener("click", () => {
      const which = el.dataset.roll || "STR";
      const modText = el.querySelector(".mod")?.textContent || "+0";
      rollD20(`${which} check (${modText})`);
    });
  });

  /* ---------- konami ---------- */
  const konami = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let kIdx = 0;
  window.addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === konami[kIdx]) {
      kIdx++;
      if (kIdx === konami.length) {
        kIdx = 0;
        rollD20("KONAMI");
      }
    } else {
      kIdx = (k === konami[0]) ? 1 : 0;
    }
  });

  /* ---------- type "roll" anywhere ---------- */
  let buf = "";
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-8);
    if (buf.endsWith("roll")) rollD20("typed: roll");
    else if (buf.endsWith("fox")) {
      document.documentElement.animate(
        [{ filter: "invert(0)" }, { filter: "invert(1)" }, { filter: "invert(0)" }],
        { duration: 360, easing: "ease-out" }
      );
    }
  });

  /* ---------- ?roll URL ---------- */
  if (location.search.includes("roll") || location.hash === "#roll") {
    setTimeout(() => rollD20("via URL"), 400);
  }

  /* ---------- logo 7-clicks ---------- */
  let logoClicks = 0;
  let logoTimer;
  document.querySelector(".brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => { logoClicks = 0; }, 1500);
    if (logoClicks >= 7) {
      logoClicks = 0;
      rollD20("hidden ritual");
    } else {
      // smooth scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  /* ---------- gentle reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.style.opacity = "1";
        en.target.style.transform = "translateY(0)";
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".section-head, .stat, .quest-card, .timeline li, .ch, .hero-card").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)";
    io.observe(el);
  });
})();
