const ARTICLE_API = "/api/news";


// ==========================================
// GET ARTICLE ID
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const articleId =
    params.get("id");


// ==========================================
// ELEMENTS
// ==========================================

const loading =
    document.getElementById(
        "articleLoading"
    );

const article =
    document.getElementById(
        "article"
    );

const errorBox =
    document.getElementById(
        "articleError"
    );

const title =
    document.getElementById(
        "articleTitle"
    );

const category =
    document.getElementById(
        "articleCategory"
    );

const date =
    document.getElementById(
        "articleDate"
    );

const summary =
    document.getElementById(
        "articleSummary"
    );

const image =
    document.getElementById(
        "articleImage"
    );

const content =
    document.getElementById(
        "articleContent"
    );


// ==========================================
// LOAD ARTICLE
// ==========================================

async function loadArticle() {

    if (!articleId) {

        showError();

        return;

    }


    try {

        const response =
            await fetch(
                `${ARTICLE_API}/${articleId}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success ||
            !data.news
        ) {

            throw new Error(
                "Article not found"
            );

        }


        const news =
            data.news;


        // ==================================
        // PAGE TITLE
        // ==================================

        document.title =
            `${news.title} | JK Winners Investment`;


        // ==================================
        // ARTICLE DATA
        // ==================================

        title.textContent =
            news.title || "";


        category.textContent =
            news.category || "NEWS";


        summary.textContent =
            news.summary || "";


        date.textContent =
            formatDate(
                news.published_at ||
                news.created_at
            );


        // ==================================
        // IMAGE
        // ==================================

        if (news.image) {

            image.src =
                news.image;

            image.alt =
                news.title || "JKWI News";

            image.style.display =
                "block";

        }
        else {

            image.style.display =
                "none";

        }


        // ==================================
        // CONTENT
        // ==================================

        content.innerHTML =
            formatArticleContent(
                news.content
            );


        // ==================================
        // SHOW ARTICLE
        // ==================================

        loading.hidden =
            true;

        errorBox.hidden =
            true;

        article.hidden =
            false;

    }
    catch (error) {

        console.error(
            "Article loading error:",
            error
        );

        showError();

    }

}


// ==========================================
// FORMAT ARTICLE
// ==========================================

function formatArticleContent(text) {

    if (!text) {

        return "";

    }


    return escapeHTML(text)
        .replace(
            /\n\n/g,
            "</p><p>"
        )
        .replace(
            /\n/g,
            "<br>"
        )
        .replace(
            /^/,
            "<p>"
        )
        .replace(
            /$/,
            "</p>"
        );

}


// ==========================================
// DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "Date unavailable";

    }


    return new Date(dateValue)
        .toLocaleDateString(
            "en-ZA",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


// ==========================================
// SECURITY
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
// ERROR
// ==========================================

function showError() {

    loading.hidden =
        true;

    article.hidden =
        true;

    errorBox.hidden =
        false;

}


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    loadArticle
);