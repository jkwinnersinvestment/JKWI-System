const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/database");


// ==========================================
// REGISTER
// ==========================================

exports.register = (req, res) => {

    res.status(501).json({
        success: false,
        message: "Admin registration is disabled."
    });

};


// ==========================================
// JKWI LOGIN
// ==========================================

exports.login = (req, res) => {

    const { username, password } = req.body;


    // ==========================================
    // CHECK LOGIN FIELDS
    // ==========================================

    if (!username || !password) {

        return res.status(400).json({
            success: false,
            message: "Username and password are required."
        });

    }


    // ==========================================
    // FIND ACCOUNT
    // ==========================================

    const sql = `
        SELECT
            id,
            username,
            password,
            role,
            department,
            permissions
        FROM admins
        WHERE username = ?
        LIMIT 1
    `;


    db.query(
        sql,
        [username],
        async (err, results) => {

            // ==========================================
            // DATABASE ERROR
            // ==========================================

            if (err) {

                console.error(
                    "JKWI login database error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Server error."
                });

            }


            // ==========================================
            // ACCOUNT NOT FOUND
            // ==========================================

            if (!results || results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid username or password."
                });

            }


            const account = results[0];


            try {

                // ==========================================
                // CHECK PASSWORD
                // ==========================================

                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        account.password
                    );


                if (!passwordMatch) {

                    return res.status(401).json({
                        success: false,
                        message: "Invalid username or password."
                    });

                }


                // ==========================================
                // JWT SECRET
                // ==========================================

                const secret =
                    process.env.JWT_SECRET ||
                    "JKWI_CHANGE_THIS_SECRET";


                // ==========================================
                // CREATE JWT TOKEN
                // ==========================================

                const token =
                    jwt.sign(
                        {
                            id: account.id,
                            username: account.username,
                            role: account.role,
                            department: account.department,
                            permissions: account.permissions
                        },

                        secret,

                        {
                            expiresIn: "8h"
                        }
                    );


                // ==========================================
                // DETERMINE USER DESTINATION
                // ==========================================

                let redirect;


                switch (account.role) {


                    // ======================================
                    // SUPER ADMIN
                    // ======================================

                    case "Super Admin":
                    case "super_admin":
                    case "admin":

                        redirect =
                            "/admin/dashboard.html";

                        break;


                    // ======================================
                    // NEWS MANAGER
                    // ======================================

                    case "News Manager":
                    case "news_manager":

                        redirect =
                            "/admin/news-manager/dashboard.html";

                        break;


                   // ======================================
                   // NEWS REPORTER
                   // ======================================

                   case "News Reporter":
                   case "news_reporter":

                   redirect =
                        "/admin/news/reporter-dashboard.html";

                    break;;


                    // ======================================
                    // MARKET MANAGER
                    // ======================================

                    case "Market Manager":
                    case "market_manager":

                        redirect =
                            "/admin/markets/dashboard.html";

                        break;


                    // ======================================
                    // STORE ADMIN
                    // ======================================

                    case "Store Admin":
                    case "store_admin":

                        redirect =
                            "/admin/store/products.html";

                        break;


                    // ======================================
                    // CUSTOMER
                    // ======================================

                    case "Customer":
                    case "customer":

                        redirect =
                            "/customer/dashboard.html";

                        break;


                    // ======================================
                    // UNKNOWN ROLE
                    // ======================================

                    default:

                        console.warn(
                            "Unknown JKWI role:",
                            account.role
                        );

                        return res.status(403).json({

                            success: false,

                            message:
                                "Your account does not have a valid JKWI role."

                        });

                }


                // ==========================================
                // LOGIN SUCCESS
                // ==========================================

                return res.json({

                    success: true,

                    message:
                        "JKWI login successful.",

                    token: token,

                    user: {

                        id:
                            account.id,

                        username:
                            account.username,

                        role:
                            account.role,

                        department:
                            account.department,

                        permissions:
                            account.permissions

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

                    success: false,

                    message:
                        "Login failed."

                });

            }

        }
    );

};