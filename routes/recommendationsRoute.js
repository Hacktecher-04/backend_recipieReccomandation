const express = require("express");

const {getRecommendation,getHistory, getRecipeSteps} = require("../controllers/recommendation");

const router = express.Router();

router.post("/recommendation", getRecommendation);
router.get("/history/:userId", getHistory);
router.get('/recipes/:id/steps', getRecipeSteps);



module.exports = router;