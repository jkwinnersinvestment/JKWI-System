const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
// ==========================================
// JWT SECRET
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.warn("WARNING: JWT_SECRET is not configured.");
}
// ==========================================
// REGISTER
// ==========================================
// Customer / Worker / Partner registration
// remains handled by the existing user system.
exports.register = (req, res) => {
    return res.status(501).json({
        success: false,
        message: "Registration is handled by the user registration system."
    });
};
// ==========================================
// LOGIN
// ==========================================
// One Winners ID login system.
//
// 1. Check normal users table
// 2. If not found, check admins table
//
// This allows:
// Customer / Worker / Partner
// AND
// Super Admin / News Manager / other admins
//
// to use the same Winners ID login page.
// ==========================================
exports.login = async (req, res) => {
    try {
        const { winnersId, password } = req.body;
        // ------------------------------------------
        // BASIC VALIDATION
        // ------------------------------------------
        if (!winnersId || !password) {
            return res.status(400).json({
                success: false,
                message: "Winners ID and password are required."
            });
        }
        const normalizedId = String(winnersId).trim();
        if (!/^\d{10}$/.test(normalizedId)) {
            return res.status(400).json({
                success: false,
                message: "Winners ID must contain exactly 10 digits."
            });
        }
        // ==========================================
        // 1. CHECK NORMAL USERS
        // ==========================================
        const userSql = `
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
        `;
        const [users] = await db.promise().query(
            userSql,
            [normalizedId]
        );
        // ==========================================
        // NORMAL USER FOUND
        // ==========================================
        if (users.length > 0) {
            const user = users[0];
            // --------------------------------------
            // ACCOUNT STATUS
            // --------------------------------------
            if (
                user.status === "suspended" ||
                user.status === "deactivated"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Your account is suspended or deactivated."
                });
            }
            // --------------------------------------
            // EMAIL VERIFICATION
            // --------------------------------------
            if (!user.email_verified) {
                return res.status(403).json({
                    success: false,
                    message: "Please verify your email before logging in."
                });
            }
            // --------------------------------------
            // PASSWORD
            // --------------------------------------
            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );
            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Winners ID or password."
                });
            }
            // --------------------------------------
            // JWT
            // --------------------------------------
            const token = jwt.sign(
                {
                    id: user.id,
                    jkwiId: user.jkwi_id,
                    email: user.email,
                    accountType: user.account_type,
                    userType: "user"
                },
                JWT_SECRET,
                {
                    expiresIn: "8h"
                }
            );
            // --------------------------------------
            // REDIRECT
            // --------------------------------------
            let redirect = "/";
            if (user.account_type === "customer") {
                redirect = "/customer/dashboard.html";
            }
            else if (user.account_type === "worker") {
                redirect = "/worker/dashboard.html";
            }
            else if (user.account_type === "partner") {
                redirect = "/partner/dashboard.html";
            }
            else {
                return res.status(403).json({
                    success: false,
                    message: "Unknown account type."
                });
            }
            // --------------------------------------
            // RESPONSE
            // --------------------------------------
            return res.json({
                success: true,
                message: "JKWI login successful.",
                token,
                user: {
                    id: user.id,
                    winnersId: user.jkwi_id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    accountType: user.account_type,
                    status: user.status,
                    emailVerified: user.email_verified,
                    userType: "user"
                },
                redirect
            });
        }
        // ==========================================
        // 2. CHECK ADMINS
        // ==========================================
        const adminSql = `
            SELECT
                id,
                winners_id,
                username,
                password,
                role,
                department,
                permissions
            FROM admins
            WHERE winners_id = ?
            LIMIT 1
        `;
        const [admins] = await db.promise().query(
            adminSql,
            [normalizedId]
        );
        // ==========================================
        // ADMIN NOT FOUND
        // ==========================================
        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid Winners ID or password."
            });
        }
        const admin = admins[0];
        // ==========================================
        // ADMIN PASSWORD
        // ==========================================
        const adminPasswordMatch = await bcrypt.compare(
            password,
            admin.password
        );
        if (!adminPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Winners ID or password."
            });
        }
        // ==========================================
        // ADMIN PERMISSIONS
        // ==========================================
        let permissions = {};
        if (admin.permissions) {
            if (typeof admin.permissions === "object") {
                permissions = admin.permissions;
            }
            else {
                try {
                    permissions = JSON.parse(admin.permissions);
                } catch (error) {
                    permissions = {};
                }
            }
        }
        // ==========================================
        // ADMIN JWT
        // ==========================================
        const adminToken = jwt.sign(
            {
                id: admin.id,
                winnersId: admin.winners_id,
                username: admin.username,
                role: admin.role,
                department: admin.department,
                permissions,
                userType: "admin"
            },
            JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );
        // ==========================================
        // ADMIN REDIRECT
        // ==========================================
        let adminRedirect = "/dashboard.html";
        const normalizedRole = String(
            admin.role || ""
        ).toLowerCase().replace(/_/g, " ");
        if (normalizedRole === "news manager") {
            // Existing News Manager page
            // We can build the dedicated dashboard
            // later without changing authentication.
            adminRedirect = "/admin/news-manager/review-queue.html";
        }
        // ==========================================
        // ADMIN RESPONSE
        // ==========================================
        return res.json({
            success: true,
            message: "JKWI admin login successful.",
            token: adminToken,
            user: {
                id: admin.id,
                winnersId: admin.winners_id,
                username: admin.username,
                role: admin.role,
                department: admin.department,
                permissions,
                userType: "admin"
            },
            redirect: adminRedirect
        });
    }
    catch (error) {
        console.error(
            "Login error:",
            error
        );
        return res.status(500).json({
            success: false,
            message: "Server error during login."
        });
    }
};