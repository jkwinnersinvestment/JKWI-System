// ==========================================
// JKWI SUPER ADMIN DASHBOARD
// Live API Version
// ==========================================


// ==========================================
// SESSION
// ==========================================

const token = localStorage.getItem("jkwi_token");
const storedUser = localStorage.getItem("jkwi_user");


// ==========================================
// LOGIN CHECK
// ==========================================

if (!token) {

    window.location.replace("/login.html");

}


// ==========================================
// ELEMENTS
// ==========================================

const usernameElement =
    document.getElementById("username");

const roleElement =
    document.getElementById("role");

const logoutButton =
    document.getElementById("logoutButton");


// ==========================================
// LOAD STORED USER
// ==========================================

if (storedUser) {

    try {

        const user = JSON.parse(storedUser);

        if (usernameElement) {

            usernameElement.textContent =
                user.username ||
                user.name ||
                user.email ||
                "Administrator";

        }

        if (roleElement) {

            roleElement.textContent =
                user.role ||
                "Super Admin";

        }

    } catch (error) {

        console.error(
            "Could not load stored user:",
            error
        );

    }

}


// ==========================================
// API REQUEST HELPER
// ==========================================

async function apiRequest(endpoint, options = {}) {

    const response = await fetch(endpoint, {

        ...options,

        headers: {

            ...(options.headers || {}),

            "Authorization":
                `Bearer ${token}`,

            "Content-Type":
                "application/json"

        }

    });


    // --------------------------------------
    // SESSION EXPIRED
    // --------------------------------------

    if (response.status === 401) {

        localStorage.removeItem("jkwi_token");
        localStorage.removeItem("jkwi_user");

        window.location.replace("/login.html");

        return null;

    }


    if (!response.ok) {

        throw new Error(
            `API request failed: ${response.status}`
        );

    }


    return response.json();

}


// ==========================================
// GET NEWS
// ==========================================

async function loadNewsStatistics() {

    try {

        const data =
            await apiRequest("/api/news");


        if (!data) return;


        // ----------------------------------
        // SUPPORT DIFFERENT API FORMATS
        // ----------------------------------

        let articles = [];


        if (Array.isArray(data)) {

            articles = data;

        } else if (Array.isArray(data.news)) {

            articles = data.news;

        } else if (Array.isArray(data.data)) {

            articles = data.data;

        }


        // ----------------------------------
        // STATISTICS
        // ----------------------------------

        const published =
            articles.filter(
                article =>
                    article.status === "published"
            );

        const submitted =
            articles.filter(
                article =>
                    article.status === "submitted"
            );

        const approved =
            articles.filter(
                article =>
                    article.status === "approved"
            );

        const drafts =
            articles.filter(
                article =>
                    article.status === "draft"
            );

        const rejected =
            articles.filter(
                article =>
                    article.status === "rejected"
            );


        // ----------------------------------
        // MAIN NEWS STAT
        // ----------------------------------

        setStatValue(
            0,
            published.length
        );


        // ----------------------------------
        // PENDING REVIEWS
        // ----------------------------------

        setStatValue(
            1,
            submitted.length
        );


        // ----------------------------------
        // CHANNEL COUNTS
        // ----------------------------------

        const localBusiness =
            countCategory(
                published,
                [
                    "Local Business",
                    "Local Business News",
                    "local_business",
                    "local-business"
                ]
            );


        const internationalBusiness =
            countCategory(
                published,
                [
                    "International Business",
                    "International Business News",
                    "international_business",
                    "international-business"
                ]
            );


        const localMarkets =
            countCategory(
                published,
                [
                    "Local Markets",
                    "Local Market News",
                    "local_markets",
                    "local-markets"
                ]
            );


        const internationalMarkets =
            countCategory(
                published,
                [
                    "International Markets",
                    "International Market News",
                    "international_markets",
                    "international-markets"
                ]
            );


        setChannelValue(
            0,
            localBusiness
        );

        setChannelValue(
            1,
            internationalBusiness
        );

        setChannelValue(
            2,
            localMarkets
        );

        setChannelValue(
            3,
            internationalMarkets
        );


        console.log(
            "News statistics loaded:",
            {
                total: articles.length,
                published: published.length,
                submitted: submitted.length,
                approved: approved.length,
                drafts: drafts.length,
                rejected: rejected.length
            }
        );


    } catch (error) {

        console.error(
            "Could not load news statistics:",
            error
        );

    }

}


// ==========================================
// COUNT CATEGORY
// ==========================================

function countCategory(
    articles,
    categories
) {

    return articles.filter(article => {

        const category =
            String(
                article.category || ""
            )
            .trim()
            .toLowerCase();


        return categories.some(
            item =>
                category ===
                String(item)
                    .trim()
                    .toLowerCase()
        );

    }).length;

}


// ==========================================
// SET STAT CARD VALUE
// ==========================================

function setStatValue(
    cardIndex,
    value
) {

    const cards =
        document.querySelectorAll(
            ".stat-card"
        );


    if (!cards[cardIndex]) return;


    const number =
        cards[cardIndex]
            .querySelector("strong");


    if (number) {

        number.textContent =
            Number(value).toLocaleString();

    }

}


// ==========================================
// SET NEWS CHANNEL VALUE
// ==========================================

function setChannelValue(
    channelIndex,
    value
) {

    const channels =
        document.querySelectorAll(
            ".news-channel"
        );


    if (!channels[channelIndex]) return;


    const number =
        channels[channelIndex]
            .querySelector("strong");


    if (number) {

        number.textContent =
            Number(value).toLocaleString();

    }

}


// ==========================================
// LOAD PLATFORM USERS
// ==========================================

async function loadUserStatistics() {

    try {

        const data =
            await apiRequest("/api/users");


        if (!data) return;


        let users = [];


        if (Array.isArray(data)) {

            users = data;

        } else if (Array.isArray(data.users)) {

            users = data.users;

        } else if (Array.isArray(data.data)) {

            users = data.data;

        }


        setStatValue(
            3,
            users.length
        );


        console.log(
            "Platform users:",
            users.length
        );


    } catch (error) {

        console.error(
            "Could not load user statistics:",
            error
        );

    }

}


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    await Promise.allSettled([

        loadNewsStatistics(),

        loadUserStatistics()

    ]);

}


// ==========================================
// LOGOUT
// ==========================================

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


// ==========================================
// START
// ==========================================

loadDashboard();