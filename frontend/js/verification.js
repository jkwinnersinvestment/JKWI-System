const sendCodeButton =
    document.getElementById("sendCodeButton");

const verifyButton =
    document.getElementById("verifyButton");

const resendButton =
    document.getElementById("resendButton");

const codeSection =
    document.getElementById("codeSection");

const verificationCode =
    document.getElementById("verificationCode");

const message =
    document.getElementById("message");

const emailDisplay =
    document.getElementById("emailDisplay");


const email =
    sessionStorage.getItem(
        "jkwiRegistrationEmail"
    );


// ==========================================
// CHECK REGISTRATION SESSION
// ==========================================

if (!email) {

    showMessage(
        "Registration session expired. Please register again.",
        "error"
    );

    sendCodeButton.disabled = true;
    resendButton.disabled = true;

} else {

    emailDisplay.textContent =
        maskEmail(email);

}


// ==========================================
// MASK EMAIL
// ==========================================

function maskEmail(email) {

    const parts = email.split("@");

    if (parts.length !== 2) {
        return email;
    }

    const name = parts[0];
    const domain = parts[1];

    if (name.length <= 2) {
        return `${name[0]}***@${domain}`;
    }

    return `${name.substring(0, 2)}***@${domain}`;
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(text, type) {

    message.textContent = text;

    message.className =
        `message ${type}`;

}


// ==========================================
// SEND VERIFICATION CODE
// ==========================================

async function sendVerificationCode() {

    if (!email) {
        return;
    }

    sendCodeButton.disabled = true;
    resendButton.disabled = true;

    sendCodeButton.textContent =
        "Sending...";

    try {

        const response =
            await fetch(
                "/api/verification/send",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to send verification code."
            );

        }


        showMessage(
            "Verification code sent to your email.",
            "success"
        );


        codeSection.classList.add("active");

        sendCodeButton.textContent =
            "Code Sent";

        resendButton.disabled = false;

        verificationCode.focus();

    }

    catch (error) {

        console.error(
            "Send verification error:",
            error
        );


        showMessage(
            error.message,
            "error"
        );


        sendCodeButton.disabled =
            false;

        resendButton.disabled =
            false;

        sendCodeButton.textContent =
            "Send Verification Code";

    }

}


// ==========================================
// SEND CODE BUTTON
// ==========================================

sendCodeButton.addEventListener(
    "click",
    sendVerificationCode
);


// ==========================================
// RESEND CODE
// ==========================================

resendButton.addEventListener(
    "click",
    async () => {

        resendButton.disabled = true;

        await sendVerificationCode();

    }
);


// ==========================================
// VERIFY CODE
// ==========================================

verifyButton.addEventListener(
    "click",
    async () => {

        const code =
            verificationCode.value.trim();


        if (!/^\d{6}$/.test(code)) {

            showMessage(
                "Enter the 6-digit verification code.",
                "error"
            );

            verificationCode.focus();

            return;

        }


        verifyButton.disabled = true;

        verifyButton.textContent =
            "Verifying...";


        try {

            const response =
                await fetch(
                    "/api/verification/verify",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            code
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Verification failed."
                );

            }


            // ==========================================
            // SAVE VERIFIED USER
            // ==========================================

            sessionStorage.setItem(
                "jkwiUser",
                JSON.stringify(data.user)
            );


            sessionStorage.removeItem(
                "jkwiRegistrationEmail"
            );

            sessionStorage.removeItem(
                "jkwiPendingUser"
            );


            showMessage(
                "Account verified successfully.",
                "success"
            );


            verifyButton.textContent =
                "Verified";


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1200);

        }

        catch (error) {

            console.error(
                "Verification error:",
                error
            );


            showMessage(
                error.message,
                "error"
            );


            verifyButton.disabled =
                false;

            verifyButton.textContent =
                "Verify Account";

        }

    }
);


// ==========================================
// ONLY ALLOW NUMBERS
// ==========================================

verificationCode.addEventListener(
    "input",
    () => {

        verificationCode.value =
            verificationCode.value
                .replace(/\D/g, "")
                .slice(0, 6);

    }
);


// ==========================================
// AUTO-SEND CODE
// ==========================================

if (email) {

    sendVerificationCode();

}