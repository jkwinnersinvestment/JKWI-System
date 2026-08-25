// =========================================================
// JK WINNERS INVESTMENT
// CUSTOMER DASHBOARD
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    // =====================================================
    // GET LOGIN SESSION
    // =====================================================
    const token =
        localStorage.getItem("jkwiToken") ||
        sessionStorage.getItem("jkwiToken");
    const storedUser =
        localStorage.getItem("jkwiUser") ||
        sessionStorage.getItem("jkwiUser");
    // =====================================================
    // CHECK LOGIN
    // =====================================================
    if (!token || !storedUser) {
        console.warn("JKWI: No active login session.");
        window.location.href = "../login.html";
        return;
    }
    // =====================================================
    // READ USER DATA
    // =====================================================
    let user;
    try {
        user = JSON.parse(storedUser);
    } catch (error) {
        console.error(
            "JKWI: Invalid stored user data.",
            error
        );
        localStorage.removeItem("jkwiToken");
        localStorage.removeItem("jkwiUser");
        sessionStorage.removeItem("jkwiToken");
        sessionStorage.removeItem("jkwiUser");
        window.location.href = "../login.html";
        return;
    }
    // =====================================================
    // CHECK CUSTOMER ACCOUNT
    // =====================================================
    if (
        user.accountType &&
        user.accountType.toLowerCase() !== "customer"
    ) {
        console.warn(
            "JKWI: Account is not a customer account."
        );
        window.location.href = "../login.html";
        return;
    }
    // =====================================================
    // USER INFORMATION
    // =====================================================
    const firstName =
        user.firstName || "Customer";
    const lastName =
        user.lastName || "";
    const fullName =
        `${firstName} ${lastName}`.trim();
    const winnersId =
        user.winnersId || "—";
    const email =
        user.email || "—";
    const accountType =
        user.accountType || "customer";
    const status =
        user.status || "active";
    // =====================================================
    // WELCOME NAME
    // =====================================================
    const welcomeName =
        document.getElementById("welcomeName");
    if (welcomeName) {
        welcomeName.textContent =
            firstName;
    }
    // =====================================================
    // TOP USER NAME
    // =====================================================
    const topUserName =
        document.getElementById("topUserName");
    if (topUserName) {
        topUserName.textContent =
            fullName;
    }
    // =====================================================
    // PROFILE NAME
    // =====================================================
    const profileName =
        document.getElementById("profileName");
    if (profileName) {
        profileName.textContent =
            fullName;
    }
    // =====================================================
    // WINNERS ID
    // =====================================================
    const winnersIdElement =
        document.getElementById("winnersId");
    if (winnersIdElement) {
        winnersIdElement.textContent =
            winnersId;
    }
    const profileWinnersId =
        document.getElementById("profileWinnersId");
    if (profileWinnersId) {
        profileWinnersId.textContent =
            winnersId;
    }
    // =====================================================
    // EMAIL
    // =====================================================
    const userEmail =
        document.getElementById("userEmail");
    if (userEmail) {
        userEmail.textContent =
            email;
    }
    const profileEmail =
        document.getElementById("profileEmail");
    if (profileEmail) {
        profileEmail.textContent =
            email;
    }
    // =====================================================
    // ACCOUNT TYPE
    // =====================================================
    const accountTypeElement =
        document.getElementById("accountType");
    if (accountTypeElement) {
        accountTypeElement.textContent =
            formatStatus(accountType);
    }
    // =====================================================
    // ACCOUNT STATUS
    // =====================================================
    const accountStatus =
        document.getElementById("accountStatus");
    if (accountStatus) {
        accountStatus.textContent =
            formatStatus(status);
    }
    // =====================================================
    // AVATAR
    // =====================================================
    const firstLetter =
        firstName.charAt(0).toUpperCase() || "C";
    const userAvatar =
        document.getElementById("userAvatar");
    if (userAvatar) {
        userAvatar.textContent =
            firstLetter;
    }
    const profileAvatar =
        document.getElementById("profileAvatar");
    if (profileAvatar) {
        profileAvatar.textContent =
            firstLetter;
    }
    // =====================================================
    // DASHBOARD SECTIONS
    // =====================================================
    const dashboardSections =
        document.querySelectorAll(
            ".dashboard-section"
        );
    const navItems =
        document.querySelectorAll(
            ".nav-item[data-section]"
        );
    const quickCards =
        document.querySelectorAll(
            ".quick-card[data-section]"
        );
    // =====================================================
    // SHOW SECTION
    // =====================================================
    function showSection(sectionId) {
        dashboardSections.forEach(section => {
            section.classList.remove("active");
        });
        const targetSection =
            document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add("active");
        }
        navItems.forEach(item => {
            item.classList.remove("active");
            if (
                item.dataset.section === sectionId
            ) {
                item.classList.add("active");
            }
        });
        // Update URL without reloading page
        if (
            window.history &&
            window.history.replaceState
        ) {
            window.history.replaceState(
                null,
                "",
                `#${sectionId}`
            );
        }
    }
    // =====================================================
    // SIDEBAR NAVIGATION
    // =====================================================
    navItems.forEach(item => {
        item.addEventListener(
            "click",
            event => {
                event.preventDefault();
                const section =
                    item.dataset.section;
                if (section) {
                    showSection(section);
                }
                // Close mobile sidebar
                if (sidebar) {
                    sidebar.classList.remove(
                        "open"
                    );
                }
            }
        );
    });
    // =====================================================
    // QUICK ACCESS BUTTONS
    // =====================================================
    quickCards.forEach(card => {
        card.addEventListener(
            "click",
            () => {
                const section =
                    card.dataset.section;
                if (section) {
                    showSection(section);
                }
            }
        );
    });
    // =====================================================
    // MOBILE MENU
    // =====================================================
    const mobileMenu =
        document.getElementById("mobileMenu");
    const sidebar =
        document.getElementById("sidebar");
    if (
        mobileMenu &&
        sidebar
    ) {
        mobileMenu.addEventListener(
            "click",
            () => {
                sidebar.classList.toggle(
                    "open"
                );
            }
        );
    }
    // =====================================================
    // LOGOUT
    // =====================================================
    const logoutButton =
        document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            () => {
                // Remove localStorage session
                localStorage.removeItem(
                    "jkwiToken"
                );
                localStorage.removeItem(
                    "jkwiUser"
                );
                // Remove sessionStorage session
                sessionStorage.removeItem(
                    "jkwiToken"
                );
                sessionStorage.removeItem(
                    "jkwiUser"
                );
                // Return to login
                window.location.href =
                    "../login.html";
            }
        );
    }
    // =====================================================
    // DEFAULT SECTION
    // =====================================================
    const requestedSection =
        window.location.hash
            ? window.location.hash.substring(1)
            : "overview";
    const validSection =
        document.getElementById(
            requestedSection
        );
    if (validSection) {
        showSection(
            requestedSection
        );
    } else {
        showSection("overview");
    }
    // =====================================================
    // FORMAT TEXT
    // =====================================================
    function formatStatus(value) {
        if (!value) {
            return "Active";
        }
        return String(value)
            .replace(/_/g, " ")
            .replace(/\b\w/g, letter =>
                letter.toUpperCase()
            );
    }
    // =====================================================
    // DASHBOARD LOADED
    // =====================================================
    console.log(
        "================================="
    );
    console.log(
        "JKWI CUSTOMER DASHBOARD"
    );
    console.log(
        "Dashboard loaded successfully."
    );
    console.log(
        "Customer:",
        fullName
    );
    console.log(
        "Winners ID:",
        winnersId
    );
    console.log(
        "Account Type:",
        accountType
    );
    console.log(
        "Status:",
        status
    );
    console.log(
        "================================="
    );
});