/*==================================================
   JKWI MARKETS
   Interactive Market Centre
===================================================*/
/*==================================================
   MARKET DATA
===================================================*/
const jkwiMarketData = [
    /*========================
       METALS
    ========================*/
    {
        name: "Gold",
        symbol: "XAU",
        category: "metals",
        categoryName: "Metals",
        price: "$3,450.20",
        change: "+1.24%",
        direction: "positive"
    },
    {
        name: "Silver",
        symbol: "XAG",
        category: "metals",
        categoryName: "Metals",
        price: "$39.84",
        change: "+0.82%",
        direction: "positive"
    },
    {
        name: "Platinum",
        symbol: "XPT",
        category: "metals",
        categoryName: "Metals",
        price: "$1,420.10",
        change: "+0.63%",
        direction: "positive"
    },
    {
        name: "Copper",
        symbol: "HG",
        category: "metals",
        categoryName: "Metals",
        price: "$9,842",
        change: "+1.08%",
        direction: "positive"
    },
    /*========================
       ENERGY
    ========================*/
    {
        name: "Brent Crude",
        symbol: "BRENT",
        category: "energy",
        categoryName: "Energy",
        price: "$71.20",
        change: "-0.41%",
        direction: "negative"
    },
    {
        name: "WTI Crude",
        symbol: "WTI",
        category: "energy",
        categoryName: "Energy",
        price: "$68.45",
        change: "+0.28%",
        direction: "positive"
    },
    {
        name: "Natural Gas",
        symbol: "NG",
        category: "energy",
        categoryName: "Energy",
        price: "$3.12",
        change: "+0.56%",
        direction: "positive"
    },
    /*========================
       AGRICULTURE
    ========================*/
    {
        name: "Wheat",
        symbol: "WHEAT",
        category: "agriculture",
        categoryName: "Agriculture",
        price: "$582.50",
        change: "-0.32%",
        direction: "negative"
    },
    {
        name: "Corn",
        symbol: "CORN",
        category: "agriculture",
        categoryName: "Agriculture",
        price: "$421.75",
        change: "+0.44%",
        direction: "positive"
    },
    /*========================
       FOREX
    ========================*/
    {
        name: "EUR / USD",
        symbol: "EURUSD",
        category: "forex",
        categoryName: "Forex",
        price: "1.1684",
        change: "+0.18%",
        direction: "positive"
    },
    {
        name: "GBP / USD",
        symbol: "GBPUSD",
        category: "forex",
        categoryName: "Forex",
        price: "1.3502",
        change: "-0.11%",
        direction: "negative"
    },
    {
        name: "USD / ZAR",
        symbol: "USDZAR",
        category: "forex",
        categoryName: "Forex",
        price: "16.84",
        change: "-0.24%",
        direction: "negative"
    },
    /*========================
       INDICES
    ========================*/
    {
        name: "S&P 500",
        symbol: "SPX",
        category: "indices",
        categoryName: "Indices",
        price: "6,532",
        change: "+0.72%",
        direction: "positive"
    },
    {
        name: "NASDAQ",
        symbol: "NDX",
        category: "indices",
        categoryName: "Indices",
        price: "21,884",
        change: "+0.91%",
        direction: "positive"
    },
    {
        name: "JSE Top 40",
        symbol: "JSE",
        category: "indices",
        categoryName: "Indices",
        price: "91,420",
        change: "+0.36%",
        direction: "positive"
    },
    /*========================
       CRYPTO
    ========================*/
    {
        name: "Bitcoin",
        symbol: "BTC",
        category: "crypto",
        categoryName: "Digital Assets",
        price: "$118,420",
        change: "+2.10%",
        direction: "positive"
    },
    {
        name: "Ethereum",
        symbol: "ETH",
        category: "crypto",
        categoryName: "Digital Assets",
        price: "$4,280",
        change: "+1.36%",
        direction: "positive"
    },
    {
        name: "Solana",
        symbol: "SOL",
        category: "crypto",
        categoryName: "Digital Assets",
        price: "$214.40",
        change: "-0.62%",
        direction: "negative"
    }
];
/*==================================================
   ELEMENTS
===================================================*/
const marketTableBody =
    document.getElementById("marketTableBody");
const marketTabs =
    document.querySelectorAll(".market-tab");
const marketUpdated =
    document.getElementById("marketUpdated");
/*==================================================
   RENDER MARKET TABLE
===================================================*/
function renderMarketTable(category = "all") {
    if (!marketTableBody) return;
    let filteredData;
    if (category === "all") {
        filteredData = jkwiMarketData;
    } else {
        filteredData =
            jkwiMarketData.filter(
                market =>
                    market.category === category
            );
    }
    /*========================
       EMPTY STATE
    ========================*/
    if (!filteredData.length) {
        marketTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;padding:30px;"
                >
                    No market data available.
                </td>
            </tr>
        `;
        return;
    }
    /*========================
       TABLE ROWS
    ========================*/
    marketTableBody.innerHTML =
        filteredData.map(
            market => `
                <tr>
                    <td>
                        <span class="market-instrument">
                            ${market.name}
                        </span>
                    </td>
                    <td>
                        <span class="market-symbol">
                            ${market.symbol}
                        </span>
                    </td>
                    <td>
                        <span class="market-category">
                            ${market.categoryName}
                        </span>
                    </td>
                    <td>
                        <span class="market-price">
                            ${market.price}
                        </span>
                    </td>
                    <td>
                        <span
                            class="market-change ${market.direction}"
                        >
                            ${
                                market.direction === "positive"
                                    ? "▲"
                                    : "▼"
                            }
                            ${market.change.replace("+","").replace("-","")}
                        </span>
                    </td>
                    <td>
                        <div
                            class="market-trend ${
                                market.direction === "negative"
                                    ? "down"
                                    : ""
                            }"
                        ></div>
                    </td>
                </tr>
            `
        ).join("");
}
/*==================================================
   TAB FILTERING
===================================================*/
marketTabs.forEach(tab => {
    tab.addEventListener(
        "click",
        () => {
            const category =
                tab.dataset.category;
            /*========================
               ACTIVE TAB
            ========================*/
            marketTabs.forEach(item => {
                item.classList.remove("active");
            });
            tab.classList.add("active");
            /*========================
               RENDER
            ========================*/
            renderMarketTable(category);
            /*========================
               UPDATE LABEL
            ========================*/
            updateMarketHeading(category);
        }
    );
});
/*==================================================
   UPDATE HEADING
===================================================*/
function updateMarketHeading(category) {
    if (!marketUpdated) return;
    const now = new Date();
    const time =
        now.toLocaleTimeString(
            "en-ZA",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    if (category === "all") {
        marketUpdated.textContent =
            `All markets • Updated ${time}`;
        return;
    }
    const activeMarket =
        marketTabs.length
            ? Array.from(marketTabs)
                .find(
                    tab =>
                        tab.dataset.category === category
                )
            : null;
    const label =
        activeMarket
            ? activeMarket.textContent.trim()
            : category;
    marketUpdated.textContent =
        `${label} • Updated ${time}`;
}
/*==================================================
   LIVE TIME
===================================================*/
function updateMarketTime() {
    if (!marketUpdated) return;
    const activeTab =
        document.querySelector(
            ".market-tab.active"
        );
    const category =
        activeTab
            ? activeTab.dataset.category
            : "all";
    updateMarketHeading(category);
}
/*==================================================
   SMALL MARKET ANIMATION
===================================================*/
function refreshMarketRows() {
    const rows =
        document.querySelectorAll(
            "#marketTableBody tr"
        );
    rows.forEach(
        (row,index) => {
            row.style.opacity = "0";
            row.style.transform =
                "translateY(4px)";
            setTimeout(
                () => {
                    row.style.transition =
                        "opacity .25s ease, transform .25s ease";
                    row.style.opacity = "1";
                    row.style.transform =
                        "translateY(0)";
                },
                index * 25
            );
        }
    );
}
/*==================================================
   INITIALIZE
===================================================*/
renderMarketTable("all");
updateMarketHeading("all");
/*==================================================
   UPDATE CLOCK
===================================================*/
setInterval(
    updateMarketTime,
    60000
);
/*==================================================
   REFRESH TABLE ANIMATION
===================================================*/
marketTabs.forEach(tab => {
    tab.addEventListener(
        "click",
        () => {
            setTimeout(
                refreshMarketRows,
                20
            );
        }
    );
});
/*==================================================
   OPTIONAL DEMO PRICE MOVEMENT
   Remove this section when API
   market data is connected.
===================================================*/
function demoMarketMovement() {
    jkwiMarketData.forEach(
        market => {
            const current =
                parseFloat(
                    market.change
                        .replace("+","")
                        .replace("%","")
                );
            /*
               Tiny simulated movement.
               This is only for visual demo.
            */
            const movement =
                (Math.random() - .5) * .08;
            let updated =
                current + movement;
            updated =
                Math.max(
                    -.99,
                    Math.min(
                        3.99,
                        updated
                    )
                );
            const sign =
                updated >= 0
                    ? "+"
                    : "";
            market.change =
                `${sign}${updated.toFixed(2)}%`;
            market.direction =
                updated >= 0
                    ? "positive"
                    : "negative";
        }
    );
    const activeTab =
        document.querySelector(
            ".market-tab.active"
        );
    const category =
        activeTab
            ? activeTab.dataset.category
            : "all";
    renderMarketTable(category);
    updateMarketHeading(category);
}
/*
   Demo refresh every 30 seconds.
   Delete this interval when connecting
   to a real market API.
*/
setInterval(
    demoMarketMovement,
    30000
);