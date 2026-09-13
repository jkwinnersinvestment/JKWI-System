const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

// ==========================================
// LOAD ENVIRONMENT VARIABLES
// ==========================================

dotenv.config();


// ==========================================
// DATABASE
// ==========================================

const db = require("./config/database");


// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");
const userRoutes = require("./routes/userRoutes");


// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();


// ==========================================
// PATHS
// ==========================================
//
// server.js:
// JKWI-System/backend/server.js
//
// Frontend:
// JKWI-System/frontend/
//
// Uploads:
// JKWI-System/uploads/
// ==========================================

const FRONTEND_PATH = path.join(
    __dirname,
    "..",
    "frontend"
);

const UPLOADS_PATH = path.join(
    __dirname,
    "..",
    "uploads"
);


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cors());

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);


// ==========================================
// RATE LIMITER
// ==========================================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use(limiter);


// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(
    express.static(FRONTEND_PATH)
);


// ==========================================
// SERVE UPLOADED FILES
// ==========================================

app.use(
    "/uploads",
    express.static(UPLOADS_PATH)
);


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            FRONTEND_PATH,
            "index.html"
        )
    );

});


// ==========================================
// API HEALTH CHECK
// ==========================================

app.get("/api", (req, res) => {

    res.json({

        success: true,

        message:
            "JK Winners Investment API Running"

    });

});


// ==========================================
// DATABASE HEALTH CHECK
// ==========================================

app.get("/api/database", (req, res) => {

    db.query(
        "SELECT 1 AS connected",

        (err) => {

            if (err) {

                console.error(
                    "Database health check failed:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database connection failed"

                });

            }

            res.json({

                success: true,

                message:
                    "JKWI Database Connected Successfully"

            });

        }
    );

});


// ==========================================
// AUTHENTICATION API
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);


// ==========================================
// USER API
// ==========================================

app.use(
    "/api/users",
    userRoutes
);


// ==========================================
// NEWS API
// ==========================================

app.use(
    "/api/news",
    newsRoutes
);


// ==========================================
// API 404 HANDLER
// ==========================================

app.use((req, res, next) => {

    if (
        req.path.startsWith("/api/")
    ) {

        return res.status(404).json({

            success: false,

            message:
                "API endpoint not found"

        });

    }

    next();

});


// ==========================================
// GENERAL 404 HANDLER
// ==========================================

app.use((req, res) => {

    res.status(404).send(
        "Page not found"
    );

});


// ==========================================
// ERROR HANDLER
// ==========================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Server Error:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
);


// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,

    () => {

        console.log("");

        console.log(
            "=================================="
        );

        console.log(
            " JK WINNERS INVESTMENT"
        );

        console.log(
            " Backend Running Successfully"
        );

        console.log(
            "=================================="
        );

        console.log(
            ` Server running on port ${PORT}`
        );

        console.log(
            ` API: /api`
        );

        console.log(
            ` Database: /api/database`
        );

        console.log(
            ` Users: /api/users`
        );

        console.log(
            ` News: /api/news`
        );

        console.log(
            ` Uploads: /uploads`
        );

        console.log(
            "=================================="
        );

        console.log("");

    }
);