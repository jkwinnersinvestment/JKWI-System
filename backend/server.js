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
// EMAIL SERVICE
// ==========================================

const {
    verifyEmailConnection
} = require("./services/emailService");


// ==========================================
// ROUTES
// ==========================================

const authRoutes =
    require("./routes/authRoutes");

const newsRoutes =
    require("./routes/newsRoutes");

const userRoutes =
    require("./routes/userRoutes");

const verificationRoutes =
    require("./routes/verificationRoutes");


// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    cors()
);

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

    windowMs:
        15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {

        success: false,

        message:
            "Too many requests. Please try again later."

    }

});

app.use(limiter);


// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(
            __dirname,
            "../frontend"
        )
    )
);


// ==========================================
// SERVE UPLOADED FILES
// ==========================================

app.use(
    "/uploads",

    express.static(
        path.join(
            __dirname,
            "../uploads"
        )
    )
);


// ==========================================
// HOME PAGE
// ==========================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../frontend/index.html"
            )
        );

    }
);


// ==========================================
// API HEALTH CHECK
// ==========================================

app.get(
    "/api",
    (req, res) => {

        res.json({

            success: true,

            message:
                "JK Winners Investment API Running"

        });

    }
);


// ==========================================
// DATABASE HEALTH CHECK
// ==========================================

app.get(
    "/api/database",

    (req, res) => {

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

    }
);


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
//
// POST /api/users/register
//
// ==========================================

app.use(
    "/api/users",
    userRoutes
);


// ==========================================
// VERIFICATION API
// ==========================================
//
// POST /api/verification/send
//
// POST /api/verification/verify
//
// ==========================================

app.use(
    "/api/verification",
    verificationRoutes
);


// ==========================================
// NEWS API
// ==========================================

app.use(
    "/api/news",
    newsRoutes
);


// ==========================================
// 404 HANDLER
// ==========================================

app.use(
    (req, res, next) => {

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

    }
);


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

    async () => {

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
            ` Server: http://localhost:${PORT}`
        );

        console.log(
            ` API:    http://localhost:${PORT}/api`
        );

        console.log(
            ` Users:  http://localhost:${PORT}/api/users`
        );

        console.log(
            ` Verification: http://localhost:${PORT}/api/verification`
        );

        console.log(
            ` News:   http://localhost:${PORT}/api/news`
        );

        console.log(
            ` Uploads: http://localhost:${PORT}/uploads`
        );

        console.log(
            "=================================="
        );

        console.log("");


        // ==========================================
        // VERIFY EMAIL SERVICE
        // ==========================================

        await verifyEmailConnection();

    }
);