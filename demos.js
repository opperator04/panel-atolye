// PanelAtölye — kartlardan açılan canlı örnek paneller (veri kaydedilmez)
(() => {
  const dlg = document.getElementById("demoDialog");
  if (!dlg || typeof dlg.showModal !== "function") {
    document.querySelectorAll(".card-demo").forEach((b) => (b.hidden = true));
    return;
  }
  const body = document.getElementById("demoBody");
  const tabs = document.getElementById("demoTabs");
  const titleEl = document.getElementById("demoTitle");
  const toastEl = document.getElementById("demoToast");
  const fmt = (n) => "₺" + Math.round(n).toLocaleString("tr-TR");
  const now = () => new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 2200);
  };

  // ---------------- 1) Kafe: kasa + stok ----------------
  const cafe = {
    label: "Kafe & Market",
    title: "Butik Kafe — Kasa ve Stok",
    preset: "Kafe / Restoran Kasa ve Stok Paneli",
    s: {
      ciro: 14850, gider: 2400,
      stock: [
        { n: "Kahve çekirdeği", v: 16, max: 80, low: 12, unit: "porsiyon" },
        { n: "Süt", v: 42, max: 80, low: 15, unit: "porsiyon" },
        { n: "Cheesecake", v: 9, max: 24, low: 4, unit: "dilim" },
        { n: "Karton bardak", v: 130, max: 300, low: 40, unit: "adet" },
      ],
      log: [
        { t: "15:05", n: "Masa 4 & 8 tahsilat", a: 1920 },
        { t: "14:20", n: "Toptancı — süt & krema", a: -2400 },
      ],
    },
    items: [
      { n: "Filtre kahve", p: 85, use: [0, 3] },
      { n: "Latte", p: 120, use: [0, 1, 3] },
      { n: "Cheesecake", p: 95, use: [2] },
      { n: "Su", p: 30, use: [] },
    ],
    render() {
      const s = this.s, crit = s.stock.filter((x) => x.v <= x.low);
      return `
      <div class="d-stats">
        <div class="d-stat"><span>Bugünkü ciro</span><b>${fmt(s.ciro)}</b><em class="up">+%18 düne göre</em></div>
        <div class="d-stat"><span>Gider</span><b>${fmt(s.gider)}</b><em>tedarikçi ödemeleri</em></div>
        <div class="d-stat"><span>Net</span><b>${fmt(s.ciro - s.gider)}</b><em>gün sonu özeti</em></div>
      </div>
      ${crit.length ? `<div class="d-alert">Kritik stok: ${crit.map((x) => x.n).join(", ")}</div>` : ""}
      <div class="d-cols">
        <div class="d-box">
          <h4>Hızlı satış <small>dokunun, ciroya eklensin</small></h4>
          <div class="d-chips">${this.items.map((it, i) => `<button class="d-chip" data-act="sell" data-i="${i}">${it.n}<small>${fmt(it.p)}</small></button>`).join("")}</div>
          <h4 class="mt">Son işlemler</h4>
          <ul class="d-list">${s.log.slice(0, 4).map((l) => `<li><span>${l.n}<small>${l.t}</small></span><b class="${l.a < 0 ? "neg" : "pos"}">${l.a < 0 ? "-" : "+"}${fmt(Math.abs(l.a))}</b></li>`).join("")}</ul>
        </div>
        <div class="d-box">
          <h4>Stok durumu</h4>
          <ul class="d-list">${s.stock.map((x) => {
            const low = x.v <= x.low, pct = Math.max(2, (x.v / x.max) * 100);
            return `<li class="stk"><span>${x.n}<small>${x.v} ${x.unit}</small></span><span class="${low ? "tag bad" : "tag ok"}">${low ? "Kritik" : "Yeterli"}</span><i class="bar ${low ? "bad" : ""}" style="--w:${pct}%"></i></li>`;
          }).join("")}</ul>
        </div>
      </div>`;
    },
    act(a, el) {
      if (a !== "sell") return;
      const it = this.items[+el.dataset.i], s = this.s;
      if (it.use.some((u) => s.stock[u].v <= 0)) return toast("Stok bitti, önce tedarik edin");
      it.use.forEach((u) => s.stock[u].v--);
      s.ciro += it.p;
      s.log.unshift({ t: now(), n: it.n + " satışı", a: it.p });
      this.render_();
    },
  };

  // ---------------- 2) Kuaför: randevu ----------------
  const names = [["Zeynep T.", "Saç kesimi"], ["Can B.", "Fön"], ["Selin Y.", "Bakım"], ["Burak K.", "Sakal"], ["Derya M.", "Boya"], ["Emre S.", "Kesim"]];
  const salon = {
    label: "Kuaför & Klinik",
    title: "Güzellik Salonu — Randevular",
    preset: "Randevu ve Müşteri Takip Paneli",
    s: {
      next: 0,
      slots: [
        { h: "09:00" }, { h: "10:00", n: "Elif K.", s: "Saç boyama", ok: true }, { h: "11:00", n: "Mert A.", s: "Kontrol", ok: true },
        { h: "12:00" }, { h: "13:00" }, { h: "14:00", n: "Ayşe D.", s: "Bakım", ok: false },
        { h: "15:00" }, { h: "16:00" }, { h: "17:00" },
      ],
    },
    render() {
      const sl = this.s.slots, booked = sl.filter((x) => x.n), wait = booked.filter((x) => !x.ok);
      return `
      <div class="d-stats">
        <div class="d-stat"><span>Bugün</span><b>${booked.length}</b><em>randevu</em></div>
        <div class="d-stat"><span>Doluluk</span><b>%${Math.round((booked.length / sl.length) * 100)}</b><em class="up">${sl.length - booked.length} boş saat</em></div>
        <div class="d-stat"><span>Onay bekleyen</span><b class="${wait.length ? "warn" : ""}">${wait.length}</b><em>müşteri</em></div>
      </div>
      <div class="d-box">
        <h4>Günün programı <small>boş saate dokunun · dolu randevuya dokunup onaylayın</small></h4>
        <ul class="d-list slots">${sl.map((x, i) => x.n
          ? `<li class="slot full" data-act="toggle" data-i="${i}" tabindex="0" role="button"><em>${x.h}</em><span>${x.n}<small>${x.s}</small></span><span class="${x.ok ? "tag ok" : "tag warn"}">${x.ok ? "Onaylı" : "Bekliyor"}</span><button class="x" data-act="del" data-i="${i}" aria-label="Randevuyu sil">×</button></li>`
          : `<li class="slot free" data-act="add" data-i="${i}" tabindex="0" role="button"><em>${x.h}</em><span class="mute">Boş — randevu ekle</span><span class="plus">+</span></li>`).join("")}</ul>
        <button class="d-btn" data-act="remind" ${wait.length ? "" : "disabled"}>${wait.length ? `${wait.length} kişiye WhatsApp ile hatırlat` : "Tüm randevular onaylı"}</button>
      </div>`;
    },
    act(a, el) {
      const i = +el.dataset.i, sl = this.s.slots;
      if (a === "add") { const [n, s] = names[this.s.next++ % names.length]; sl[i] = { h: sl[i].h, n, s, ok: false }; }
      else if (a === "toggle") sl[i].ok = !sl[i].ok;
      else if (a === "del") sl[i] = { h: sl[i].h };
      else if (a === "remind") { const w = sl.filter((x) => x.n && !x.ok).length; sl.forEach((x) => x.n && (x.ok = true)); toast(`${w} hatırlatma gönderildi (örnek)`); }
      else return;
      this.render_();
    },
  };

  // ---------------- 3) E-ticaret: sipariş ----------------
  const shop = {
    label: "E-ticaret",
    title: "Seramik Atölyesi — Siparişler",
    preset: "Sipariş ve Kargo Takip Paneli",
    s: { o: [
      { id: "#1042", w: "A. Demir", it: "Seramik kupa ×2", a: 480, st: 0 },
      { id: "#1041", w: "S. Kaya", it: "Servis tabağı seti", a: 1250, st: 1 },
      { id: "#1040", w: "M. Çelik", it: "Vazo (büyük)", a: 690, st: 1 },
      { id: "#1039", w: "N. Aksoy", it: "Kupa ×4", a: 920, st: 2 },
      { id: "#1038", w: "E. Yıldız", it: "Çay seti", a: 1100, st: 2 },
    ] },
    names: ["Hazırlanıyor", "Kargoda", "Teslim edildi"],
    render() {
      const o = this.s.o, c = [0, 1, 2].map((k) => o.filter((x) => x.st === k).length);
      const kar = o.filter((x) => x.st === 2).reduce((t, x) => t + x.a * 0.38, 0);
      return `
      <div class="d-stats four">
        ${this.names.map((n, k) => `<div class="d-stat"><span>${n}</span><b>${c[k]}</b><em>sipariş</em></div>`).join("")}
        <div class="d-stat"><span>Net kâr (örnek)</span><b class="up">${fmt(kar)}</b><em>teslim edilenlerden</em></div>
      </div>
      <div class="d-box">
        <h4>Siparişler <small>durum etiketine dokunun, bir adım ilerlesin</small></h4>
        <ul class="d-list">${o.map((x, i) => `<li><span>${x.id} · ${x.w}<small>${x.it} · ${fmt(x.a)}${x.st >= 1 ? " · takip: YK" + (2800 + +x.id.slice(1)) : ""}</small></span><button class="tag st${x.st}" data-act="step" data-i="${i}">${this.names[x.st]}${x.st < 2 ? " →" : " ✓"}</button></li>`).join("")}</ul>
      </div>`;
    },
    act(a, el) {
      if (a !== "step") return;
      const x = this.s.o[+el.dataset.i];
      x.st = (x.st + 1) % 3;
      this.render_();
    },
  };

  // ---------------- 4) Danışmanlık: teklifler ----------------
  const deals = {
    label: "Ajans & Emlak",
    title: "Stüdyo — Teklif Takibi",
    preset: "Müşteri ve Teklif Takip Paneli",
    s: { hedef: 60000, d: [
      { c: "Güneş Mimarlık", t: "Web sitesi", v: 24000, ok: false },
      { c: "Boğaz Emlak", t: "Aylık danışmanlık", v: 18000, ok: true },
      { c: "Lale Kafe", t: "Marka kimliği", v: 12000, ok: false },
      { c: "Mavi Klinik", t: "Sosyal medya", v: 9000, ok: false },
    ], extra: [["Ege Tekstil", "Katalog tasarımı", 15000], ["Demir Hukuk", "Kurumsal site", 21000]], n: 0 },
    render() {
      const d = this.s.d, onay = d.filter((x) => x.ok).reduce((t, x) => t + x.v, 0), bek = d.filter((x) => !x.ok).reduce((t, x) => t + x.v, 0);
      const pct = Math.min(100, (onay / this.s.hedef) * 100);
      return `
      <div class="d-box goal"><h4>Aylık gelir hedefi <small>${fmt(onay)} / ${fmt(this.s.hedef)}</small></h4><div class="meter"><i style="--w:${pct}%"></i></div><p class="mute">${pct >= 100 ? "Hedef tamam 🎉" : `Hedefe ${fmt(this.s.hedef - onay)} kaldı · bekleyen teklifler ${fmt(bek)}`}</p></div>
      <div class="d-box">
        <h4>Teklifler <small>onayladıkça hedef çubuğu dolar</small></h4>
        <ul class="d-list">${d.map((x, i) => `<li><span>${x.c}<small>${x.t} · ${fmt(x.v)}</small></span><button class="tag ${x.ok ? "ok" : "warn"}" data-act="flip" data-i="${i}">${x.ok ? "Onaylandı ✓" : "Bekliyor · onayla"}</button></li>`).join("")}</ul>
        <button class="d-btn" data-act="new" ${this.s.n >= this.s.extra.length ? "disabled" : ""}>+ Yeni teklif ekle</button>
      </div>`;
    },
    act(a, el) {
      if (a === "flip") { const x = this.s.d[+el.dataset.i]; x.ok = !x.ok; }
      else if (a === "new" && this.s.n < this.s.extra.length) { const [c, t, v] = this.s.extra[this.s.n++]; this.s.d.unshift({ c, t, v, ok: false }); }
      else return;
      this.render_();
    },
  };

  const demos = { cafe, salon, shop, deals };
  const order = Object.keys(demos);
  let cur = "cafe";

  Object.values(demos).forEach((d) => { d.render_ = () => paint(); });
  function paint() {
    const d = demos[cur];
    titleEl.textContent = d.title;
    body.innerHTML = d.render();
    tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.demo === cur)));
    dlg.dataset.preset = d.preset;
  }

  tabs.innerHTML = order.map((k) => `<button type="button" role="tab" data-demo="${k}">${demos[k].label}</button>`).join("");
  tabs.addEventListener("click", (e) => { const b = e.target.closest("button[data-demo]"); if (b) { cur = b.dataset.demo; paint(); body.scrollTop = 0; } });

  body.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    demos[cur].act(el.dataset.act, el);
  });
  body.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("li[data-act]")) { e.preventDefault(); e.target.click(); }
  });

  const open = (k) => { cur = k; paint(); body.scrollTop = 0; document.documentElement.classList.add("modal-open"); dlg.showModal(); };
  document.querySelectorAll(".card-demo").forEach((b) => b.addEventListener("click", () => open(b.dataset.demo)));
  dlg.addEventListener("close", () => document.documentElement.classList.remove("modal-open"));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  document.getElementById("demoClose").addEventListener("click", () => dlg.close());
  document.getElementById("demoAsk").addEventListener("click", () => {
    const preset = dlg.dataset.preset;
    dlg.close();
    document.querySelector(`.card-cta[data-preset="${preset}"]`)?.click();
  });
})();
