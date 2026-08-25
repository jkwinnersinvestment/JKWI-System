const form = document.getElementById("registerForm");

const accountTypeInput =
    document.getElementById("accountType");

const accountButtons =
    document.querySelectorAll(".account-type");

const message =
    document.getElementById("message");

const registerButton =
    document.getElementById("registerButton");


// ==========================================
// ACCOUNT TYPE
// ==========================================

accountButtons.forEach(button => {

    button.addEventListener("click", () => {

        accountButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        accountTypeInput.value =
            button.dataset.type;

    });

});


// ==========================================
// REGISTRATION
// ==========================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const firstName =
        document.getElementById("firstName")
            .value.trim();

    const lastName =
        document.getElementById("lastName")
            .value.trim();

    const email =
        document.getElementById("email")
            .value.trim()
            .toLowerCase();

    const phone =
        document.getElementById("phone")
            .value.trim();

    const password =
        document.getElementById("password")
            .value;

    const confirmPassword =
        document.getElementById("confirmPassword")
            .value;

    const accountType =
        accountTypeInput.value;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match.",
            "error"
        );

        return;

    }


    if (password.length < 8) {

        showMessage(
            "Password must contain at least 8 characters.",
            "error"
        );

        return;

    }


    registerButton.disabled = true;

    registerButton.textContent =
        "Creating Account...";


    try {

        const response =
            await fetch(
                "/api/users/register",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        firstName,
                        lastName,
                        email,
                        phone,
                        password,
                        confirmPassword,
                        accountType

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Registration failed."
            );

        }


        // ==========================================
        // SAVE REGISTRATION EMAIL
        // ==========================================

        sessionStorage.setItem(
            "jkwiRegistrationEmail",
            email
        );


        // ==========================================
        // SAVE TEMPORARY USER DATA
        // ==========================================

        if (data.user) {

            sessionStorage.setItem(
                "jkwiPendingUser",
                JSON.stringify(data.user)
            );

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        showMessage(
            "Account created successfully. Redirecting...",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "verification.html";

        }, 1000);

    }

    catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to create account.",
            "error"
        );


        registerButton.disabled =
            false;

        registerButton.textContent =
            "Create Account";

    }

});


// ==========================================
// MESSAGE
// ==========================================

function showMessage(text, type) {

    message.textContent = text;

    message.className =
        `message ${type}`;

}