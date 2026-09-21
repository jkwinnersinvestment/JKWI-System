document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const passwordToggle = document.getElementById("passwordToggle");

    const loginButton = document.getElementById("loginButton");
    const loginButtonText = document.getElementById("loginButtonText");
    const loginSpinner = document.getElementById("loginSpinner");
    const loginMessage = document.getElementById("loginMessage");


    // ==========================================
    // SHOW / HIDE PASSWORD
    // ==========================================

    passwordToggle.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            passwordToggle.textContent = "Hide";

        } else {

            passwordInput.type = "password";

            passwordToggle.textContent = "Show";

        }

    });


    // ==========================================
    // MESSAGE
    // ==========================================

    function showMessage(message, type = "error") {

        loginMessage.textContent = message;

        loginMessage.className =
            `login-message ${type}`;

    }


    // ==========================================
    // LOADING STATE
    // ==========================================

    function setLoading(loading) {

        loginButton.disabled = loading;

        if (loading) {

            loginButtonText.textContent =
                "Signing In...";

            loginSpinner.style.display =
                "inline-block";

        } else {

            loginButtonText.textContent =
                "Sign In";

            loginSpinner.style.display =
                "none";

        }

    }


    // ==========================================
    // LOGIN
    // ==========================================

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            emailInput.value.trim().toLowerCase();

        const password =
            passwordInput.value;


        if (!emailInput.checkValidity()) {
            showMessage("Please enter a valid email address.");
            emailInput.focus();
            return;
        }


        // ==========================================
        // VALIDATE PASSWORD
        // ==========================================

        if (!password) {

            showMessage(
                "Please enter your password."
            );

            passwordInput.focus();

            return;

        }


        setLoading(true);

        showMessage("");


        try {

            // ==========================================
            // SEND LOGIN REQUEST
            // ==========================================

            const response =
                await fetch(
                    "/api/users/login",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email,

                            password:
                                password

                        })

                    }
                );


            const data =
                await response.json();


            // ==========================================
            // LOGIN FAILED
            // ==========================================

            if (!response.ok || !data.success) {

                if (data.redirect) {
                    window.location.href = data.redirect;
                    return;
                }

                showMessage(
                    data.message ||
                    "Login failed. Please check your credentials."
                );

                setLoading(false);

                return;

            }


            // ==========================================
            // SAVE JWT
            // ==========================================

            sessionStorage.setItem("jkwiToken", data.token);
            sessionStorage.setItem("jkwiUser", JSON.stringify(data.user));


            // ==========================================
            // SUCCESS
            // ==========================================

            showMessage(
                "Login successful. Redirecting...",
                "success"
            );


            // ==========================================
            // REDIRECT
            // ==========================================

            setTimeout(() => {

                window.location.href =
                    data.redirect;

            }, 500);

        }


        catch (error) {

            console.error(
                "JKWI login error:",
                error
            );

            showMessage(
                "Unable to connect to the JKWI server."
            );

            setLoading(false);

        }

    });

});