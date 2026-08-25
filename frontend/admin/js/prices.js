const searchInput = document.getElementById("priceSearch");
const rows = document.querySelectorAll("#priceTable tr");

searchInput.addEventListener("input", () => {

    const searchTerm = searchInput.value.toLowerCase();

    rows.forEach(row => {

        const text = row.textContent.toLowerCase();

        row.style.display =
            text.includes(searchTerm)
                ? ""
                : "none";

    });

});


const addPriceBtn = document.getElementById("addPriceBtn");

addPriceBtn.addEventListener("click", () => {

    alert(
        "Price management form will be connected to the backend later."
    );

});