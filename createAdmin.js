const bcrypt = require("bcryptjs");
const db = require("./config/database");

const username = "admin";
const password = "JKWI@2026";

bcrypt.hash(password, 10, (err, hashedPassword) => {

    if (err) {
        console.error(err);
        return;
    }

    const sql = `
        INSERT INTO admins (username, password, role)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [username, hashedPassword, "admin"],
        (err, result) => {

            if (err) {
                console.error("Admin creation failed:", err);
                return;
            }

            console.log("================================");
            console.log("JKWI ADMIN CREATED SUCCESSFULLY");
            console.log("Username:", username);
            console.log("================================");

            process.exit();
        }
    );
});