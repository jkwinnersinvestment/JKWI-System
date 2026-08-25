const articleForm = document.getElementById("articleForm");
const saveDraft = document.getElementById("saveDraft");

saveDraft.addEventListener("click", () => {
    alert("Article saved as draft.");
});

articleForm.addEventListener("submit", (event) => {
    event.preventDefault();

    alert(
        "Article submitted successfully. It is now waiting for News Manager review."
    );
});