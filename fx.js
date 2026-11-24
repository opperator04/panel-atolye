// PanelAtölye — görsel efektler (form ve menü mantığı app.js'te)
(() => {
  window.__fx = true;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Navbar: kaydırınca cam efekti
  const nav = document.getElementById("navbar");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Arka plan videosu: hareket azaltma tercihinde durdur
  const vid = document.getElementById("heroVideo");
  if (vid && reduce) { vid.removeAttribute("autoplay"); vid.pause(); }

  // Görünce belirme
  const items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
  } else {
    document.querySelectorAll(".cards-grid, .steps-grid, .facts-grid").forEach((g) =>
      g.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--rd", i * 0.09 + "s"))
    );
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    items.forEach((el) => io.observe(el));
  }

  // Kartlarda imleci takip eden ışık
  if (fine) {
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  // Panel önizlemesi: hafif 3D eğim
  const stage = document.querySelector(".mockup-stage");
  const mock = document.getElementById("mockup");
  if (stage && mock && fine && !reduce) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      mock.style.setProperty("--ry", (x * 5).toFixed(2) + "deg");
      mock.style.setProperty("--rx", (-y * 4).toFixed(2) + "deg");
    });
    stage.addEventListener("pointerleave", () => {
      mock.style.setProperty("--rx", "0deg");
      mock.style.setProperty("--ry", "0deg");
    });
  }

  // Sayaçlar: sayfa açılınca rakamlar yukarı sayar
  if (!reduce) {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const end = Number(el.dataset.count);
      const prefix = el.dataset.prefix || "";
      const t0 = performance.now() + 900, dur = 1500;
      const fmt = (n) => prefix + Math.round(n).toLocaleString("tr-TR");
      el.textContent = fmt(0);
      const tick = (t) => {
        const p = Math.min(Math.max((t - t0) / dur, 0), 1);
        el.textContent = fmt(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + end.toLocaleString("tr-TR");
      };
      requestAnimationFrame(tick);
    });
  }

  // ================= Apple tarzı kaydırma sahneleri =================
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  // Manifesto: metni kelimelere böl
  const mText = document.getElementById("manifestoText");
  let words = [];
  if (mText) {
    const src = mText.dataset.text;
    mText.setAttribute("aria-label", mText.textContent);
    mText.textContent = "";
    src.split(" ").forEach((raw, i, arr) => {
      const hl = raw.startsWith("*") || raw.endsWith("*") || (mText._hl && !raw.includes("*"));
      // *...* ile işaretli aralıklar vurgulu
      let w = raw;
      if (raw.startsWith("*")) { mText._hl = true; w = raw.slice(1); }
      const ends = w.endsWith("*");
      if (ends) w = w.slice(0, -1);
      const span = document.createElement("span");
      span.className = "w" + (mText._hl ? " hl" : "");
      span.setAttribute("aria-hidden", "true");
      span.textContent = w;
      mText.appendChild(span);
      if (ends) mText._hl = false;
      if (i < arr.length - 1) mText.appendChild(document.createTextNode(" "));
    });
    words = Array.from(mText.querySelectorAll(".w"));
  }

  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");
  const manifesto = document.getElementById("manifesto");
  const showcase = document.getElementById("showcase");
  const phone = document.getElementById("phone");
  const steps = showcase ? showcase.querySelectorAll(".show-steps li") : [];
  const dots = showcase ? showcase.querySelectorAll(".show-dots i") : [];
  const screens = phone ? phone.querySelectorAll(".screen") : [];
  let lastIdx = 0;

  const sectionProgress = (el) => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - window.innerHeight));
  };

  // Telefonu ekran yüksekliğine sığdır (nav payı 74px + boşluk)
  function fit() {
    if (!phone) return;
    const isMobile = window.innerWidth <= 900;
    const base = isMobile ? 440 : 610;
    const avail = window.innerHeight - (isMobile ? 360 : 190);
    document.documentElement.style.setProperty("--fit", Math.min(1, Math.max(0.5, avail / base)).toFixed(3));
  }
  fit();
  window.addEventListener("resize", fit);

  function frame() {
    const vh = window.innerHeight;
    const y = window.scrollY;

    if (hero && y < vh * 1.6) {
      // Başlık yukarı kayarken solar ve küçülür
      const p = clamp(y / (vh * 0.55));
      if (heroContent) {
        heroContent.style.opacity = (1 - p).toFixed(3);
        heroContent.style.transform = `translateY(${(-p * 70).toFixed(1)}px) scale(${(1 - p * 0.07).toFixed(3)})`;
        heroContent.style.filter = p > 0.02 ? `blur(${(p * 8).toFixed(1)}px)` : "none";
      }
      hero.querySelector(".hero-video")?.style.setProperty("--py", (y * 0.28).toFixed(1) + "px");

      // Panel: yatık başlar, kaydırdıkça dikleşir ve büyür
      if (stage && mock) {
        const t = ease(clamp((vh - stage.getBoundingClientRect().top - 140) / (vh * 0.75)));
        mock.style.setProperty("--sx", lerp(26, 0, t).toFixed(2) + "deg");
        mock.style.setProperty("--sc", lerp(0.86, 1.02, t).toFixed(3));
      }
    }

    if (manifesto && words.length) {
      const p = sectionProgress(manifesto);
      const f = clamp((p - 0.08) / 0.78) * words.length;
      words.forEach((w, i) => {
        const a = clamp(f - i);
        const hl = w.classList.contains("hl");
        w.style.color = hl
          ? `rgba(52,211,153,${(0.14 + 0.86 * a).toFixed(3)})`
          : `rgba(242,247,244,${(0.14 + 0.86 * a).toFixed(3)})`;
      });
    }

    if (showcase && phone) {
      const p = sectionProgress(showcase);
      const idx = Math.min(2, Math.floor(clamp(p) * 3));
      if (idx !== lastIdx) {
        lastIdx = idx;
        steps.forEach((s, i) => s.classList.toggle("active", i === idx));
        dots.forEach((d, i) => d.classList.toggle("on", i === idx));
        screens.forEach((s, i) => s.classList.toggle("active", i === idx));
      }
      const enter = ease(clamp((window.innerHeight - showcase.getBoundingClientRect().top) / (vh * 0.9)));
      phone.style.setProperty("--sc", lerp(0.82, 1, enter).toFixed(3));
      phone.style.setProperty("--py", lerp(80, 0, enter).toFixed(1) + "px");
      phone.style.setProperty("--ry", lerp(-18, -6 + p * 12, enter).toFixed(2) + "deg");
      phone.style.setProperty("--rx", lerp(10, 2, enter).toFixed(2) + "deg");
    }
  }

  if (!reduce) {
    let ticking = false;
    const onFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { frame(); ticking = false; }); } };
    window.addEventListener("scroll", onFrame, { passive: true });
    window.addEventListener("resize", onFrame);
    frame();
  }
})();
