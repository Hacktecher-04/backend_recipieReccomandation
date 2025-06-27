const express = require("express");

const {getRecommendation,getHistory} = require("../controllers/recommendation");

const router = express.Router();

router.post("/recommendation", getRecommendation);
router.get("/history/:userId", getHistory);

module.exports = router;