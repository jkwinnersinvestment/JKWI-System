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

router.post(
    "/verify-id",
    userController.verifyId
);

router.post(
    "/verify-email",
    userController.verifyEmail
);

router.post(
    "/resend-verification",
    userController.resendVerificationCode
);

router.get(
    "/saved-addresses",
    userController.savedAddresses
);

router.post(
    "/login",
    userController.login
);


module.exports = router;
