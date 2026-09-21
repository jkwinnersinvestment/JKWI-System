const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");


// ==========================================
// USER REGISTRATION
// ==========================================

router.post(
    "/register",
    userController.register
);


module.exports = router;
