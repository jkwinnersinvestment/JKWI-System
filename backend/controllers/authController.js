const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/database");


// ==========================================
// REGISTER
// ==========================================

exports.register = (req, res) => {

    return res.status(501).json({

        success: false,

        message:
            "Registration is handled by the user registration system."

    });

};


// ==========================================
// JKWI LOGIN
// ==========================================
// Login:
// Winners ID + Password
//
// Example:
// Winners ID: 0000006011
// Password: ********
// ==========================================

exports.login = async (req, res) => {

    const {
        winnersId,
        password
    } = req.body;


    // ==========================================
    // CHECK LOGIN FIELDS
    // ==========================================

    if (!winnersId || !password) {

        return res.status(400).json({

            success: false,

            message:
                "Winners ID and password are required."

        });

    }


    // ==========================================
    // NORMALIZE WINNERS ID
    // ==========================================

    const normalizedId =
        String(winnersId).trim();


    // ==========================================
    // CHECK 10-DIGIT FORMAT
    // ==========================================

    if (!/^\d{10}$/.test(normalizedId)) {

        return res.status(400).json({

            success: false,

            message:
                "Winners ID must be exactly 10 digits."

        });

    }


    try {

        // ==========================================
        // FIND ACCOUNT
        // ==========================================

        const users =
            await new Promise(
                (resolve, reject) => {

                    db.query(

                        `
                        SELECT
                            id,
                            jkwi_id,
                            first_name,
                            last_name,
                            email,
                            password,
                            account_type,
                            status,
                            email_verified
                        FROM users
                        WHERE jkwi_id = ?
                        LIMIT 1
                        `,

                        [
                            normalizedId
                        ],

                        (err, results) => {

                            if (err) {

                                reject(err);

                            } else {

                                resolve(results);

                            }

                        }

                    );

                }
            );


        // ==========================================
        // ACCOUNT NOT FOUND
        // ==========================================

        if (
            !users ||
            users.length === 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid Winners ID or password."

            });

        }


        const user =
            users[0];


        // ==========================================
        // CHECK ACCOUNT STATUS
        // ==========================================

        if (
            user.status === "suspended"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Your account has been suspended."

            });

        }


        if (
            user.status === "deactivated"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Your account has been deactivated."

            });

        }


        // ==========================================
        // EMAIL VERIFICATION
        // ==========================================

        if (
            !user.email_verified
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Please verify your email before logging in."

            });

        }


        // ==========================================
        // CHECK PASSWORD
        // ==========================================

        const passwordMatch =
            await bcrypt.compare(

                password,

                user.password

            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid Winners ID or password."

            });

        }


        // ==========================================
        // JWT SECRET
        // ==========================================

        const secret =
            process.env.JWT_SECRET;


        if (!secret) {

            console.error(
                "JWT_SECRET is missing from .env"
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server configuration error."

            });

        }


        // ==========================================
        // CREATE JWT TOKEN
        // ==========================================

        const token =
            jwt.sign(

                {

                    id:
                        user.id,

                    jkwiId:
                        user.jkwi_id,

                    email:
                        user.email,

                    accountType:
                        user.account_type

                },

                secret,

                {

                    expiresIn:
                        "8h"

                }

            );


        // ==========================================
        // DETERMINE DESTINATION
        // ==========================================

        let redirect;


        switch (
            user.account_type
        ) {


            // ======================================
            // CUSTOMER
            // ======================================

            case "customer":

                redirect =
                    "/customer/dashboard.html";

                break;


            // ======================================
            // WORKER
            // ======================================

            case "worker":

                redirect =
                    "/worker/dashboard.html";

                break;


            // ======================================
            // PARTNER
            // ======================================

            case "partner":

                redirect =
                    "/partner/dashboard.html";

                break;


            // ======================================
            // UNKNOWN ACCOUNT TYPE
            // ======================================

            default:

                return res.status(403).json({

                    success: false,

                    message:
                        "Your account type is not supported."

                });

        }


        // ==========================================
        // LOGIN SUCCESS
        // ==========================================

        return res.json({

            success:
                true,

            message:
                "JKWI login successful.",

            token:
                token,

            user: {

                id:
                    user.id,

                winnersId:
                    user.jkwi_id,

                firstName:
                    user.first_name,

                lastName:
                    user.last_name,

                email:
                    user.email,

                accountType:
                    user.account_type,

                status:
                    user.status,

                emailVerified:
                    user.email_verified

            },

            redirect:
                redirect

        });

    }


    // ==========================================
    // LOGIN ERROR
    // ==========================================

    catch (error) {

        console.error(
            "JKWI login error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                "Login failed."

        });

    }

};