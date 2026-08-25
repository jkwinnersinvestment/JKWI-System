const HOME_NEWS_API = "/api/news/published";


// ==========================================
// LOAD PUBLIC NEWS
// ==========================================

async function loadHomeNews() {

    const container =
        document.getElementById(
            "homeNewsContainer"
        );

    if (!container) return;


    try {

        const response =
            await fetch(HOME_NEWS_API);


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                "Could not load news"
            );

        }


        const news =
            data.news || [];


        // ==================================
        // NO NEWS
        // ==================================

        if (news.length === 0) {

            container.innerHTML = `

                <div class="news-empty">

                    <h3>
                        No news available
                    </h3>

                    <p>
                        Check back soon for the latest JKWI news.
                    </p>

                </div>

            `;

            return;

        }


        // ==================================
        // SHOW LATEST 4
        // ==================================

        const latestNews =
            news.slice(0, 4);


        container.innerHTML =
            latestNews
                .map(article => {

                    const image =
                        article.image
                            ? article.image
                            : "images/news/default.jpg";


                    const date =
                        article.published_at
                            ? formatNewsDate(
                                article.published_at
                            )
                            : "Latest";


                    return `

                        <article
                            class="news-item"
                        >

                            <img
                                src="${image}"
                                alt="${escapeNewsHTML(
                                    article.title
                                )}"
                            >


                            <div
                                class="news-info"
                            >

                                <div
                                    class="news-meta"
                                >

                                    <span>
                                        ${escapeNewsHTML(
                                            article.category
                                        )}
                                    </span>

                                    <small>
                                        ${date}
                                    </small>

                                </div>


                                <h3>
                                    ${escapeNewsHTML(
                                        article.title
                                    )}
                                </h3>


                                <p>
                                    ${escapeNewsHTML(
                                        article.summary
                                    )}
                                </p>


                                <a
                                    href="news.html?id=${article.id}"
                                >
                                    Read More →
                                </a>

                            </div>

                        </article>

                    `;

                })
                .join("");


    }
    catch (error) {

        console.error(
            "Homepage news error:",
            error
        );


        container.innerHTML = `

            <div class="news-empty">

                <h3>
                    News temporarily unavailable
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatNewsDate(date) {

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
// SECURITY
// ==========================================

function escapeNewsHTML(value) {

    if (!value) return "";

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

document.addEventListener(
    "DOMContentLoaded",
    loadHomeNews
);