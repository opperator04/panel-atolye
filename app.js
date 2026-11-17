// ============================================================
// KİŞİSEL AYARLAR (Yayına almadan önce burayı güncelleyin)
// ============================================================
const SITE_CONFIG = {
  // Başında + olmadan ülke koduyla WhatsApp numaranız (Örn: "905321234567")
  whatsappNumber: "905XXXXXXXXX",
  // Formspree veya Web3Forms gibi bir form servisi kullanırsanız URL'yi buraya yazın.
  // Boş bırakılırsa talep WhatsApp / Kopyala üzerinden iletilir.
  formEndpoint: "https://formsubmit.co/ajax/kutluahmet1907@gmail.com"
};

document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileNav = document.getElementById("mobileNav");
  const form = document.getElementById("panelRequestForm");
  const formSuccess = document.getElementById("formSuccess");
  const successMessage = document.getElementById("successMessage");
  const whatsappSendBtn = document.getElementById("whatsappSendBtn");
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
              _subject: `Yeni Panel Talebi: ${businessName}`,
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
            "Talebiniz e-posta adresime başarıyla iletildi. Dilerseniz WhatsApp'tan da hızlandırabilirsiniz.";
        } catch (err) {
          successMessage.textContent =
            "Talebiniz hazırlandı. Aşağıdaki butondan doğrudan WhatsApp ile iletebilirsiniz.";
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Talebi Gönder";
        }
      } else {
        successMessage.textContent =
          "Talebiniz hazırlandı! Aşağıdaki butona tıklayarak WhatsApp üzerinden bana tek tıkla gönderebilirsiniz.";
      }

      // WhatsApp bağlantısını hazırla
      const cleanNumber = SITE_CONFIG.whatsappNumber.replace(/\D/g, "");
      const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(lastSummaryText)}`;
      whatsappSendBtn.href = waUrl;

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
});
