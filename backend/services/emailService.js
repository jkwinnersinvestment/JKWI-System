const nodemailer = require("nodemailer");


// ==========================================
// JKWI EMAIL TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({

    host: process.env.SMTP_HOST,

    port: Number(
        process.env.SMTP_PORT || 587
    ),

    secure:
        process.env.SMTP_SECURE === "true",

    auth: {

        user:
            process.env.SMTP_USER,

        pass:
            process.env.SMTP_PASSWORD

    }

});


// ==========================================
// VERIFY EMAIL CONNECTION
// ==========================================

async function verifyEmailConnection() {

    try {

        await transporter.verify();

        console.log(
            "JKWI Email Service Connected Successfully"
        );

    }

    catch (error) {

        console.error(
            "JKWI Email Service Connection Failed:",
            error.message
        );

    }

}


// ==========================================
// SEND EMAIL
// ==========================================

async function sendEmail({
    to,
    subject,
    html,
    text
}) {

    const mail = {

        from:
            process.env.SMTP_FROM,

        to,

        subject,

        text,

        html

    };


    return transporter.sendMail(mail);

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    transporter,

    verifyEmailConnection,

    sendEmail

};