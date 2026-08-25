const searchInput = document.getElementById("newsSearch");
const articles = document.querySelectorAll(".published-row");

searchInput.addEventListener("input", () => {

    const searchTerm = searchInput.value.toLowerCase();

    articles.forEach(article => {

        const text = article.textContent.toLowerCase();

        article.style.display =
            text.includes(searchTerm)
                ? "grid"
                : "none";

    });

});