// ==========================================
// JK Winners Investment
// Live WTI Oil Price
// ==========================================

const API_KEY = "5RJ9MFDS8C6YE3S0";

async function loadWTI() {

    const ticker = document.getElementById("commodityTicker");

    try {

        ticker.innerHTML = "Loading market data...";

        const response = await fetch(
            `https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error("Network response was not OK");
        }

        const data = await response.json();

        console.log(data);

        if (!data.data || data.data.length === 0) {
            ticker.innerHTML = "No market data available";
            return;
        }

        const latest = data.data[0];

        ticker.innerHTML = `
            <span>🛢️ WTI CRUDE OIL</span>
            <span>$${latest.value} / barrel</span>
            <span>${latest.date}</span>
        `;

    } catch (error) {

        console.error(error);

        ticker.innerHTML = "Unable to load market data";

    }

}

loadWTI();

setInterval(loadWTI, 3600000);
window.addEventListener("scroll", function(){

document.querySelector(".navbar").classList.toggle("scrolled", window.scrollY > 50);

});
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");

menuToggle.addEventListener("click", () => {

    navMenu.classList.toggle("active");

});

document.querySelectorAll(".dropdown > a").forEach(item => {

    item.addEventListener("click", function(e){

        if(window.innerWidth <= 992){

            e.preventDefault();

            this.parentElement.classList.toggle("open");

        }

    });

});
const API_KEY = f03a84d72f46b498defbe0d6aed423

async function getPrice(symbol, elementId) {
    try {
        const response = await fetch(
            `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${API_KEY}`
        );

        const data = await response.json();

        if (data.price) {
            document.getElementById(elementId).textContent =
                "$" + parseFloat(data.price).toFixed(2);
        } else {
            document.getElementById(elementId).textContent = "N/A";
            console.log(data);
        }

    } catch (error) {
        document.getElementById(elementId).textContent = "Error";
        console.error(error);
    }
}

// Examples
getPrice("XAU/USD", "gold");
getPrice("XAG/USD", "silver");