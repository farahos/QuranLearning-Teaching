const express = require("express");
const { auth } = require("../middleware/auth");
const { listCertificates } = require("../controllers/certificateController");

const router = express.Router();

router.get("/", auth, listCertificates);

module.exports = router;
