const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const db = require("../config/database");


// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDir = path.join(
    __dirname,
    "../../uploads/news"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}


// ==========================================
// MULTER STORAGE
// ==========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname)
                .toLowerCase();

        const uniqueName =
            `news-${Date.now()}-${Math.round(
                Math.random() * 1000000
            )}${extension}`;

        cb(null, uniqueName);
    }

});


// ==========================================
// IMAGE FILTER
// ==========================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPG, PNG and WebP images are allowed."
            )
        );

    }

};


// ==========================================
// MULTER
// ==========================================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


// ==========================================
// JWT AUTHENTICATION
// ==========================================

const authenticateAdmin = (req, res, next) => {

    const authHeader =
        req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {

        return res.status(401).json({
            success: false,
            message: "Admin authentication required."
        });

    }

    const token =
        authHeader.split(" ")[1];

    const secret =
        process.env.JWT_SECRET ||
        "JKWI_CHANGE_THIS_SECRET";

    try {

        const decoded =
            jwt.verify(token, secret);

        req.admin = decoded;

        next();

    }
    catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired admin token."
        });

    }

};


// ==========================================
// CHECK SUPER ADMIN
// ==========================================

const isSuperAdmin = (admin) => {

    return (
        admin.role === "Super Admin" ||
        admin.role === "super_admin"
    );

};


// ==========================================
// CHECK NEWS MANAGER
// ==========================================

const isNewsManager = (admin) => {

    return (
        isSuperAdmin(admin) ||
        admin.role === "News Manager" ||
        admin.role === "news_manager"
    );

};


// ==========================================
// GET ALL NEWS
// PUBLIC
// ==========================================

router.get("/", (req, res) => {

    const sql = `
        SELECT
            n.*,
            a.username AS author_username
        FROM news n
        LEFT JOIN admins a
            ON n.author_id = a.id
        ORDER BY
            CASE
                WHEN n.status = 'published' THEN 0
                ELSE 1
            END,
            n.published_at DESC,
            n.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "News fetch error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Could not fetch news."
            });

        }

        res.json({
            success: true,
            news: results
        });

    });

});


// ==========================================
// GET PUBLISHED NEWS
// PUBLIC
// ==========================================

router.get("/published", (req, res) => {

    const sql = `
        SELECT
            n.*,
            a.username AS author_username
        FROM news n
        LEFT JOIN admins a
            ON n.author_id = a.id
        WHERE n.status = 'published'
        ORDER BY
            n.published_at DESC,
            n.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Published news error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Could not fetch published news."
            });

        }

        res.json({
            success: true,
            news: results
        });

    });

});


// ==========================================
// GET MY NEWS
// ADMIN
// ==========================================

router.get(
    "/my-news",
    authenticateAdmin,
    (req, res) => {

        const admin =
            req.admin;

        let sql;
        let params = [];


        if (isSuperAdmin(admin) || isNewsManager(admin)) {

            sql = `
                SELECT
                    n.*,
                    a.username AS author_username
                FROM news n
                LEFT JOIN admins a
                    ON n.author_id = a.id
                ORDER BY
                    n.created_at DESC
            `;

        }
        else {

            sql = `
                SELECT
                    n.*,
                    a.username AS author_username
                FROM news n
                LEFT JOIN admins a
                    ON n.author_id = a.id
                WHERE n.author_id = ?
                AND n.department = ?
                ORDER BY
                    n.created_at DESC
            `;

            params = [
                admin.id,
                admin.department
            ];

        }


        db.query(
            sql,
            params,
            (err, results) => {

                if (err) {

                    console.error(
                        "My news fetch error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not fetch your news."
                    });

                }


                res.json({
                    success: true,
                    news: results
                });

            }
        );

    }
);


// ==========================================
// GET NEWS FOR MY DEPARTMENT
// ADMIN
// ==========================================

router.get(
    "/department",
    authenticateAdmin,
    (req, res) => {

        const admin =
            req.admin;


        if (
            isSuperAdmin(admin) ||
            isNewsManager(admin)
        ) {

            const sql = `
                SELECT
                    n.*,
                    a.username AS author_username
                FROM news n
                LEFT JOIN admins a
                    ON n.author_id = a.id
                ORDER BY
                    n.created_at DESC
            `;

            return db.query(
                sql,
                (err, results) => {

                    if (err) {

                        return res.status(500).json({
                            success: false,
                            message:
                                "Could not fetch department news."
                        });

                    }

                    res.json({
                        success: true,
                        news: results
                    });

                }
            );

        }


        const sql = `
            SELECT
                n.*,
                a.username AS author_username
            FROM news n
            LEFT JOIN admins a
                ON n.author_id = a.id
            WHERE n.department = ?
            ORDER BY
                n.created_at DESC
        `;


        db.query(
            sql,
            [admin.department],
            (err, results) => {

                if (err) {

                    console.error(
                        "Department news error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not fetch department news."
                    });

                }


                res.json({
                    success: true,
                    department:
                        admin.department,
                    news: results
                });

            }
        );

    }
);


// ==========================================
// GET SINGLE NEWS ARTICLE
// PUBLIC
// ==========================================

router.get("/:id", (req, res) => {

    const { id } =
        req.params;


    if (!/^\d+$/.test(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid news ID."
        });

    }


    const sql = `
        SELECT
            n.*,
            a.username AS author_username
        FROM news n
        LEFT JOIN admins a
            ON n.author_id = a.id
        WHERE n.id = ?
        LIMIT 1
    `;


    db.query(
        sql,
        [id],
        (err, results) => {

            if (err) {

                console.error(
                    "Single news fetch error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Could not fetch news article."
                });

            }


            if (!results.length) {

                return res.status(404).json({
                    success: false,
                    message:
                        "News article not found."
                });

            }


            res.json({
                success: true,
                news: results[0]
            });

        }
    );

});


// ==========================================
// CREATE NEWS
// ADMIN
// ==========================================

router.post(
    "/",
    authenticateAdmin,
    upload.single("image"),
    (req, res) => {

        const admin =
            req.admin;


        const {
            title,
            category,
            summary,
            content
        } = req.body;


        if (
            !title ||
            !category ||
            !summary ||
            !content
        ) {

            if (req.file) {

                fs.unlink(
                    req.file.path,
                    () => {}
                );

            }

            return res.status(400).json({
                success: false,
                message:
                    "Title, category, summary and content are required."
            });

        }


        /*
        IMPORTANT:
        Department and author_id come from
        the authenticated admin.

        The frontend cannot choose another
        department.
        */


        const department =
            admin.department;


        if (
            !department &&
            !isSuperAdmin(admin)
        ) {

            if (req.file) {

                fs.unlink(
                    req.file.path,
                    () => {}
                );

            }

            return res.status(403).json({
                success: false,
                message:
                    "Your admin account has no news department assigned."
            });

        }


        let image = null;


        if (req.file) {

            image =
                `/uploads/news/${req.file.filename}`;

        }


        const sql = `
            INSERT INTO news
            (
                title,
                category,
                department,
                author_id,
                summary,
                content,
                image,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
        `;


        db.query(
            sql,
            [
                title,
                category,
                department || "General",
                admin.id,
                summary,
                content,
                image
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "News creation error:",
                        err
                    );


                    if (req.file) {

                        fs.unlink(
                            req.file.path,
                            () => {}
                        );

                    }


                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not create news."
                    });

                }


                res.status(201).json({

                    success: true,

                    message:
                        "News draft created successfully.",

                    id:
                        result.insertId,

                    department:
                        department,

                    author_id:
                        admin.id,

                    status:
                        "draft",

                    image:
                        image

                });

            }
        );

    }
);


// ==========================================
// SUBMIT NEWS FOR REVIEW
// ==========================================

router.put(
    "/:id/submit",
    authenticateAdmin,
    (req, res) => {

        const {
            id
        } = req.params;

        const admin =
            req.admin;


        const sql = `
            UPDATE news
            SET
                status = 'submitted',
                rejection_reason = NULL
            WHERE id = ?
            AND author_id = ?
            AND department = ?
            AND status IN ('draft', 'rejected')
        `;


        db.query(
            sql,
            [
                id,
                admin.id,
                admin.department
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "News submission error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not submit news."
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(403).json({
                        success: false,
                        message:
                            "You cannot submit this article."
                    });

                }


                res.json({
                    success: true,
                    message:
                        "News submitted for review."
                });

            }
        );

    }
);


// ==========================================
// REVIEW QUEUE
// NEWS MANAGER / SUPER ADMIN
// ==========================================

router.get(
    "/review/pending",
    authenticateAdmin,
    (req, res) => {

        const admin =
            req.admin;


        if (!isNewsManager(admin)) {

            return res.status(403).json({
                success: false,
                message:
                    "News Manager access required."
            });

        }


        const sql = `
            SELECT
                n.*,
                a.username AS author_username
            FROM news n
            LEFT JOIN admins a
                ON n.author_id = a.id
            WHERE n.status = 'submitted'
            ORDER BY
                n.created_at ASC
        `;


        db.query(
            sql,
            (err, results) => {

                if (err) {

                    console.error(
                        "Review queue error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not load review queue."
                    });

                }


                res.json({
                    success: true,
                    news: results
                });

            }
        );

    }
);


// ==========================================
// APPROVE NEWS
// NEWS MANAGER / SUPER ADMIN
// ==========================================

router.put(
    "/:id/approve",
    authenticateAdmin,
    (req, res) => {

        const admin =
            req.admin;


        if (!isNewsManager(admin)) {

            return res.status(403).json({
                success: false,
                message:
                    "News Manager access required."
            });

        }


        const sql = `
            UPDATE news
            SET
                status = 'approved',
                rejection_reason = NULL
            WHERE id = ?
            AND status = 'submitted'
        `;


        db.query(
            sql,
            [req.params.id],
            (err, result) => {

                if (err) {

                    console.error(
                        "News approval error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not approve news."
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Submitted article not found."
                    });

                }


                res.json({
                    success: true,
                    message:
                        "News approved successfully."
                });

            }
        );

    }
);


// ==========================================
// REJECT NEWS
// NEWS MANAGER / SUPER ADMIN
// ==========================================

router.put(
    "/:id/reject",
    authenticateAdmin,
    (req, res) => {

        const admin =
            req.admin;


        if (!isNewsManager(admin)) {

            return res.status(403).json({
                success: false,
                message:
                    "News Manager access required."
            });

        }


        const {
            reason
        } = req.body;


        const sql = `
            UPDATE news
            SET
                status = 'rejected',
                rejection_reason = ?
            WHERE id = ?
            AND status = 'submitted'
        `;


        db.query(
            sql,
            [
                reason || "Article requires changes.",
                req.params.id
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "News rejection error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not reject news."
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Submitted article not found."
                    });

                }


                res.json({
                    success: true,
                    message:
                        "News sent back to author."
                });

            }
        );

    }
);


// ==========================================
// PUBLISH NEWS
// NEWS MANAGER / SUPER ADMIN
// ==========================================

router.put(
    "/:id/publish",
    authenticateAdmin,
    (req, res) => {

        const admin =
            req.admin;


        if (!isNewsManager(admin)) {

            return res.status(403).json({
                success: false,
                message:
                    "News Manager access required."
            });

        }


        const sql = `
            UPDATE news
            SET
                status = 'published',
                published_at = NOW(),
                rejection_reason = NULL
            WHERE id = ?
            AND status IN ('approved', 'submitted')
        `;


        db.query(
            sql,
            [req.params.id],
            (err, result) => {

                if (err) {

                    console.error(
                        "News publishing error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not publish news."
                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Approved/submitted article not found."
                    });

                }


                res.json({
                    success: true,
                    message:
                        "News published successfully."
                });

            }
        );

    }
);


// ==========================================
// DELETE NEWS
// ADMIN / NEWS MANAGER / SUPER ADMIN
// ==========================================

router.delete(
    "/:id",
    authenticateAdmin,
    (req, res) => {

        const admin =
            req.admin;


        const id =
            req.params.id;


        const findSql = `
            SELECT
                image,
                author_id,
                department
            FROM news
            WHERE id = ?
            LIMIT 1
        `;


        db.query(
            findSql,
            [id],
            (findErr, results) => {

                if (findErr) {

                    console.error(
                        "News lookup error:",
                        findErr
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Could not find news."
                    });

                }


                if (!results.length) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "News article not found."
                    });

                }


                const article =
                    results[0];


                const canDelete =
                    isSuperAdmin(admin) ||
                    isNewsManager(admin) ||
                    (
                        article.author_id === admin.id &&
                        article.department === admin.department
                    );


                if (!canDelete) {

                    return res.status(403).json({
                        success: false,
                        message:
                            "You cannot delete this article."
                    });

                }


                db.query(
                    "DELETE FROM news WHERE id = ?",
                    [id],
                    (err) => {

                        if (err) {

                            console.error(
                                "News delete error:",
                                err
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Could not delete news."
                            });

                        }


                        const image =
                            article.image;


                        if (
                            image &&
                            image.startsWith(
                                "/uploads/news/"
                            )
                        ) {

                            const imagePath =
                                path.join(
                                    __dirname,
                                    "../..",
                                    image
                                );

                            fs.unlink(
                                imagePath,
                                () => {}
                            );

                        }


                        res.json({
                            success: true,
                            message:
                                "News deleted successfully."
                        });

                    }
                );

            }
        );

    }
);


// ==========================================
// UPLOAD ERROR HANDLER
// ==========================================

router.use(
    (err, req, res, next) => {

        if (
            err instanceof multer.MulterError
        ) {

            return res.status(400).json({
                success: false,
                message: err.message
            });

        }


        if (err) {

            console.error(
                "Upload error:",
                err
            );

            return res.status(400).json({
                success: false,
                message:
                    err.message ||
                    "Image upload failed."
            });

        }


        next();

    }
);


module.exports = router;