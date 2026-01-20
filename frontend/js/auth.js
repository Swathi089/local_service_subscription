// ===============================
// DEMO OTP LOGIN (SAFE)
// ===============================

const DEMO_EMAIL = "demo@localserve.com";
const DEMO_OTP = "123456";

// DOM (may or may not exist on all pages)
const emailForm = document.getElementById("emailForm");
const otpForm = document.getElementById("otpForm");
const sentEmailText = document.getElementById("sentEmail");
const changeEmailBtn = document.getElementById("changeEmailBtn");

const otpInputs = [
  document.getElementById("otp1"),
  document.getElementById("otp2"),
  document.getElementById("otp3"),
  document.getElementById("otp4"),
  document.getElementById("otp5"),
  document.getElementById("otp6"),
];

// ---------- SEND OTP ----------
if (emailForm) {
  emailForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (email !== DEMO_EMAIL) {
      alert("❌ Demo Login Only\n\nUse email: demo@localserve.com");
      return;
    }

    sentEmailText.innerText = email;
    emailForm.style.display = "none";
    otpForm.style.display = "block";

    alert("✅ Demo OTP Sent!\n\nOTP: 123456");

    startOtpTimer();
    setupOtpAutoFocus();
  });
}

// ---------- VERIFY OTP ----------
if (otpForm) {
  otpForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const enteredOtp = otpInputs.map(i => i.value).join("");

    if (enteredOtp === DEMO_OTP) {
      alert("🎉 Login Successful (Demo)");

      localStorage.setItem("token", "demo-token");
      localStorage.setItem("role", "customer");

      window.location.href = "../customer/dashboard.html";
    } else {
      alert("❌ Invalid OTP\n\nUse: 123456");
    }
  });
}

// ---------- CHANGE EMAIL ----------
if (changeEmailBtn) {
  changeEmailBtn.addEventListener("click", () => {
    otpForm.style.display = "none";
    emailForm.style.display = "block";
    otpInputs.forEach(i => (i.value = ""));
  });
}

// ---------- OTP AUTO FOCUS ----------
function setupOtpAutoFocus() {
  otpInputs.forEach((input, index) => {
    if (!input) return;

    input.addEventListener("input", () => {
      if (input.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });
}

// ---------- OTP TIMER ----------
function startOtpTimer() {
  const timerElement = document.getElementById("otpTimer");
  if (!timerElement) return;

  let timeLeft = 300;

  const timer = setInterval(() => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;

    timerElement.innerText = `${min}:${sec < 10 ? "0" : ""}${sec}`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      alert("⏰ OTP Expired");
      otpForm.style.display = "none";
      emailForm.style.display = "block";
    }
  }, 1000);
}

// ===============================
// ROLE-BASED REGISTRATION
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const roleCards = document.querySelectorAll(".role-card");
  const roleSelection = document.getElementById("roleSelection");
  const registerForm = document.getElementById("registerForm");
  const providerFields = document.getElementById("providerFields");
  const userRoleInput = document.getElementById("userRole");
  const backBtn = document.getElementById("backBtn");

  if (!roleCards.length) return;

  roleCards.forEach(card => {
    card.addEventListener("click", () => {
      const role = card.dataset.role;

      userRoleInput.value = role;
      roleSelection.style.display = "none";
      registerForm.style.display = "block";

      providerFields.style.display =
        role === "provider" ? "block" : "none";

      registerForm.scrollIntoView({ behavior: "smooth" });
    });
  });

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      registerForm.reset();
      registerForm.style.display = "none";
      providerFields.style.display = "none";
      roleSelection.style.display = "flex";
      userRoleInput.value = "";
    });
  }
});

// ===============================
// GOOGLE SIGN-IN (DEMO)
// ===============================

const googleBtn = document.getElementById("googleSignInBtn");

if (googleBtn) {
  googleBtn.addEventListener("click", () => {
    window.location.href =
      "https://accounts.google.com/signin/v2/identifier";
  });
}
