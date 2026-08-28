const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Onka$123",
    database: "jkwi_system"
});

connection.connect((error) => {
    if (error) {
        console.error("Database connection failed:", error);
    } else {
        console.log("JKWI Database Connected Successfully");
    }
});

module.exports = connection;