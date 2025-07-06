const express = require("express");

const {getHistory, generateRecipesOnly, saveSelectedRecipe} = require("../controllers/recommendation");

const router = express.Router();

router.get("/history/:userId", getHistory);
router.post('/generate-recipes', generateRecipesOnly);
router.post('/save-recipe', saveSelectedRecipe);

module.exports = router;