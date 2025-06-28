const Recipe = require('../models/recipe');
const ai = require('../services/ai.service');
const dotenv = require("dotenv");
dotenv.config();

const getRecommendation = async (req, res) => {
    try {
        const { ingredients, userId } = req.body;

        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: "Ingredients must be a non-empty array." });
        }

        const cleanedIngredients = ingredients
            .map(ing => ing.trim().toLowerCase())
            .filter(ing => ing.length > 0 && typeof ing === "string");

        if (cleanedIngredients.length === 0) {
            return res.status(400).json({ error: "No valid ingredients found." });
        }

        // Intelligent fallback for random sentences
        const formattedIngredients = cleanedIngredients.join(', ');
        const prompt = `
I have these items (might be mixed, invalid, or vague): ${formattedIngredients}.
Please ignore junk or invalid items and focus only on fruits, vegetables, or common Indian cooking ingredients.
Return ONLY 10 simple home-cooked recipes, each structured exactly like below:

---
Recipe Name: [Short name without special characters]
Ingredients: [Comma-separated, max 5 common ingredients]
Instructions: [One paragraph, simple instructions]
Cooking Time: [Only a number in minutes]
Health Score: [Number between 1–100]
---

Strictly follow the structure for each recipe. Avoid numbering or bullet points. Don't include extra text before or after.
    `;

        const generatedText = await ai.generateResult(prompt);

        // Parse multiple recipes using RegExp
        const recipesRaw = generatedText.split('---').map(block => block.trim()).filter(Boolean);

        const recipes = recipesRaw.map(block => {
            const titleMatch = block.match(/Recipe Name:\s*(.+)/i);
            const ingredientsMatch = block.match(/Ingredients:\s*(.+)/i);
            const instructionsMatch = block.match(/Instructions:\s*(.+)/i);
            const timeMatch = block.match(/Cooking Time:\s*(\d+)/i);
            const scoreMatch = block.match(/Health Score:\s*(\d+)/i);

            const title = titleMatch?.[1]?.trim() || "Untitled";
            const ingredients = ingredientsMatch?.[1]?.trim() || "N/A";
            const instructions = instructionsMatch?.[1]?.trim() || "Instructions not found.";
            const cookingTime = timeMatch ? parseInt(timeMatch[1]) : "N/A";
            const healthScore = scoreMatch ? parseInt(scoreMatch[1]) : 50;

            return { title, ingredients, instructions, cookingTime, healthScore, userId };
        });

        // Save all recipes to DB
        await Recipe.insertMany(recipes);

        res.status(201).json({ recipes });
    } catch (error) {
        console.error("Error in getRecommendation:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const getRecipeSteps = async (req, res) => {
    try {
        const { id } = req.params;

        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found." });
        }

        const prompt = `
Give a full, detailed, and step-by-step cooking guide for the recipe below:

Recipe Name: ${recipe.title}
Ingredients: ${recipe.ingredients}

Format:
1. Step 1: [Description]
2. Step 2: [Description]
...
Make it beginner-friendly, don't skip any basic steps, and avoid unnecessary explanation. Return only the steps.
    `;

        const generatedSteps = await ai.generateResult(prompt);

        const steps = generatedSteps
            .split("\n")
            .map(line => line.trim())
            .filter(line => line && /^\d+[\).]/.test(line));

        if (steps.length === 0) {
            return res.status(500).json({ message: "AI did not return proper steps." });
        }

        res.status(200).json({
            recipeId: id,
            title: recipe.title,
            ingredients: recipe.ingredients,
            cookingTime: recipe.cookingTime,
            steps,
        });

    } catch (error) {
        console.error("Error in getRecipeSteps:", error);
        res.status(500).json({ message: "Server error" });
    }
};



const getHistory = async (req, res) => {
    const { userId } = req.params;
    try {
        const history = await Recipe.find({ userId });
        if (!history || history.length === 0) {
            return res.status(404).json({
                message: "No history found"
            })
        }
        res.status(200).json(history);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error"
        });

    }
}

module.exports = { getRecommendation, getHistory, getRecipeSteps };