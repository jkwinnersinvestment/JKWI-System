const bcrypt = require("bcryptjs");
const db = require("./config/database");

const admins = [
    {
        username: "market_news",
        password: "ChangeMe123!",
        role: "admin",
        department: "Market News",
        permissions: {
            news: true,
            news_create: true,
            news_edit: true,
            news_submit: true
        }
    },
    {
        username: "national_business",
        password: "ChangeMe456!",
        role: "admin",
        department: "National Business News",
        permissions: {
            news: true,
            news_create: true,
            news_edit: true,
            news_submit: true
        }
    },
    {
        username: "local_business",
        password: "ChangeMe789!",
        role: "admin",
        department: "Local Business News",
        permissions: {
            news: true,
            news_create: true,
            news_edit: true,
            news_submit: true
        }
    },
    {
        username: "local_market",
        password: "ChangeMe321!",
        role: "admin",
        department: "Local Market",
        permissions: {
            news: true,
            news_create: true,
            news_edit: true,
            news_submit: true
        }
    }
];


async function createAdmins() {

    try {

        for (const admin of admins) {

            const hashedPassword =
                await bcrypt.hash(admin.password, 12);

            const sql = `
                INSERT INTO admins
                (
                    username,
                    password,
                    role,
                    department,
                    permissions
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            await new Promise((resolve, reject) => {

                db.query(
                    sql,
                    [
                        admin.username,
                        hashedPassword,
                        admin.role,
                        admin.department,
                        JSON.stringify(admin.permissions)
                    ],
                    (err, result) => {

                        if (err) {
                            reject(err);
                        } else {
                            console.log(
                                `Created: ${admin.username}`
                            );
                            resolve();
                        }

                    }
                );

            });

        }

        console.log("");
        console.log("=================================");
        console.log("4 NEWS ADMINS CREATED");
        console.log("=================================");
        console.log("");
        console.log("market_news       → Market News");
        console.log("national_business → National Business News");
        console.log("local_business    → Local Business News");
        console.log("local_market      → Local Market");
        console.log("");
        console.log("IMPORTANT:");
        console.log("Change these temporary passwords.");
        console.log("=================================");

        process.exit(0);

    }
    catch (error) {

        console.error(
            "Error creating news admins:",
            error
        );

        process.exit(1);

    }

}


createAdmins();