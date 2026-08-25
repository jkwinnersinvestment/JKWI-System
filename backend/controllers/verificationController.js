const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const db = require("../config/database");

const {
    sendEmail
} = require("../services/emailService");


// ==========================================
// GENERATE 6-DIGIT VERIFICATION CODE
// ==========================================

function generateCode() {

    return crypto
        .randomInt(100000, 1000000)
        .toString();

}


// ==========================================
// SEND VERIFICATION CODE
// ==========================================

exports.sendCode = async (req, res) => {

    const { email } = req.body;


    if (!email) {

        return res.status(400).json({

            success: false,

            message:
                "Email address is required."

        });

    }


    const normalizedEmail =
        email.trim().toLowerCase();


    try {

        // ==========================================
        // FIND USER
        // ==========================================

        const users =
            await new Promise(
                (resolve, reject) => {

                    db.query(
                        `
                        SELECT
                            id,
                            email,
                            email_verified,
                            status
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


        if (!users.length) {

            return res.status(404).json({

                success: false,

                message:
                    "Account not found."

            });

        }


        const user =
            users[0];


        // ==========================================
        // ALREADY VERIFIED
        // ==========================================

        if (user.email_verified) {

            return res.status(400).json({

                success: false,

                message:
                    "This account is already verified."

            });

        }


        // ==========================================
        // GENERATE CODE
        // ==========================================

        const code =
            generateCode();


        // ==========================================
        // HASH CODE
        // ==========================================

        const codeHash =
            await bcrypt.hash(
                code,
                10
            );


        // ==========================================
        // CODE EXPIRATION
        // 10 MINUTES
        // ==========================================

        const expiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        // ==========================================
        // DELETE OLD CODES
        // ==========================================

        await new Promise(
            (resolve, reject) => {

                db.query(
                    `
                    DELETE FROM email_verifications
                    WHERE user_id = ?
                    `,

                    [user.id],

                    (err) => {

                        if (err) {

                            reject(err);

                        } else {

                            resolve();

                        }

                    }
                );

            }
        );


        // ==========================================
        // SAVE NEW CODE
        // ==========================================

        await new Promise(
            (resolve, reject) => {

                db.query(
                    `
                    INSERT INTO email_verifications
                    (
                        user_id,
                        code_hash,
                        expires_at
                    )
                    VALUES (?, ?, ?)
                    `,

                    [
                        user.id,
                        codeHash,
                        expiresAt
                    ],

                    (err) => {

                        if (err) {

                            reject(err);

                        } else {

                            resolve();

                        }

                    }
                );

            }
        );


        // ==========================================
        // EMAIL CONTENT
        // ==========================================

        const subject =
            "Verify Your JK Winners Investment Account";


        const text = `

Welcome to JK Winners Investment.

Your verification code is:

${code}

This code will expire in 10 minutes.

If you did not create a JKWI account, you can safely ignore this email.

JK Winners Investment

`;


        const html = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>
Verify Your JKWI Account
</title>

</head>


<body style="
    margin:0;
    padding:0;
    background:#f4f7fa;
    font-family:Arial,Helvetica,sans-serif;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding:40px 15px;"
>

<tr>

<td align="center">


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        max-width:600px;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 20px rgba(0,0,0,0.08);
    "
>


<tr>

<td
    style="
        background:#009EF3;
        padding:28px;
        text-align:center;
        color:#ffffff;
    "
>

<h1
    style="
        margin:0;
        font-size:24px;
    "
>

JK WINNERS INVESTMENT

</h1>

</td>

</tr>


<tr>

<td
    style="
        padding:35px 30px;
        color:#1f2933;
    "
>

<h2
    style="
        margin-top:0;
        font-size:22px;
    "
>

Verify Your Account

</h2>


<p
    style="
        font-size:16px;
        line-height:1.6;
    "
>

Welcome to
<strong>
JK Winners Investment.
</strong>

</p>


<p
    style="
        font-size:16px;
        line-height:1.6;
    "
>

Use the verification code below
to verify your email address:

</p>


<div
    style="
        margin:30px 0;
        padding:22px;
        background:#f0f8ff;
        border:1px solid #009EF3;
        border-radius:10px;
        text-align:center;
    "
>

<div
    style="
        font-size:32px;
        font-weight:bold;
        letter-spacing:8px;
        color:#009EF3;
    "
>

${code}

</div>

</div>


<p
    style="
        font-size:14px;
        color:#667085;
        line-height:1.6;
    "
>

This verification code expires
in <strong>10 minutes</strong>.

</p>


<p
    style="
        font-size:14px;
        color:#667085;
        line-height:1.6;
    "
>

If you did not create a JKWI account,
you can safely ignore this email.

</p>


<p
    style="
        margin-top:30px;
        font-size:15px;
    "
>

Regards,<br>

<strong>
JK Winners Investment
</strong>

</p>

</td>

</tr>


<tr>

<td
    style="
        background:#f7f9fc;
        padding:20px;
        text-align:center;
        color:#98a2b3;
        font-size:12px;
    "
>

© ${new Date().getFullYear()}
JK Winners Investment.
All rights reserved.

</td>

</tr>


</table>

</td>

</tr>

</table>

</body>

</html>

`;


        // ==========================================
        // SEND EMAIL
        // ==========================================

        await sendEmail({

            to:
                normalizedEmail,

            subject,

            text,

            html

        });


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.json({

            success: true,

            message:
                "Verification code sent to your email."

        });

    }


    catch (error) {

        console.error(
            "Send verification error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to send verification email."

        });

    }

};


// ==========================================
// VERIFY CODE
// ==========================================

exports.verifyCode = async (req, res) => {

    const {
        email,
        code
    } = req.body;


    if (!email || !code) {

        return res.status(400).json({

            success: false,

            message:
                "Email and verification code are required."

        });

    }


    const normalizedEmail =
        email.trim().toLowerCase();


    try {

        // ==========================================
        // FIND USER
        // ==========================================

        const users =
            await new Promise(
                (resolve, reject) => {

                    db.query(
                        `
                        SELECT
                            id,
                            first_name,
                            last_name,
                            email,
                            jkwi_id,
                            account_type,
                            email_verified,
                            status
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


        if (!users.length) {

            return res.status(404).json({

                success: false,

                message:
                    "Account not found."

            });

        }


        const user =
            users[0];


        // ==========================================
        // ALREADY VERIFIED
        // ==========================================

        if (user.email_verified) {

            return res.status(400).json({

                success: false,

                message:
                    "Account is already verified."

            });

        }


        // ==========================================
        // GET ACTIVE CODE
        // ==========================================

        const records =
            await new Promise(
                (resolve, reject) => {

                    db.query(
                        `
                        SELECT
                            id,
                            code_hash,
                            expires_at,
                            attempts,
                            verified
                        FROM email_verifications
                        WHERE user_id = ?
                        AND verified = FALSE
                        ORDER BY id DESC
                        LIMIT 1
                        `,

                        [user.id],

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


        if (!records.length) {

            return res.status(400).json({

                success: false,

                message:
                    "No active verification code. Request a new code."

            });

        }


        const verification =
            records[0];


        // ==========================================
        // CHECK EXPIRATION
        // ==========================================

        if (
            new Date(
                verification.expires_at
            ).getTime()
            <
            Date.now()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Verification code has expired."

            });

        }


        // ==========================================
        // MAX ATTEMPTS
        // ==========================================

        if (
            verification.attempts >= 5
        ) {

            return res.status(429).json({

                success: false,

                message:
                    "Too many incorrect attempts. Request a new code."

            });

        }


        // ==========================================
        // COMPARE CODE
        // ==========================================

        const validCode =
            await bcrypt.compare(
                String(code),
                verification.code_hash
            );


        if (!validCode) {

            await new Promise(
                (resolve, reject) => {

                    db.query(
                        `
                        UPDATE email_verifications
                        SET attempts = attempts + 1
                        WHERE id = ?
                        `,

                        [verification.id],

                        (err) => {

                            if (err) {

                                reject(err);

                            } else {

                                resolve();

                            }

                        }
                    );

                }
            );


            return res.status(400).json({

                success: false,

                message:
                    "Invalid verification code."

            });

        }


        // ==========================================
        // MARK CODE VERIFIED
        // ==========================================

        await new Promise(
            (resolve, reject) => {

                db.query(
                    `
                    UPDATE email_verifications
                    SET verified = TRUE
                    WHERE id = ?
                    `,

                    [verification.id],

                    (err) => {

                        if (err) {

                            reject(err);

                        } else {

                            resolve();

                        }

                    }
                );

            }
        );


        // ==========================================
        // DETERMINE ACCOUNT STATUS
        // ==========================================

        let newStatus =
            "active";


        if (
            user.account_type ===
            "worker"
        ) {

            newStatus =
                "pending_appointment";

        }


        // ==========================================
        // UPDATE USER
        // ==========================================

        await new Promise(
            (resolve, reject) => {

                db.query(
                    `
                    UPDATE users
                    SET
                        email_verified = TRUE,
                        status = ?
                    WHERE id = ?
                    `,

                    [
                        newStatus,
                        user.id
                    ],

                    (err) => {

                        if (err) {

                            reject(err);

                        } else {

                            resolve();

                        }

                    }
                );

            }
        );


        // ==========================================
        // SEND JKWI ID EMAIL
        // ==========================================

        const idSubject =
            "Your JK Winners ID";


        const idText = `

Welcome to JK Winners Investment.

Your JK Winners ID is:

${user.jkwi_id}

Use this ID together with your password
to access the JKWI platform.

Keep your JK Winners ID secure.

Regards,
JK Winners Investment

`;


        const idHtml = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>Your JK Winners ID</title>

</head>


<body style="
    margin:0;
    padding:0;
    background:#f4f7fa;
    font-family:Arial,Helvetica,sans-serif;
">


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding:40px 15px;"
>

<tr>

<td align="center">


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        max-width:600px;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 20px rgba(0,0,0,0.08);
    "
>


<tr>

<td
    style="
        background:#009EF3;
        padding:28px;
        text-align:center;
        color:#ffffff;
    "
>

<h1
    style="
        margin:0;
        font-size:24px;
    "
>

JK WINNERS INVESTMENT

</h1>

</td>

</tr>


<tr>

<td
    style="
        padding:35px 30px;
        color:#1f2933;
    "
>

<h2
    style="
        margin-top:0;
        font-size:22px;
    "
>

Welcome to JK Winners Investment

</h2>


<p
    style="
        font-size:16px;
        line-height:1.6;
    "
>

Your account has been successfully
verified.

</p>


<p
    style="
        font-size:16px;
        line-height:1.6;
    "
>

Your JK Winners ID is:

</p>


<div
    style="
        margin:30px 0;
        padding:22px;
        background:#f0f8ff;
        border:1px solid #009EF3;
        border-radius:10px;
        text-align:center;
    "
>

<div
    style="
        font-size:30px;
        font-weight:bold;
        letter-spacing:4px;
        color:#009EF3;
    "
>

${user.jkwi_id}

</div>

</div>


<p
    style="
        font-size:15px;
        line-height:1.6;
    "
>

Use this ID together with your password
to access the JKWI platform.

</p>


<p
    style="
        font-size:14px;
        color:#667085;
        line-height:1.6;
    "
>

Keep your JK Winners ID secure.
Do not share your login credentials
with anyone.

</p>


<p
    style="
        margin-top:30px;
        font-size:15px;
    "
>

Regards,<br>

<strong>
JK Winners Investment
</strong>

</p>

</td>

</tr>


<tr>

<td
    style="
        background:#f7f9fc;
        padding:20px;
        text-align:center;
        color:#98a2b3;
        font-size:12px;
    "
>

© ${new Date().getFullYear()}
JK Winners Investment.
All rights reserved.

</td>

</tr>


</table>

</td>

</tr>

</table>


</body>

</html>

`;


        try {

            await sendEmail({

                to:
                    normalizedEmail,

                subject:
                    idSubject,

                text:
                    idText,

                html:
                    idHtml

            });

        }

        catch (emailError) {

            console.error(
                "JKWI ID email error:",
                emailError
            );

            /*
             * Account is already verified.
             * Email failure should not undo
             * successful verification.
             */

        }


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.json({

            success: true,

            message:
                "Account verified successfully.",

            user: {

                id:
                    user.id,

                jkwiId:
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
                    newStatus

            }

        });

    }


    catch (error) {

        console.error(
            "Verify code error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Verification failed."

        });

    }

};