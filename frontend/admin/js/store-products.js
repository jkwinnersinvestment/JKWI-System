const searchInput = document.getElementById("productSearch");
const categoryFilter = document.getElementById("categoryFilter");
const products = document.querySelectorAll(".product-card");

function filterProducts() {

    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value.toLowerCase();

    products.forEach(product => {

        const text = product.textContent.toLowerCase();

        const matchesSearch =
            text.includes(search);

        const matchesCategory =
            category === "all" ||
            text.includes(category);

        product.style.display =
            matchesSearch && matchesCategory
                ? ""
                : "none";

    });

}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);


document.getElementById("addProductBtn")
    .addEventListener("click", () => {

        alert(
            "Product creation form will be connected to the backend later."
        );

    });