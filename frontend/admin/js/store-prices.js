const searchInput = document.getElementById("priceSearch");
const typeFilter = document.getElementById("typeFilter");
const rows = document.querySelectorAll("#priceTable tr");

function filterPrices() {

    const search = searchInput.value.toLowerCase();
    const type = typeFilter.value.toLowerCase();

    rows.forEach(row => {

        const text = row.textContent.toLowerCase();

        const matchesSearch =
            text.includes(search);

        const matchesType =
            type === "all" ||
            text.includes(type);

        row.style.display =
            matchesSearch && matchesType
                ? ""
                : "none";

    });
}

searchInput.addEventListener("input", filterPrices);
typeFilter.addEventListener("change", filterPrices);


document.getElementById("addPriceBtn")
    .addEventListener("click", () => {

        alert(
            "Price creation will be connected to the backend later."
        );

    });