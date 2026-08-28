const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

connection.connect((error) => {

    if (error) {

        console.error(
            "Database connection failed:",
            error
        );

    } else {

        console.log(
            "JKWI Database Connected Successfully"
        );

    }

});

module.exports = connection;