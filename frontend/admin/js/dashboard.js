// ==========================================
// JKWI SUPER ADMIN DASHBOARD
// ==========================================


// ==========================================
// GET LOGIN SESSION
// ==========================================

const token = localStorage.getItem("jkwi_token");

const storedUser = localStorage.getItem("jkwi_user");


// ==========================================
// CHECK LOGIN
// ==========================================

if (!token) {

    window.location.replace("/login.html");

}


// ==========================================
// LOAD USER INFORMATION
// ==========================================

if (storedUser) {

    try {

        const user = JSON.parse(storedUser);


        document.getElementById("username").textContent =
            user.username || "Administrator";


        document.getElementById("role").textContent =
            user.role || "Super Admin";


    } catch (error) {

        console.error(
            "Could not load user information:",
            error
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "jkwi_token"
            );

            localStorage.removeItem(
                "jkwi_user"
            );

            window.location.replace(
                "/login.html"
            );

        }
    );

}