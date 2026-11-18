// ============================================================
// KİŞİSEL AYARLAR (Yayına almadan önce burayı güncelleyin)
// ============================================================
const SITE_CONFIG = {
  formEndpoint: "https://api.web3forms.com/submit",
  web3formsKey: "dcaeee76-a0fb-4b60-88ae-cead4df8949c"
};

document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileNav = document.getElementById("mobileNav");
  const form = document.getElementById("panelRequestForm");
  const formSuccess = document.getElementById("formSuccess");
  const successMessage = document.getElementById("successMessage");
  const copySummaryBtn = document.getElementById("copySummaryBtn");
  const resetFormBtn = document.getElementById("resetFormBtn");
  const detailsInput = document.getElementById("details");
  const submitBtn = document.getElementById("submitBtn");

  let lastSummaryText = "";

  // Mobil menü aç/kapat
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Örnek kartlardan forma ön doldurma
  document.querySelectorAll(".card-cta").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-preset");
      if (preset && detailsInput) {
        const prefix = `İlgilendiğim örnek: ${preset}.\n`;
        if (!detailsInput.value.includes(preset)) {
          detailsInput.value = prefix + detailsInput.value;
        }
      }
      document.getElementById("talep-formu")?.scrollIntoView({ behavior: "smooth" });
      detailsInput?.focus();
    });
  });

  // Form gönderimi
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName").value.trim();
      const businessName = document.getElementById("businessName").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim();
      const currentTool = document.getElementById("currentTool").value;
      const details = detailsInput.value.trim();
      const selectedFeatures = Array.from(
        form.querySelectorAll('input[name="features"]:checked')
      ).map((el) => el.value);

      lastSummaryText = [
        "Yeni Panel Talebi",
        "-----------------",
        `Ad Soyad: ${fullName}`,
        `İşletme: ${businessName}`,
        `Telefon: ${phone}`,
        email ? `E-posta: ${email}` : null,
        `İstenen Modüller: ${selectedFeatures.length ? selectedFeatures.join(", ") : "Belirtilmedi"}`,
        `Mevcut Yöntem: ${currentTool}`,
        `Detay: ${details}`
      ]
        .filter(Boolean)
        .join("\n");

      // Harici form servisi tanımlıysa POST gönder
      if (SITE_CONFIG.formEndpoint) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Gönderiliyor...";
        try {
          const response = await fetch(SITE_CONFIG.formEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({
              access_key: SITE_CONFIG.web3formsKey,
              subject: `Yeni Panel Talebi: ${businessName}`,
              from_name: "ViraPano Talep Formu",
              fullName,
              businessName,
              phone,
              email,
              features: selectedFeatures.join(", "),
              currentTool,
              details
            })
          });

          if (!response.ok) {
            throw new Error("Form gönderilemedi.");
          }
          successMessage.textContent =
            "Talebiniz başarıyla iletildi. En kısa sürede size dönüş yapılacaktır.";
        } catch (err) {
          successMessage.textContent =
            "Talebiniz gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.";
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Talebi Gönder";
        }
      }

      form.hidden = true;
      formSuccess.hidden = false;
    });
  }

  // Özeti panoya kopyala
  if (copySummaryBtn) {
    copySummaryBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(lastSummaryText);
        const original = copySummaryBtn.textContent;
        copySummaryBtn.textContent = "Kopyalandı ✓";
        setTimeout(() => {
          copySummaryBtn.textContent = original;
        }, 2000);
      } catch {
        alert("Kopyalama başarısız oldu, lütfen WhatsApp butonunu kullanın.");
      }
    });
  }

  // Formu sıfırla
  if (resetFormBtn) {
    resetFormBtn.addEventListener("click", () => {
      form.reset();
      formSuccess.hidden = true;
      form.hidden = false;
    });
  }

  initCodeBackground();
});

// Gözü yormayan, hafif akan kod arka planı
function initCodeBackground() {
  const canvas = document.getElementById("codeBgCanvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  const snippets = [
    "const ciro = +18%;",
    "stok.kontrol()",
    "randevu => onay",
    "{ panel: 'özel' }",
    "kasa.ozet()",
    "siparis[7]",
    "01",
    "=>",
    "sync()",
    "rapor.hazir"
  ];

  let width = 0;
  let height = 0;
  let drops = [];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
    const count = Math.max(12, Math.floor(width / 95));
    drops = Array.from({ length: count }, (_, i) => ({
      x: (i + 0.5) * (width / count) + (Math.random() * 24 - 12),
      y: Math.random() * height,
      speed: 0.25 + Math.random() * 0.35,
      text: snippets[Math.floor(Math.random() * snippets.length)],
      alpha: 0.06 + Math.random() * 0.06
    }));
  }

  resize();
  window.addEventListener("resize", resize);

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.font = "500 12px ui-monospace, SFMono-Regular, Menlo, monospace";

    for (const d of drops) {
      ctx.fillStyle = `rgba(37, 99, 235, ${d.alpha})`;
      ctx.fillText(d.text, d.x, d.y);
      d.y += d.speed;
      if (d.y > height + 20) {
        d.y = -16;
        d.text = snippets[Math.floor(Math.random() * snippets.length)];
      }
    }
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}
