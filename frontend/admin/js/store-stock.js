const searchInput =
    document.getElementById("stockSearch");

const stockFilter =
    document.getElementById("stockFilter");

const rows =
    document.querySelectorAll("#stockTable tr");


function filterStock() {

    const search =
        searchInput.value.toLowerCase();

    const filter =
        stockFilter.value.toLowerCase();


    rows.forEach(row => {

        const text =
            row.textContent.toLowerCase();


        const matchesSearch =
            text.includes(search);


        const matchesFilter =
            filter === "all" ||
            text.includes(filter);


        row.style.display =
            matchesSearch && matchesFilter
                ? ""
                : "none";

    });

}


searchInput.addEventListener(
    "input",
    filterStock
);


stockFilter.addEventListener(
    "change",
    filterStock
);


document
    .getElementById("updateStockBtn")
    .addEventListener("click", () => {

        alert(
            "Stock update form will be connected to the backend later."
        );

    });