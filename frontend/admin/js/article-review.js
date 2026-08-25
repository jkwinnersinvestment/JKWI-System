const requestChanges = document.getElementById("requestChanges");
const rejectArticle = document.getElementById("rejectArticle");
const approveArticle = document.getElementById("approveArticle");

const managerNotes = document.getElementById("managerNotes");

requestChanges.addEventListener("click", () => {

    if (!managerNotes.value.trim()) {
        alert("Please add notes explaining the requested changes.");
        return;
    }

    alert(
        "Changes requested. The reporter will be notified."
    );

});


rejectArticle.addEventListener("click", () => {

    if (!managerNotes.value.trim()) {
        alert("Please add a reason for rejecting this article.");
        return;
    }

    alert(
        "Article rejected. The reporter will be notified."
    );

});


approveArticle.addEventListener("click", () => {

    const confirmed = confirm(
        "Approve this article for publication?"
    );

    if (!confirmed) {
        return;
    }

    alert(
        "Article approved. It can now enter the publishing workflow."
    );

});