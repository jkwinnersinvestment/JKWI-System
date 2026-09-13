/* =========================================================
   JKWI NEWS HOME
   Connects the News homepage to the JKWI News API
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
       ===================================================== */

    const API_URL = "/api/news/published";

    const ARTICLE_PAGE = "news.html";


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const elements = {
        newsDate: document.getElementById("newsDate"),

        newsError: document.getElementById("newsError"),

        breakingNews: document.getElementById("breakingNews"),

        featuredImage: document.getElementById("featuredImage"),
        featuredCategory: document.getElementById("featuredCategory"),
        featuredTitle: document.getElementById("featuredTitle"),
        featuredSummary: document.getElementById("featuredSummary"),
        featuredMeta: document.getElementById("featuredMeta"),
        featuredLink: document.getElementById("featuredLink"),

        featuredSide: document.getElementById("featuredSide"),

        latestNewsGrid: document.getElementById("latestNewsGrid"),

        localBusinessGrid:
            document.getElementById("localBusinessGrid"),

        internationalBusinessGrid:
            document.getElementById("internationalBusinessGrid"),

        localMarketsGrid:
            document.getElementById("localMarketsGrid"),

        internationalMarketsGrid:
            document.getElementById("internationalMarketsGrid"),

        searchPanel:
            document.getElementById("searchPanel"),

        searchInput:
            document.getElementById("newsSearch"),

        searchButton:
            document.getElementById("searchButton"),

        openSearch:
            document.getElementById("openSearch"),

        openMenu:
            document.getElementById("openMenu"),

        mobileMenu:
            document.getElementById("mobileMenu"),

        newsFilters:
            document.getElementById("newsFilters")
    };


    /* =====================================================
       STATE
       ===================================================== */

    let allNews = [];

    let activeFilter = "all";

    let searchTerm = "";


    /* =====================================================
       DATE
       ===================================================== */

    function updateDate() {

        if (!elements.newsDate) {
            return;
        }

        const now = new Date();

        const formattedDate = now.toLocaleDateString(
            "en-ZA",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

        elements.newsDate.textContent = formattedDate;
    }


    /* =====================================================
       API REQUEST
       ===================================================== */

    async function loadNews() {

        try {

            hideError();

            showLoading();

            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });


            if (!response.ok) {

                throw new Error(
                    `News API returned ${response.status}`
                );

            }


            const data = await response.json();


            /*
             * Different backend setups can return:
             *
             * []
             *
             * OR
             *
             * { news: [] }
             *
             * OR
             *
             * { data: [] }
             */

            if (Array.isArray(data)) {

                allNews = data;

            } else if (Array.isArray(data.news)) {

                allNews = data.news;

            } else if (Array.isArray(data.data)) {

                allNews = data.data;

            } else {

                allNews = [];

            }


            /*
             * Make sure only published articles
             * are displayed.
             */

            allNews = allNews.filter(article => {

                if (!article) {
                    return false;
                }

                if (!article.status) {
                    return true;
                }

                return (
                    String(article.status).toLowerCase()
                    === "published"
                );

            });


            /*
             * Sort newest first.
             */

            allNews.sort((a, b) => {

                const dateA =
                    new Date(
                        a.published_at ||
                        a.created_at ||
                        0
                    );

                const dateB =
                    new Date(
                        b.published_at ||
                        b.created_at ||
                        0
                    );

                return dateB - dateA;

            });


            renderNews();

        } catch (error) {

            console.error(
                "JKWI News loading error:",
                error
            );

            showError();

            showEmptyState();

        }

    }


    /* =====================================================
       RENDER EVERYTHING
       ===================================================== */

    function renderNews() {

        renderBreakingNews();

        renderFeatured();

        renderLatestNews();

        renderChannel(
            "Local Business News",
            elements.localBusinessGrid
        );

        renderChannel(
            "International Business News",
            elements.internationalBusinessGrid
        );

        renderChannel(
            "Local Market News",
            elements.localMarketsGrid
        );

        renderChannel(
            "International Markets News",
            elements.internationalMarketsGrid
        );

    }


    /* =====================================================
       BREAKING NEWS
       ===================================================== */

    function renderBreakingNews() {

        if (!elements.breakingNews) {
            return;
        }


        if (!allNews.length) {

            elements.breakingNews.textContent =
                "No published news available yet.";

            return;

        }


        const article = allNews[0];


        elements.breakingNews.textContent =
            cleanText(article.title) ||
            "Latest JKWI News";


        elements.breakingNews.style.cursor = "pointer";


        elements.breakingNews.onclick = () => {

            openArticle(article.id);

        };

    }


    /* =====================================================
       FEATURED STORY
       ===================================================== */

    function renderFeatured() {

        if (!elements.featuredTitle) {
            return;
        }


        if (!allNews.length) {

            elements.featuredTitle.textContent =
                "No published stories yet.";

            elements.featuredSummary.textContent =
                "New stories will appear here once they are published.";

            elements.featuredCategory.textContent =
                "JKWI NEWS";

            elements.featuredMeta.textContent =
                "No published articles";

            elements.featuredLink.style.display =
                "none";

            return;

        }


        const featured = allNews[0];


        elements.featuredTitle.textContent =
            cleanText(featured.title) ||
            "Untitled Story";


        elements.featuredSummary.textContent =
            cleanText(featured.summary) ||
            createShortSummary(featured.content);


        elements.featuredCategory.textContent =
            cleanText(featured.category) ||
            "NEWS";


        elements.featuredMeta.textContent =
            formatMeta(featured);


        elements.featuredLink.href =
            createArticleLink(featured.id);


        elements.featuredLink.style.display =
            "inline-block";


        setImage(
            elements.featuredImage,
            featured.image,
            featured.title
        );


        renderFeaturedSide();

    }


    /* =====================================================
       FEATURED SIDE STORIES
       ===================================================== */

    function renderFeaturedSide() {

        if (!elements.featuredSide) {
            return;
        }


        const sideStories =
            allNews.slice(1, 3);


        if (!sideStories.length) {

            elements.featuredSide.innerHTML = `
                <article class="news-side-card">

                    <span class="news-category">
                        JKWI NEWS
                    </span>

                    <h3>
                        More stories coming soon
                    </h3>

                    <p>
                        Published stories will appear here.
                    </p>

                </article>
            `;

            return;

        }


        elements.featuredSide.innerHTML =
            sideStories
                .map(article => createSideCard(article))
                .join("");

    }


    /* =====================================================
       SIDE CARD
       ===================================================== */

    function createSideCard(article) {

        const id =
            escapeAttribute(article.id);


        const title =
            escapeHTML(
                cleanText(article.title) ||
                "Untitled Story"
            );


        const summary =
            escapeHTML(
                cleanText(article.summary) ||
                createShortSummary(article.content)
            );


        const category =
            escapeHTML(
                cleanText(article.category) ||
                "NEWS"
            );


        return `
            <article
                class="news-side-card"
                data-article-id="${id}"
                style="cursor:pointer;"
            >

                <span class="news-category">
                    ${category}
                </span>

                <h3>
                    ${title}
                </h3>

                <p>
                    ${summary}
                </p>

            </article>
        `;

    }


    /* =====================================================
       LATEST NEWS
       ===================================================== */

    function renderLatestNews() {

        if (!elements.latestNewsGrid) {
            return;
        }


        let filteredNews =
            getFilteredNews();


        /*
         * Don't repeat the main featured story
         * at the top of Latest News.
         */

        if (
            activeFilter === "all" &&
            !searchTerm
        ) {

            filteredNews =
                filteredNews.slice(1);

        }


        /*
         * Show a compact maximum of 8 stories.
         */

        filteredNews =
            filteredNews.slice(0, 8);


        if (!filteredNews.length) {

            elements.latestNewsGrid.innerHTML = `
                <div class="news-empty">

                    No news stories match your search.

                </div>
            `;

            return;

        }


        elements.latestNewsGrid.innerHTML =
            filteredNews
                .map(article => createNewsCard(article))
                .join("");

    }


    /* =====================================================
       CHANNEL NEWS
       ===================================================== */

    function renderChannel(
        channelName,
        container
    ) {

        if (!container) {
            return;
        }


        const channelNews =
            allNews
                .filter(article =>
                    categoryMatches(
                        article.category,
                        channelName
                    )
                )
                .slice(0, 4);


        if (!channelNews.length) {

            container.innerHTML = `
                <div class="news-empty">

                    No published stories in this channel yet.

                </div>
            `;

            return;

        }


        container.innerHTML =
            channelNews
                .map(article => createNewsCard(article))
                .join("");

    }


    /* =====================================================
       NEWS CARD
       ===================================================== */

    function createNewsCard(article) {

        const id =
            escapeAttribute(article.id);


        const title =
            escapeHTML(
                cleanText(article.title) ||
                "Untitled Story"
            );


        const summary =
            escapeHTML(
                cleanText(article.summary) ||
                createShortSummary(article.content)
            );


        const category =
            escapeHTML(
                cleanText(article.category) ||
                "NEWS"
            );


        const meta =
            escapeHTML(
                formatMeta(article)
            );


        const image =
            getImageUrl(article.image);


        return `
            <article
                class="news-card"
                data-article-id="${id}"
                tabindex="0"
                role="link"
                aria-label="Read ${title}"
            >

                <div class="news-card-image">

                    ${
                        image
                            ? `
                                <img
                                    src="${escapeAttribute(image)}"
                                    alt="${title}"
                                    loading="lazy"
                                    onerror="this.style.display='none'"
                                >
                            `
                            : ""
                    }

                </div>


                <div class="news-card-content">

                    <span class="news-category">
                        ${category}
                    </span>

                    <h3>
                        ${title}
                    </h3>

                    <p class="news-card-summary">
                        ${summary}
                    </p>

                    <div class="news-card-meta">
                        <span>
                            ${meta}
                        </span>

                        <span>
                            Read →
                        </span>
                    </div>

                </div>

            </article>
        `;

    }


    /* =====================================================
       FILTER NEWS
       ===================================================== */

    function getFilteredNews() {

        let results = [...allNews];


        if (activeFilter !== "all") {

            results =
                results.filter(article =>
                    categoryMatches(
                        article.category,
                        activeFilter
                    )
                );

        }


        if (searchTerm) {

            const search =
                searchTerm.toLowerCase();


            results =
                results.filter(article => {

                    const title =
                        String(
                            article.title || ""
                        ).toLowerCase();


                    const summary =
                        String(
                            article.summary || ""
                        ).toLowerCase();


                    const content =
                        String(
                            article.content || ""
                        ).toLowerCase();


                    const category =
                        String(
                            article.category || ""
                        ).toLowerCase();


                    return (
                        title.includes(search) ||
                        summary.includes(search) ||
                        content.includes(search) ||
                        category.includes(search)
                    );

                });

        }


        return results;

    }


    /* =====================================================
       FILTER BUTTONS
       ===================================================== */

    function setupFilters() {

        if (!elements.newsFilters) {
            return;
        }


        const buttons =
            elements.newsFilters.querySelectorAll(
                ".news-filter"
            );


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    buttons.forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                    button.classList.add(
                        "active"
                    );


                    activeFilter =
                        button.dataset.filter ||
                        "all";


                    renderLatestNews();

                }
            );

        });

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    function setupSearch() {

        if (elements.openSearch) {

            elements.openSearch.addEventListener(
                "click",
                () => {

                    if (!elements.searchPanel) {
                        return;
                    }


                    elements.searchPanel.classList.toggle(
                        "show"
                    );


                    if (
                        elements.searchPanel.classList.contains(
                            "show"
                        )
                    ) {

                        elements.searchInput?.focus();

                    }

                }
            );

        }


        if (elements.searchButton) {

            elements.searchButton.addEventListener(
                "click",
                performSearch
            );

        }


        if (elements.searchInput) {

            elements.searchInput.addEventListener(
                "input",
                () => {

                    searchTerm =
                        elements.searchInput.value.trim();

                    renderLatestNews();

                }
            );


            elements.searchInput.addEventListener(
                "keydown",
                event => {

                    if (event.key === "Enter") {

                        performSearch();

                    }

                }
            );

        }

    }


    function performSearch() {

        if (!elements.searchInput) {
            return;
        }


        searchTerm =
            elements.searchInput.value.trim();


        activeFilter = "all";


        if (elements.newsFilters) {

            elements.newsFilters
                .querySelectorAll(".news-filter")
                .forEach(button => {

                    button.classList.remove(
                        "active"
                    );

                });


            const allButton =
                elements.newsFilters.querySelector(
                    '[data-filter="all"]'
                );


            allButton?.classList.add(
                "active"
            );

        }


        renderLatestNews();


        const latest =
            document.getElementById(
                "latest-news"
            );


        latest?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    function setupMobileMenu() {

        if (!elements.openMenu) {
            return;
        }


        elements.openMenu.addEventListener(
            "click",
            () => {

                if (!elements.mobileMenu) {
                    return;
                }


                const isOpen =
                    elements.mobileMenu.classList.toggle(
                        "show"
                    );


                elements.openMenu.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );


        if (elements.mobileMenu) {

            elements.mobileMenu
                .querySelectorAll("a")
                .forEach(link => {

                    link.addEventListener(
                        "click",
                        () => {

                            elements.mobileMenu.classList.remove(
                                "show"
                            );


                            elements.openMenu.setAttribute(
                                "aria-expanded",
                                "false"
                            );

                        }
                    );

                });

        }

    }


    /* =====================================================
       ARTICLE CLICK HANDLER
       ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const card =
                event.target.closest(
                    "[data-article-id]"
                );


            if (!card) {
                return;
            }


            const id =
                card.dataset.articleId;


            if (id) {

                openArticle(id);

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }


            const card =
                event.target.closest(
                    "[data-article-id]"
                );


            if (!card) {
                return;
            }


            event.preventDefault();


            const id =
                card.dataset.articleId;


            if (id) {

                openArticle(id);

            }

        }
    );


    /* =====================================================
       OPEN ARTICLE
       ===================================================== */

    function openArticle(id) {

        if (
            id === undefined ||
            id === null ||
            id === ""
        ) {
            return;
        }


        window.location.href =
            createArticleLink(id);

    }


    function createArticleLink(id) {

        return (
            ARTICLE_PAGE +
            "?id=" +
            encodeURIComponent(id)
        );

    }


    /* =====================================================
       CATEGORY MATCHING
       ===================================================== */

    function categoryMatches(
        articleCategory,
        requestedCategory
    ) {

        const article =
            normalizeCategory(articleCategory);


        const requested =
            normalizeCategory(requestedCategory);


        if (!article || !requested) {
            return false;
        }


        /*
         * Exact match first.
         */

        if (article === requested) {
            return true;
        }


        /*
         * Allow small naming differences.
         */

        if (
            article.includes(requested) ||
            requested.includes(article)
        ) {
            return true;
        }


        /*
         * Common shorter category names.
         */

        const aliases = {

            "localbusiness":
                "localbusinessnews",

            "internationalbusiness":
                "internationalbusinessnews",

            "localmarkets":
                "localmarketnews",

            "internationalmarkets":
                "internationalmarketsnews"

        };


        return (
            aliases[article] === requested ||
            aliases[requested] === article
        );

    }


    function normalizeCategory(value) {

        return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

    }


    /* =====================================================
       IMAGE HANDLING
       ===================================================== */

    function getImageUrl(image) {

        if (!image) {
            return "";
        }


        let imagePath =
            String(image).trim();


        if (!imagePath) {
            return "";
        }


        /*
         * Already an absolute URL.
         */

        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
        ) {

            return imagePath;

        }


        /*
         * If backend already returns /uploads/...
         */

        if (
            imagePath.startsWith("/")
        ) {

            return imagePath;

        }


        /*
         * If backend returns uploads/...
         */

        if (
            imagePath.startsWith("uploads/")
        ) {

            return "/" + imagePath;

        }


        /*
         * Otherwise assume uploaded news image.
         */

        return "/uploads/news/" + imagePath;

    }


    function setImage(
        imageElement,
        imagePath,
        title
    ) {

        if (!imageElement) {
            return;
        }


        const url =
            getImageUrl(imagePath);


        if (!url) {

            imageElement.removeAttribute(
                "src"
            );

            imageElement.alt =
                title || "JKWI News";

            return;

        }


        imageElement.src = url;

        imageElement.alt =
            title || "JKWI News";


        imageElement.onerror = () => {

            imageElement.style.display =
                "none";

        };

    }


    /* =====================================================
       TEXT HELPERS
       ===================================================== */

    function cleanText(value) {

        if (
            value === undefined ||
            value === null
        ) {
            return "";
        }


        return String(value)
            .replace(/\s+/g, " ")
            .trim();

    }


    function createShortSummary(content) {

        const text =
            cleanText(content)
                .replace(/<[^>]*>/g, "");


        if (!text) {
            return "Read the latest story from JKWI News.";
        }


        if (text.length <= 160) {
            return text;
        }


        return (
            text.substring(0, 157) +
            "..."
        );

    }


    function formatMeta(article) {

        const date =
            article.published_at ||
            article.created_at;


        if (!date) {
            return "JKWI News";
        }


        const parsed =
            new Date(date);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return "JKWI News";
        }


        const formatted =
            parsed.toLocaleDateString(
                "en-ZA",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );


        return "JKWI News • " + formatted;

    }


    /* =====================================================
       HTML SAFETY
       ===================================================== */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }


    /* =====================================================
       LOADING
       ===================================================== */

    function showLoading() {

        const loadingHTML = `
            <div class="news-loading">
                Loading latest news...
            </div>
        `;


        if (elements.latestNewsGrid) {
            elements.latestNewsGrid.innerHTML =
                loadingHTML;
        }


        if (elements.localBusinessGrid) {
            elements.localBusinessGrid.innerHTML =
                loadingHTML;
        }


        if (elements.internationalBusinessGrid) {
            elements.internationalBusinessGrid.innerHTML =
                loadingHTML;
        }


        if (elements.localMarketsGrid) {
            elements.localMarketsGrid.innerHTML =
                loadingHTML;
        }


        if (elements.internationalMarketsGrid) {
            elements.internationalMarketsGrid.innerHTML =
                loadingHTML;
        }

    }


    /* =====================================================
       EMPTY STATE
       ===================================================== */

    function showEmptyState() {

        const message = `
            <div class="news-empty">
                No published news is available yet.
            </div>
        `;


        if (elements.latestNewsGrid) {
            elements.latestNewsGrid.innerHTML =
                message;
        }


        if (elements.localBusinessGrid) {
            elements.localBusinessGrid.innerHTML =
                message;
        }


        if (elements.internationalBusinessGrid) {
            elements.internationalBusinessGrid.innerHTML =
                message;
        }


        if (elements.localMarketsGrid) {
            elements.localMarketsGrid.innerHTML =
                message;
        }


        if (elements.internationalMarketsGrid) {
            elements.internationalMarketsGrid.innerHTML =
                message;
        }

    }


    /* =====================================================
       ERROR
       ===================================================== */

    function showError() {

        if (!elements.newsError) {
            return;
        }


        elements.newsError.textContent =
            "Unable to load JKWI News. Check that the server and News API are running.";


        elements.newsError.classList.add(
            "show"
        );

    }


    function hideError() {

        if (!elements.newsError) {
            return;
        }


        elements.newsError.classList.remove(
            "show"
        );

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    updateDate();

    setupFilters();

    setupSearch();

    setupMobileMenu();

    loadNews();

});