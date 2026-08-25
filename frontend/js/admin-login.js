const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    if (!username || !password) {
        showMessage("Please enter your username and password.");
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Signing In...";
    loginMessage.textContent = "";

    try {

        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })

        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Invalid username or password."
            );
        }

        sessionStorage.setItem(
            "jkwi_admin_token",
            data.token
        );

        sessionStorage.setItem(
            "jkwi_admin_user",
            JSON.stringify(data.user)
        );

        loginMessage.style.color = "#168a45";
        loginMessage.textContent =
            "Login successful. Redirecting...";

        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 500);

    } catch (error) {

        console.error("Login error:", error);

        showMessage(
            error.message ||
            "Login failed. Please try again."
        );

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "Sign In";

    }

});


function showMessage(message) {

    loginMessage.style.color = "#d33";
    loginMessage.textContent = message;

}