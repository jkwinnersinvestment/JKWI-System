const params = new URLSearchParams(window.location.search);
const email = (params.get("email") || sessionStorage.getItem("jkwiRegistrationEmail") || "").trim().toLowerCase();
const form = document.getElementById("verifyForm");
const codeInput = document.getElementById("verificationCode");
const confirmButton = document.getElementById("confirmButton");
const resendButton = document.getElementById("resendButton");
const countdown = document.getElementById("countdown");
const message = document.getElementById("message");
const codeError = document.getElementById("codeError");

document.getElementById("emailDisplay").textContent = email || "your email address";

let secondsRemaining = 60;
let timer;

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

function startCountdown() {
    window.clearInterval(timer);
    secondsRemaining = 60;
    resendButton.disabled = true;
    countdown.textContent = "(60s)";
    timer = window.setInterval(() => {
        secondsRemaining -= 1;
        countdown.textContent = secondsRemaining ? `(${secondsRemaining}s)` : "";
        if (secondsRemaining <= 0) {
            window.clearInterval(timer);
            resendButton.disabled = false;
        }
    }, 1000);
}

codeInput.addEventListener("input", () => {
    codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 6);
    codeError.textContent = "";
});

form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!email || !/^\d{6}$/.test(codeInput.value)) {
        codeError.textContent = "Enter the 6-digit verification code.";
        return;
    }

    confirmButton.disabled = true;
    confirmButton.textContent = "Confirming...";
    try {
        const response = await fetch("/api/users/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code: codeInput.value })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Invalid or expired code");
        }

        showMessage("Email verified successfully. Redirecting to Login...", "success");
        setTimeout(() => { window.location.href = "login.html"; }, 1000);
    } catch (error) {
        showMessage(error.message || "Invalid or expired code", "error");
        confirmButton.disabled = false;
        confirmButton.textContent = "Confirm Email";
    }
});

resendButton.addEventListener("click", async () => {
    resendButton.disabled = true;
    try {
        const response = await fetch("/api/users/resend-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to resend verification code.");
        }
        showMessage("A new verification code was sent.", "success");
        startCountdown();
    } catch (error) {
        showMessage(error.message || "Unable to resend verification code.", "error");
        resendButton.disabled = false;
    }
});

if (!email) {
    showMessage("Registration email is missing. Please register again.", "error");
    confirmButton.disabled = true;
    resendButton.disabled = true;
} else {
    startCountdown();
    codeInput.focus();
}
