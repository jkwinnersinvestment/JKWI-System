const API_URL = "/api/news";


// ==========================================
// ELEMENTS
// ==========================================

const newsEditor = document.getElementById("newsEditor");
const newsForm = document.getElementById("newsForm");
const newsContainer = document.getElementById("newsContainer");

const openNewsEditor =
    document.getElementById("openNewsEditor");

const createNewsButton =
    document.getElementById("createNewsButton");

const filterCategory =
    document.getElementById("filterCategory");


// ==========================================
// OPEN EDITOR
// ==========================================

function showEditor() {

    newsEditor.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ==========================================
// CLOSE EDITOR
// ==========================================

function hideEditor() {

    newsEditor.classList.remove("show");

}


// ==========================================
// OPEN BUTTONS
// ==========================================

if (openNewsEditor) {

    openNewsEditor.addEventListener(
        "click",
        showEditor
    );

}


if (createNewsButton) {

    createNewsButton.addEventListener(
        "click",
        showEditor
    );

}


// ==========================================
// SAVE DRAFT
// ==========================================

async function saveDraft() {

    const title =
        document.getElementById("title").value.trim();

    const category =
        document.getElementById("category").value;

    const summary =
        document.getElementById("summary").value.trim();

    const content =
        document.getElementById("content").value.trim();

    const imageInput =
        document.getElementById("image");


    if (
        !title ||
        !category ||
        !summary ||
        !content
    ) {

        alert(
            "Please complete the headline, category, summary and article."
        );

        return;

    }


    const formData = new FormData();

    formData.append("title", title);
    formData.append("category", category);
    formData.append("summary", summary);
    formData.append("content", content);
    formData.append("status", "draft");
    formData.append("published_at", "");


    if (
        imageInput &&
        imageInput.files.length > 0
    ) {

        formData.append(
            "image",
            imageInput.files[0]
        );

    }


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                body: formData

            });


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to save draft"
            );

        }


        alert(
            "Draft saved successfully."
        );


        newsForm.reset();

        hideEditor();

        loadNews();

    }
    catch (error) {

        console.error(
            "Draft error:",
            error
        );

        alert(
            error.message ||
            "Could not save the draft."
        );

    }

}


// ==========================================
// PUBLISH NEWS
// ==========================================

if (newsForm) {

    newsForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const title =
                document
                    .getElementById("title")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    .value;


            const summary =
                document
                    .getElementById("summary")
                    .value
                    .trim();


            const content =
                document
                    .getElementById("content")
                    .value
                    .trim();


            const publishedAt =
                document
                    .getElementById("publishedAt")
                    .value;


            const imageInput =
                document
                    .getElementById("image");


            if (
                !title ||
                !category ||
                !summary ||
                !content
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;

            }


            const publishButton =
                document.querySelector(
                    ".publish-btn"
                );


            publishButton.disabled = true;

            publishButton.textContent =
                "Publishing...";


            // ==================================
            // FORM DATA
            // ==================================

            const formData =
                new FormData();


            formData.append(
                "title",
                title
            );


            formData.append(
                "category",
                category
            );


            formData.append(
                "summary",
                summary
            );


            formData.append(
                "content",
                content
            );


            formData.append(
                "status",
                "published"
            );


            formData.append(
                "published_at",
                publishedAt || ""
            );


            // ==================================
            // IMAGE
            // ==================================

            if (
                imageInput &&
                imageInput.files.length > 0
            ) {

                formData.append(
                    "image",
                    imageInput.files[0]
                );

            }


            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Failed to publish news"
                    );

                }


                alert(
                    "News published successfully!"
                );


                newsForm.reset();

                hideEditor();

                loadNews();

            }
            catch (error) {

                console.error(
                    "Publish error:",
                    error
                );


                alert(
                    error.message ||
                    "Could not publish the news."
                );

            }
            finally {

                publishButton.disabled =
                    false;

                publishButton.textContent =
                    "Publish News";

            }

        }
    );

}


// ==========================================
// LOAD NEWS
// ==========================================

async function loadNews() {

    try {

        const response =
            await fetch(API_URL);


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Could not load news"
            );

        }


        const news =
            data.news || [];


        // ==================================
        // STATISTICS
        // ==================================

        const published =
            news.filter(
                article =>
                    article.status === "published"
            ).length;


        const drafts =
            news.filter(
                article =>
                    article.status === "draft"
            ).length;


        document.getElementById(
            "publishedCount"
        ).textContent = published;


        document.getElementById(
            "draftCount"
        ).textContent = drafts;


        document.getElementById(
            "totalCount"
        ).textContent = news.length;


        // ==================================
        // FILTER
        // ==================================

        const selectedCategory =
            filterCategory
                ? filterCategory.value
                : "all";


        const filteredNews =
            selectedCategory === "all"
                ? news
                : news.filter(
                    article =>
                        article.category ===
                        selectedCategory
                );


        // ==================================
        // EMPTY STATE
        // ==================================

        if (
            filteredNews.length === 0
        ) {

            newsContainer.innerHTML = `

                <div class="empty-news">

                    <div class="empty-icon">
                        +
                    </div>

                    <h3>
                        No news articles yet
                    </h3>

                    <p>
                        Create your first JKWI news article.
                    </p>

                    <button
                        type="button"
                        id="createNewsDynamic"
                    >
                        Create News
                    </button>

                </div>

            `;


            const dynamicButton =
                document.getElementById(
                    "createNewsDynamic"
                );


            if (dynamicButton) {

                dynamicButton.addEventListener(
                    "click",
                    showEditor
                );

            }


            return;

        }


        // ==================================
        // NEWS CARDS
        // ==================================

        newsContainer.innerHTML =
            filteredNews
                .map(article => {

                    const imageHTML =
                        article.image
                            ? `
                                <img
                                    src="${article.image}"
                                    alt="${escapeHTML(
                                        article.title
                                    )}"
                                    class="admin-news-image"
                                >
                              `
                            : "";


                    return `

                        <article
                            class="admin-news-item"
                        >

                            ${imageHTML}

                            <div
                                class="admin-news-info"
                            >

                                <span
                                    class="news-category"
                                >
                                    ${escapeHTML(
                                        article.category
                                    )}
                                </span>


                                <h3>
                                    ${escapeHTML(
                                        article.title
                                    )}
                                </h3>


                                <p>
                                    ${escapeHTML(
                                        article.summary
                                    )}
                                </p>


                                <div
                                    class="news-meta"
                                >

                                    <span>
                                        ${escapeHTML(
                                            article.status
                                        )}
                                    </span>

                                    <small>
                                        ${formatDate(
                                            article.published_at ||
                                            article.created_at
                                        )}
                                    </small>

                                </div>

                            </div>

                        </article>

                    `;

                })
                .join("");

    }
    catch (error) {

        console.error(
            "Load news error:",
            error
        );

    }

}


// ==========================================
// CATEGORY FILTER
// ==========================================

if (filterCategory) {

    filterCategory.addEventListener(
        "change",
        loadNews
    );

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(date) {

    if (!date) {

        return "Not published";

    }


    return new Date(date)
        .toLocaleDateString(
            "en-ZA",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (!value) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// START
// ==========================================

loadNews();