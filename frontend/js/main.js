// Sticky Navigation

window.addEventListener("scroll", function(){

    const header = document.querySelector(".header");

    if(window.scrollY > 80){

        header.classList.add("scrolled");

    }else{

        header.classList.remove("scrolled");

    }

});/* ==========================================
   JKWI NAVIGATION JAVASCRIPT
   Premium • Responsive • Mobile Drawer
========================================== */
document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("jkwiNav");
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const accountToggle =
        document.getElementById("accountToggle");
    const mobileAccount =
        document.querySelector(".mobile-account");
    const navDropdown =
        document.querySelector(".nav-dropdown");
    /* ==========================================
       SCROLL NAVIGATION
    ========================================== */
    function updateNavbar() {
        if (!nav) return;
        if (window.scrollY > 40) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    }
    updateNavbar();
    window.addEventListener(
        "scroll",
        updateNavbar,
        { passive: true }
    );
    /* ==========================================
       BODY SCROLL CONTROL
    ========================================== */
    function lockBodyScroll() {
        document.body.style.overflow = "hidden";
    }
    function unlockBodyScroll() {
        document.body.style.overflow = "";
    }
    /* ==========================================
       CLOSE MOBILE MENU
    ========================================== */
    function closeMobileMenu() {
        if (navMenu) {
            navMenu.classList.remove("active");
        }
        if (navToggle) {
            navToggle.classList.remove("active");
            navToggle.setAttribute(
                "aria-expanded",
                "false"
            );
            navToggle.setAttribute(
                "aria-label",
                "Open menu"
            );
        }
        if (navDropdown) {
            navDropdown.classList.remove("active");
        }
        unlockBodyScroll();
    }
    /* ==========================================
       OPEN MOBILE MENU
    ========================================== */
    function openMobileMenu() {
        if (!navMenu) return;
        navMenu.classList.add("active");
        if (navToggle) {
            navToggle.classList.add("active");
            navToggle.setAttribute(
                "aria-expanded",
                "true"
            );
            navToggle.setAttribute(
                "aria-label",
                "Close menu"
            );
        }
        /* Close account popup */
        if (mobileAccount) {
            mobileAccount.classList.remove(
                "active"
            );
        }
        if (accountToggle) {
            accountToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }
        lockBodyScroll();
    }
    /* ==========================================
       MOBILE HAMBURGER
    ========================================== */
    if (navToggle && navMenu) {
        navToggle.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                const isOpen =
                    navMenu.classList.contains(
                        "active"
                    );
                if (isOpen) {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }
            }
        );
    }
    /* ==========================================
       MOBILE ACCOUNT ICON
    ========================================== */
    if (accountToggle && mobileAccount) {
        accountToggle.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                const isOpen =
                    mobileAccount.classList.toggle(
                        "active"
                    );
                accountToggle.setAttribute(
                    "aria-expanded",
                    isOpen ? "true" : "false"
                );
                /* Close main menu */
                if (isOpen) {
                    closeMobileMenu();
                }
            }
        );
    }
    /* ==========================================
       MOBILE DIVISIONS DROPDOWN
    ========================================== */
    if (navDropdown) {
        const dropdownLink =
            navDropdown.querySelector(
                ":scope > a"
            );
        if (dropdownLink) {
            dropdownLink.addEventListener(
                "click",
                (event) => {
                    /*
                     * On mobile, Divisions
                     * opens the submenu.
                     *
                     * On desktop, normal
                     * navigation remains.
                     */
                    if (
                        window.innerWidth <= 850
                    ) {
                        event.preventDefault();
                        navDropdown.classList.toggle(
                            "active"
                        );
                    }
                }
            );
        }
    }
    /* ==========================================
       MOBILE MENU LINKS
    ========================================== */
    if (navMenu) {
        const menuLinks =
            navMenu.querySelectorAll(
                "a:not(.nav-dropdown > a)"
            );
        menuLinks.forEach((link) => {
            link.addEventListener(
                "click",
                () => {
                    closeMobileMenu();
                }
            );
        });
    }
    /* ==========================================
       ACCOUNT LINKS
    ========================================== */
    if (mobileAccount) {
        const accountLinks =
            mobileAccount.querySelectorAll(
                ".account-menu a"
            );
        accountLinks.forEach((link) => {
            link.addEventListener(
                "click",
                () => {
                    mobileAccount.classList.remove(
                        "active"
                    );
                    if (accountToggle) {
                        accountToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                }
            );
        });
    }
    /* ==========================================
       CLICK OUTSIDE
    ========================================== */
    document.addEventListener(
        "click",
        (event) => {
            /* -------------------------------
               Close account popup
            -------------------------------- */
            if (
                mobileAccount &&
                !mobileAccount.contains(
                    event.target
                )
            ) {
                mobileAccount.classList.remove(
                    "active"
                );
                if (accountToggle) {
                    accountToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
            /* -------------------------------
               Close mobile drawer
            -------------------------------- */
            if (
                navMenu &&
                navToggle &&
                navMenu.classList.contains(
                    "active"
                ) &&
                !navMenu.contains(
                    event.target
                ) &&
                !navToggle.contains(
                    event.target
                )
            ) {
                closeMobileMenu();
            }
        }
    );
    /* ==========================================
       ESCAPE KEY
    ========================================== */
    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key !== "Escape") return;
            /* Close account */
            if (mobileAccount) {
                mobileAccount.classList.remove(
                    "active"
                );
            }
            if (accountToggle) {
                accountToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
            /* Close navigation */
            closeMobileMenu();
        }
    );
    /* ==========================================
       RESIZE
    ========================================== */
    window.addEventListener(
        "resize",
        () => {
            /*
             * If we return to desktop,
             * completely reset mobile state.
             */
            if (window.innerWidth > 850) {
                closeMobileMenu();
                if (mobileAccount) {
                    mobileAccount.classList.remove(
                        "active"
                    );
                }
                if (accountToggle) {
                    accountToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        }
    );
    /* ==========================================
       INITIAL ACCESSIBILITY STATE
    ========================================== */
    if (navToggle) {
        navToggle.setAttribute(
            "aria-expanded",
            "false"
        );
        navToggle.setAttribute(
            "aria-label",
            "Open menu"
        );
    }
    if (accountToggle) {
        accountToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }
});
/*==================================================
   JKWI MARKET PULSE
===================================================*/

const jkwiMarkets = [

    {
        name: "Gold",
        symbol: "XAU",
        category: "metals",
        price: "$3,450.20",
        change: "+1.24%",
        direction: "up"
    },

    {
        name: "Silver",
        symbol: "XAG",
        category: "metals",
        price: "$39.84",
        change: "+0.82%",
        direction: "up"
    },

    {
        name: "Platinum",
        symbol: "XPT",
        category: "metals",
        price: "$1,420.10",
        change: "+0.63%",
        direction: "up"
    },

    {
        name: "Copper",
        symbol: "HG",
        category: "metals",
        price: "$9,842",
        change: "+1.08%",
        direction: "up"
    },

    {
        name: "Brent Crude",
        symbol: "BRENT",
        category: "energy",
        price: "$71.20",
        change: "-0.41%",
        direction: "down"
    },

    {
        name: "WTI Crude",
        symbol: "WTI",
        category: "energy",
        price: "$68.45",
        change: "+0.28%",
        direction: "up"
    },

    {
        name: "Natural Gas",
        symbol: "NG",
        category: "energy",
        price: "$3.12",
        change: "+0.56%",
        direction: "up"
    },

    {
        name: "Wheat",
        symbol: "WHEAT",
        category: "agriculture",
        price: "$582.50",
        change: "-0.32%",
        direction: "down"
    },

    {
        name: "Corn",
        symbol: "CORN",
        category: "agriculture",
        price: "$421.75",
        change: "+0.44%",
        direction: "up"
    },

    {
        name: "EUR / USD",
        symbol: "EURUSD",
        category: "forex",
        price: "1.1684",
        change: "+0.18%",
        direction: "up"
    },

    {
        name: "GBP / USD",
        symbol: "GBPUSD",
        category: "forex",
        price: "1.3502",
        change: "-0.11%",
        direction: "down"
    },

    {
        name: "USD / ZAR",
        symbol: "USDZAR",
        category: "forex",
        price: "16.84",
        change: "-0.24%",
        direction: "down"
    },

    {
        name: "S&P 500",
        symbol: "SPX",
        category: "indices",
        price: "6,532",
        change: "+0.72%",
        direction: "up"
    },

    {
        name: "NASDAQ",
        symbol: "NDX",
        category: "indices",
        price: "21,884",
        change: "+0.91%",
        direction: "up"
    },

    {
        name: "JSE Top 40",
        symbol: "JSE",
        category: "indices",
        price: "91,420",
        change: "+0.36%",
        direction: "up"
    },

    {
        name: "Bitcoin",
        symbol: "BTC",
        category: "crypto",
        price: "$118,420",
        change: "+2.10%",
        direction: "up"
    },

    {
        name: "Ethereum",
        symbol: "ETH",
        category: "crypto",
        price: "$4,280",
        change: "+1.36%",
        direction: "up"
    },

    {
        name: "Solana",
        symbol: "SOL",
        category: "crypto",
        price: "$214.40",
        change: "-0.62%",
        direction: "down"
    }

];


const marketPulseTrack =
    document.getElementById("marketPulseTrack");

const pulseCategories =
    document.querySelectorAll(".pulse-category");

const marketPulseStatus =
    document.getElementById("marketPulseStatus");

const marketPulseTime =
    document.getElementById("marketPulseTime");


let activeMarketFilter = "all";


/* ==========================================
   RENDER MARKET
========================================== */

function renderJKWIMarket(filter = "all") {

    if (!marketPulseTrack) return;


    let filteredMarkets =
        filter === "all"
            ? jkwiMarkets
            : jkwiMarkets.filter(
                market =>
                    market.category === filter
            );


    /*
       Duplicate the cards so the
       animation can loop continuously.
    */

    const marketCards =
        [...filteredMarkets, ...filteredMarkets];


    marketPulseTrack.innerHTML =
        marketCards.map(market => `

            <div class="market-pulse-card">

                <span class="market-card-line"></span>


                <div class="market-card-name">

                    <small>
                        ${market.symbol}
                    </small>

                    <strong>
                        ${market.name}
                    </strong>

                </div>


                <div class="market-card-value">

                    <span class="market-card-price">
                        ${market.price}
                    </span>

                    <span class="market-card-change ${market.direction}">
                        ${market.direction === "up" ? "▲" : "▼"}
                        ${market.change.replace("+", "").replace("-", "")}
                    </span>

                </div>


                <span class="market-card-pulse"></span>

            </div>

        `).join("");


    /*
       Reset animation after changing category.
    */

    marketPulseTrack.style.animation = "none";

    void marketPulseTrack.offsetWidth;

    marketPulseTrack.style.animation =
        "";


    if (filter === "all") {

        marketPulseStatus.textContent =
            "Market activity monitored continuously";

    } else {

        const label =
            filter.charAt(0).toUpperCase() +
            filter.slice(1);

        marketPulseStatus.textContent =
            `${label} market activity`;

    }

}


/* ==========================================
   CATEGORY SWITCHING
========================================== */

pulseCategories.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            activeMarketFilter =
                button.dataset.marketFilter;


            pulseCategories.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );


            button.classList.add(
                "active"
            );


            renderJKWIMarket(
                activeMarketFilter
            );

        }
    );

});


/* ==========================================
   UPDATED TIME
========================================== */

function updateMarketTime() {

    if (!marketPulseTime) return;


    const now = new Date();


    marketPulseTime.textContent =
        "Updated " +
        now.toLocaleTimeString(
            "en-ZA",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


/* ==========================================
   INITIALIZE
========================================== */

renderJKWIMarket("all");

updateMarketTime();


setInterval(
    updateMarketTime,
    60000
);