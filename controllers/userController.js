const bcrypt = require("bcryptjs");
const db = require("../config/database");


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
                            phone,
                            password,
                            account_type,
                            status
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `,
                        [

                            jkwiId,

                            firstName.trim(),

                            lastName.trim(),

                            normalizedEmail,

                            phone.trim(),

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


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                "Registration successful. Continue to verification.",

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
                    status

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