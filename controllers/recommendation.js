const Recipe = require('../models/recipe');
const ai = require('../services/ai.service');
const dotenv = require("dotenv");
dotenv.config();

const generateRecipesOnly = async (req, res) => {
    try {
        const { ingredients } = req.body;

        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: "Ingredients must be a non-empty array." });
        }

        const cleanedIngredients = ingredients
            .map(ing => ing.trim().toLowerCase())
            .filter(ing => ing.length > 0 && typeof ing === "string");

        if (cleanedIngredients.length === 0) {
            return res.status(400).json({ error: "No valid ingredients found." });
        }

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
        const recipesRaw = generatedText.split('---').map(r => r.trim()).filter(Boolean);

        const recipes = recipesRaw.map(block => {
            const titleMatch = block.match(/Recipe Name:\s*(.+)/i);
            const ingredientsMatch = block.match(/Ingredients:\s*(.+)/i);
            const instructionsMatch = block.match(/Instructions:\s*(.+)/i);
            const timeMatch = block.match(/Cooking Time:\s*(\d+)/i);
            const scoreMatch = block.match(/Health Score:\s*(\d+)/i);

            return {
                title: titleMatch?.[1]?.trim() || "Untitled",
                ingredients: ingredientsMatch?.[1]?.trim() || "N/A",
                instructions: instructionsMatch?.[1]?.trim() || "Instructions not found.",
                cookingTime: timeMatch ? parseInt(timeMatch[1]) : "N/A",
                healthScore: scoreMatch ? parseInt(scoreMatch[1]) : 50,
            };
        });

        res.status(200).json({ recipes });

    } catch (error) {
        console.error("Error in generateRecipesOnly:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


const saveSelectedRecipe = async (req, res) => {
    try {
        const { recipe, userId, prompt } = req.body;

        if (!recipe || !userId || !prompt) {
            return res.status(400).json({ message: "recipe, userId, and prompt are required" });
        }

        const stepsPrompt = `
Give a full, detailed, and step-by-step cooking guide for the recipe below:

Recipe Name: ${recipe.title}
Ingredients: ${recipe.ingredients}

Format:
Step 1: [Description]
Step 2: [Description]
...
Make it beginner-friendly, don't skip any basic steps, and avoid unnecessary explanation. Return only the steps in the format "Step 1:", "Step 2:", etc. Do not use numbers with parentheses or dots.
`;

        const generatedSteps = await ai.generateResult(stepsPrompt);

        const steps = generatedSteps
            .split("\n")
            .map(line => line.trim())
            .filter(line => line && /^Step \d+:/.test(line));

        if (steps.length === 0) {
            return res.status(500).json({ message: "AI did not return proper steps." });
        }

        const saved = await Recipe.create({
            title: recipe.title,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            cookingTime: recipe.cookingTime,
            healthScore: recipe.healthScore,
            steps,
            userId,
            prompt // 👈 Save original prompt
        });

        res.status(201).json({ saved });

    } catch (error) {
        console.error("Error in saveSelectedRecipe:", error);
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

module.exports = {
    getHistory,
    generateRecipesOnly,
    saveSelectedRecipe
};
