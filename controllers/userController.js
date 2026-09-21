const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../config/database");
const { sendEmail } = require("../services/emailService");
const { idVerificationService } = require("../services/idVerificationService");

function generateVerificationCode() {
    return crypto.randomInt(100000, 1000000).toString();
}

async function saveVerificationCode(userId, email) {
    const code = generateVerificationCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.promise().query(
        "DELETE FROM email_verifications WHERE user_id = ?",
        [userId]
    );
    await db.promise().query(
        `INSERT INTO email_verifications (user_id, code_hash, expires_at)
         VALUES (?, ?, ?)`,
        [userId, codeHash, expiresAt]
    );

    await sendEmail({
        to: email,
        subject: "JK - Verify Your Email",
        text: `Your JK verification code is: ${code}. Valid for 10 minutes.`,
        html: `<p>Your JK verification code is: <strong>${code}</strong>.</p><p>Valid for 10 minutes.</p>`
    });
}

// ==========================================
// JKWI POSITION CODES
// ==========================================

const POSITION_CODES = {

    customer: "011",
    worker: "010",
    partner: "012"

};


// ==========================================
// GENERATE 10-DIGIT JKWI ID
// ==========================================

async function generateJKWIId(accountType) {

    const positionCode =
        POSITION_CODES[accountType];

    if (!positionCode) {

        throw new Error(
            "Invalid account type."
        );

    }


    const result = await new Promise(
        (resolve, reject) => {

            db.query(
                `
                SELECT COUNT(*) AS total
                FROM users
                `,
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


    const nextNumber =
        Number(result[0].total) + 1;


    if (nextNumber > 9999999) {

        throw new Error(
            "JKWI member number limit reached."
        );

    }


    const memberNumber =
        String(nextNumber).padStart(7, "0");


    return memberNumber + positionCode;

}


// ==========================================
// REGISTER USER
// ==========================================

exports.register = async (req, res) => {

    const {
        firstName,
        lastName,
        email,
        phone,
        idNumber,
        addressLine1,
        addressLine2,
        city,
        province,
        postalCode,
        password,
        confirmPassword,
        accountType
    } = req.body;


    // ==========================================
    // REQUIRED FIELDS
    // ==========================================

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !idNumber ||
        !addressLine1 ||
        !city ||
        !province ||
        !postalCode ||
        !password ||
        !confirmPassword ||
        !accountType
    ) {

        return res.status(400).json({

            success: false,

            message:
                "All registration fields are required."

        });

    }


    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address."
        });
    }

    if (!/^(?:0|\+27)[678]\d{8}$/.test(phone.replace(/[\s-]/g, ""))) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid South African phone number."
        });
    }

    if (!/^\d{13}$/.test(idNumber)) {
        return res.status(400).json({
            success: false,
            message: "ID Number must contain exactly 13 digits."
        });
    }

    if (!/^\d{4}$/.test(postalCode)) {
        return res.status(400).json({
            success: false,
            message: "Postal Code must contain exactly 4 digits."
        });
    }

    let providerResult;
    try {
        providerResult = await idVerificationService.Verify(idNumber);
    } catch (error) {
        console.error("SA ID verification service error:", error);
        providerResult = { valid: false, unavailable: true };
    }

    if (!providerResult.valid) {
        return res.status(422).json({
            success: false,
            message: providerResult.unavailable
                ? providerResult.message || "Home Affairs verification service is unavailable. Please try again."
                : "ID number not found on Home Affairs database"
        });
    }

    // ==========================================
    // ACCOUNT TYPE
    // ==========================================

    const allowedTypes = [
        "customer",
        "worker",
        "partner"
    ];

    if (!allowedTypes.includes(accountType)) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid account type."

        });

    }


    // ==========================================
    // PASSWORD
    // ==========================================

    if (password !== confirmPassword) {

        return res.status(400).json({

            success: false,

            message:
                "Passwords do not match."

        });

    }


    if (password.length < 8) {

        return res.status(400).json({

            success: false,

            message:
                "Password must be at least 8 characters."

        });

    }


    const normalizedEmail =
        email.trim().toLowerCase();


    try {

        // ==========================================
        // CHECK EMAIL
        // ==========================================

        const existing =
            await new Promise(
                (resolve, reject) => {

                    db.query(
                        `
                        SELECT id
                        FROM users
                        WHERE email = ?
                        LIMIT 1
                        `,
                        [normalizedEmail],
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


        if (existing.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "An account with this email already exists."

            });

        }


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        // ==========================================
        // GENERATE JKWI ID
        // ==========================================

        const jkwiId =
            await generateJKWIId(
                accountType
            );


        // ==========================================
        // INITIAL STATUS
        // ==========================================

        let status =
            "pending_verification";


        // ==========================================
        // CREATE USER
        // ==========================================

        const result =
            await new Promise(
                (resolve, reject) => {

                    db.query(
                        `
                        INSERT INTO users
                        (
                            jkwi_id,
                            first_name,
                            last_name,
                            email,
                            id_number,
                            phone,
                            address_line_1,
                            address_line_2,
                            city,
                            province,
                            postal_code,
                            password,
                            account_type,
                            status
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `,
                        [

                            jkwiId,

                            firstName.trim(),

                            lastName.trim(),

                            normalizedEmail,

                            idNumber,

                            phone.trim(),

                            addressLine1.trim(),

                            addressLine2.trim(),

                            city.trim(),

                            province.trim(),

                            postalCode.trim(),

                            hashedPassword,

                            accountType,

                            status

                        ],
                        (err, result) => {

                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }

                        }
                    );

                }
            );

            await saveVerificationCode(
                result.insertId,
                normalizedEmail
            );


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                "Account created. Verification code sent.",

            user: {

                id: result.insertId,

                jkwiId: jkwiId,

                firstName:
                    firstName.trim(),

                lastName:
                    lastName.trim(),

                email:
                    normalizedEmail,

                accountType:
                    accountType,

                status:
                    status,

                emailVerified: false

            }

        });

    }

    catch (error) {

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to create your account."

        });

    }

};

exports.savedAddresses = async (req, res) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
        return res.json({ addresses: [] });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "JKWI_CHANGE_THIS_SECRET");
        const [rows] = await db.promise().query(
            `SELECT address_line_1 AS addressLine1,
                    address_line_2 AS addressLine2,
                    city, province, postal_code AS postalCode
             FROM users WHERE id = ? AND address_line_1 IS NOT NULL`,
            [decoded.id]
        );
        return res.json({
            addresses: rows.map(address => ({
                ...address,
                label: address.addressLine1
            }))
        });
    } catch (error) {
        return res.json({ addresses: [] });
    }
};

exports.verifyId = async (req, res) => {
    const idNumber = String(req.body.idNumber || "").trim();
    try {
        const providerResult = await idVerificationService.Verify(idNumber);
        const valid = providerResult.valid;
        return res.status(valid ? 200 : providerResult.unavailable ? 503 : 422).json({
            valid,
            details: providerResult.details,
            fallback: providerResult.unavailable,
            message: valid
                ? "ID verified."
                : providerResult.unavailable
                    ? providerResult.message || "Home Affairs verification service is unavailable. Please try again."
                    : "ID number not found on Home Affairs database"
        });
    } catch (error) {
        console.error("SA ID verification error:", error);
        return res.status(503).json({
            valid: false,
            message: "ID verification service unavailable."
        });
    }
};

exports.verifyEmail = async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();

    if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) {
        return res.status(400).json({
            success: false,
            message: "Email and a 6-digit code are required."
        });
    }

    try {
        const [users] = await db.promise().query(
            "SELECT id, email_verified FROM users WHERE email = ? LIMIT 1",
            [email]
        );
        if (!users.length) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        const [codes] = await db.promise().query(
            `SELECT id, code_hash, expires_at FROM email_verifications
             WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
            [users[0].id]
        );
        const record = codes[0];
        const valid = record && new Date(record.expires_at) > new Date() &&
            await bcrypt.compare(code, record.code_hash);

        if (!valid) {
            return res.status(422).json({ success: false, message: "Invalid or expired code" });
        }

        await db.promise().query(
            "UPDATE users SET email_verified = TRUE, status = 'active' WHERE id = ?",
            [users[0].id]
        );
        await db.promise().query("DELETE FROM email_verifications WHERE user_id = ?", [users[0].id]);

        return res.json({ success: true, message: "Email verified successfully." });
    } catch (error) {
        console.error("Email verification error:", error);
        return res.status(503).json({ success: false, message: "Email verification is temporarily unavailable." });
    }
};

exports.resendVerificationCode = async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ success: false, message: "A valid email address is required." });
    }

    try {
        const [users] = await db.promise().query(
            "SELECT id, email_verified FROM users WHERE email = ? LIMIT 1",
            [email]
        );
        if (!users.length) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }
        if (users[0].email_verified) {
            return res.status(400).json({ success: false, message: "This email is already verified." });
        }

        await saveVerificationCode(users[0].id, email);
        return res.json({ success: true, message: "A new verification code was sent." });
    } catch (error) {
        console.error("Resend verification error:", error);
        return res.status(503).json({ success: false, message: "Unable to resend verification code." });
    }
};

exports.login = async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    try {
        const [users] = await db.promise().query(
            `SELECT id, jkwi_id, first_name, last_name, email, password,
                    account_type, status, email_verified
             FROM users WHERE email = ? LIMIT 1`,
            [email]
        );

        if (!users.length || !(await bcrypt.compare(password, users[0].password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];
        if (user.status === "suspended" || user.status === "deactivated") {
            return res.status(403).json({
                success: false,
                message: "Your account is not available."
            });
        }

        if (!user.email_verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in.",
                redirect: `/VerifyEmail?email=${encodeURIComponent(user.email)}`
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, accountType: user.account_type },
            process.env.JWT_SECRET || "JKWI_CHANGE_THIS_SECRET",
            { expiresIn: "8h" }
        );

        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                accountType: user.account_type,
                status: user.status
            },
            redirect: "/customer/dashboard.html"
        });
    } catch (error) {
        console.error("User login error:", error);
        return res.status(503).json({
            success: false,
            message: "Login is temporarily unavailable because the database is offline."
        });
    }
};