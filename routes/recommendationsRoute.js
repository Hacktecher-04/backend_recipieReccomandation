const express = require("express");

const {getHistory, generateRecipesOnly, saveSelectedRecipe, deleteRecipe} = require("../controllers/recommendation");
const protect = require('../middleware/auth.middleware')

const router = express.Router();

router.get("/history",protect, getHistory);
router.post('/generate-recipes',protect, generateRecipesOnly);
router.post('/save-recipe',protect, saveSelectedRecipe);
router.post('/delete',protect, deleteRecipe)

module.exports = router;