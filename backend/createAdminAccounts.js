const bcrypt = require("bcryptjs");

const db = require("./config/database");


// ==========================================
// JKWI ADMIN ACCOUNTS
// ==========================================

const accounts = [

    {
        username: "superadmin",
        password: "ChangeMe123!",
        role: "Super Admin",
        department: "Administration",

        permissions: {
            all: true
        }
    },


    {
        username: "newsmanager",
        password: "ChangeMe123!",
        role: "News Manager",
        department: "News",

        permissions: {
            news: true,
            review: true,
            publish: true,
            reject: true,
            edit: true
        }
    },


    {
        username: "localbusiness",
        password: "ChangeMe123!",
        role: "News Reporter",
        department: "Local Business News",

        permissions: {
            news: true,
            create: true,
            submit: true,
            publish: false
        }
    },


    {
        username: "internationalbusiness",
        password: "ChangeMe123!",
        role: "News Reporter",
        department: "International Business News",

        permissions: {
            news: true,
            create: true,
            submit: true,
            publish: false
        }
    },


    {
        username: "localmarkets",
        password: "ChangeMe123!",
        role: "News Reporter",
        department: "Local Market News",

        permissions: {
            news: true,
            create: true,
            submit: true,
            publish: false
        }
    },


    {
        username: "internationalmarkets",
        password: "ChangeMe123!",
        role: "News Reporter",
        department: "International Markets News",

        permissions: {
            news: true,
            create: true,
            submit: true,
            publish: false
        }
    },


    {
        username: "marketmanager",
        password: "ChangeMe123!",
        role: "Market Manager",
        department: "Markets",

        permissions: {
            markets: true,
            localMarkets: true,
            internationalMarkets: true,
            prices: true,
            edit: true
        }
    },


    {
        username: "storeadmin",
        password: "ChangeMe123!",
        role: "Store Admin",
        department: "Store",

        permissions: {
            products: true,
            services: true,
            prices: true,
            stock: true
        }
    }

];


// ==========================================
// CREATE ACCOUNT
// ==========================================

async function createAccount(account) {

    try {

        // Check if username already exists

        const existing = await new Promise(
            (resolve, reject) => {

                db.query(
                    `
                    SELECT id
                    FROM admins
                    WHERE username = ?
                    LIMIT 1
                    `,
                    [account.username],
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


        // Don't create duplicates

        if (existing.length > 0) {

            console.log(
                `SKIPPED: ${account.username} already exists.`
            );

            return;

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(
                account.password,
                12
            );


        // Insert account

        await new Promise(
            (resolve, reject) => {

                db.query(
                    `
                    INSERT INTO admins
                    (
                        username,
                        password,
                        role,
                        department,
                        permissions
                    )
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        account.username,
                        hashedPassword,
                        account.role,
                        account.department,
                        JSON.stringify(account.permissions)
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


        console.log(
            `CREATED: ${account.username}`
        );

    }

    catch (error) {

        console.error(
            `FAILED: ${account.username}`,
            error.message
        );

    }

}


// ==========================================
// RUN
// ==========================================

async function createAllAccounts() {

    console.log("");
    console.log("==========================================");
    console.log(" JKWI ADMIN ACCOUNT SETUP");
    console.log("==========================================");
    console.log("");


    for (const account of accounts) {

        await createAccount(account);

    }


    console.log("");
    console.log("==========================================");
    console.log(" ACCOUNT SETUP COMPLETE");
    console.log("==========================================");
    console.log("");


    db.end();

}


createAllAccounts();