// ------------------------------------------------------------------
// Mobile nav toggle
// ------------------------------------------------------------------
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ------------------------------------------------------------------
// Signup form: validation + submission to Google Sheets (Drive)
// ------------------------------------------------------------------
// After creating the Apps Script Web App described in README.md, paste
// its deployment URL below. Until it's set, submissions are only
// validated in the browser and are NOT saved anywhere.
const GOOGLE_SCRIPT_URL = "";

const form = document.getElementById("signup-form");

if (form) {
  const successMessage = document.getElementById("form-success");

  const requiredFields = [
    { name: "parentName", type: "text" },
    { name: "phone", type: "text" },
    { name: "email", type: "email" },
    { name: "childAge", type: "radio" },
    { name: "level", type: "radio" },
    { name: "interest", type: "radio" },
  ];

  function setFieldValidity(fieldName, isValid) {
    const wrapper = form.querySelector(`[data-field="${fieldName}"]`);
    if (!wrapper) return;
    wrapper.classList.toggle("invalid", !isValid);
  }

  function validateField(field) {
    if (field.type === "radio") {
      const checked = form.querySelector(`input[name="${field.name}"]:checked`);
      const isValid = Boolean(checked);
      setFieldValidity(field.name, isValid);
      return isValid;
    }

    const input = form.querySelector(`[name="${field.name}"]`);
    let isValid = input.value.trim().length > 0;

    if (isValid && field.type === "email") {
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    }

    if (isValid && field.name === "phone") {
      isValid = /^[0-9+()\s-]{7,}$/.test(input.value.trim());
    }

    setFieldValidity(field.name, isValid);
    return isValid;
  }

  requiredFields.forEach((field) => {
    if (field.type === "radio") {
      form.querySelectorAll(`input[name="${field.name}"]`).forEach((input) => {
        input.addEventListener("change", () => validateField(field));
      });
    } else {
      const input = form.querySelector(`[name="${field.name}"]`);
      input.addEventListener("blur", () => validateField(field));
      input.addEventListener("input", () => {
        const wrapper = form.querySelector(`[data-field="${field.name}"]`);
        if (wrapper && wrapper.classList.contains("invalid")) {
          validateField(field);
        }
      });
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const allValid = requiredFields
      .map((field) => validateField(field))
      .every(Boolean);

    if (!allValid) {
      const firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = "Se trimite...";

    const payload = {
      timestamp: new Date().toISOString(),
      parentName: form.parentName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      childAge: form.querySelector('input[name="childAge"]:checked').value,
      level: form.querySelector('input[name="level"]:checked').value,
      interest: form.querySelector('input[name="interest"]:checked').value,
    };

    try {
      if (GOOGLE_SCRIPT_URL) {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        console.warn(
          "GOOGLE_SCRIPT_URL nu este configurat — datele nu au fost salvate în Google Sheet. Vezi README.md."
        );
      }

      form.reset();
      form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
      successMessage.classList.add("visible");
      successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      console.error("Eroare la trimiterea formularului:", err);
      alert("A apărut o eroare la trimitere. Te rugăm încearcă din nou sau sună-ne direct.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
    }
  });
}
