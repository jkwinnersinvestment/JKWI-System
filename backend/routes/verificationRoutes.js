const express = require("express");

const router = express.Router();

const verificationController =
    require("../controllers/verificationController");


// ==========================================
// SEND VERIFICATION CODE
// ==========================================

router.post(
    "/send",
    verificationController.sendCode
);


// ==========================================
// VERIFY CODE
// ==========================================

router.post(
    "/verify",
    verificationController.verifyCode
);


module.exports = router;