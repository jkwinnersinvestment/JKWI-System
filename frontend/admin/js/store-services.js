const searchInput = document.getElementById("serviceSearch");
const serviceFilter = document.getElementById("serviceFilter");
const services = document.querySelectorAll(".service-card");

function filterServices() {

    const search = searchInput.value.toLowerCase();
    const category = serviceFilter.value.toLowerCase();

    services.forEach(service => {

        const text = service.textContent.toLowerCase();

        const matchesSearch = text.includes(search);

        const matchesCategory =
            category === "all" ||
            text.includes(category);

        service.style.display =
            matchesSearch && matchesCategory
                ? ""
                : "none";

    });

}

searchInput.addEventListener("input", filterServices);
serviceFilter.addEventListener("change", filterServices);


document.getElementById("addServiceBtn")
    .addEventListener("click", () => {

        alert(
            "Service creation form will be connected to the backend later."
        );

    });