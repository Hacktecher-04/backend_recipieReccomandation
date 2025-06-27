const Recipe = require('../models/recipe');
const axios = require('axios');
const ai = require('../services/ai.service');
const dotenv = require("dotenv");
dotenv.config();

const getRecommendation = async (req, res) => {
     
    try {
        const { ingredients ,userId} = req.body;
        // const userId = "681101ccd6aa3500d95ce774";

        // Validate input
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: "Ingredients must be a non-empty array." });
        }
        // Check if the ingredients are valid and suggest alternatives if needed
        const invalidIngredients = ingredients.filter(ingredient => typeof ingredient !== 'string' || ingredient.trim() === '');
        if (invalidIngredients.length > 0) {
            return res.status(400).json({ 
            error: "Some ingredients are invalid. Please provide valid ingredient names.",
            invalidIngredients
            });
        }

        // Determine the type of prompt based on ingredients
        const isVegetableOrFruit = ingredients.every(ingredient => {
            const lowerCaseIngredient = ingredient.toLowerCase();
            return lowerCaseIngredient.includes("vegetable") || lowerCaseIngredient.includes("fruit");
        });

        let prompt;
        if (isVegetableOrFruit) {
            prompt = `I have these vegetables or fruits: ${ingredients.join(
              ", "
            )}. Suggest only one recipe and easy that can made in home  with:
               - Recipe name (short and clear without any special characters and give only name)
               - Brief list of ingredients (comma-separated, max 5 items)
               - Cooking instructions(in para form) 
               - Estimated cooking time (in minutes, give a number not text)
               - Health score (1-100 and not give ideas about score)
            `;
        } else {
            prompt = `I have these ingredients: ${ingredients.join(', ')}. Suggest only one recipe and easy that can made in home  with:
               - Recipe name (short and clear without any special characters and give only name)
               - Brief list of ingredients (comma-separated, max 5 items)
               - Cooking instructions(in para form)
               - Estimated cooking time (in minutes, give a number not text)
               - Health score (1-100 and not give ideas about score)
               without start character
            `;
        }

        const generatedText = await ai.generateResult(prompt);  

        const result = generatedText.split("\n").filter(line => line.trim());

        // Validate AI response
        if (result.length < 5) {
            return res.status(400).json({ error: "AI response is incomplete or incorrectly formatted." });
        }

        const title = result[0]?.trim() || "Untitled";
        const ingredientsList = result[1]?.trim() || "N/A";

        // Join all lines between 2nd and 2nd-to-last as instructions
        let instructions = result.slice(2, result.length - 2).join(" ").trim();

        // Extract cooking time from the whole text
        const regex = /(\d+)\s*(?:minutes|min)/i;
        const cookingTimeLine = result[3]?.trim();
        const cookingTime = /^\d+$/.test(cookingTimeLine) ? cookingTimeLine : "N/A";

        // Remove cooking time from instructions if it’s mistakenly included
        instructions = instructions.replace(regex, "").trim();
        const healthScoreLine = result[result.length - 1]?.trim();
        const healthScore = parseInt(healthScoreLine.split(':')[1], 10);
        const validHealthScore = !isNaN(healthScore) ? healthScore : 50;

        const newRecipe = new Recipe({
            title,
            ingredients: ingredientsList,
            instructions,
            cookingTime,
            healthScore: validHealthScore,
            userId
        });

        await newRecipe.save();

        res.status(201).json({
            title,
            ingredients: ingredientsList,
            instructions,
            cookingTime,
            healthScore: validHealthScore
        });

    } catch (error) {
        console.error("Error in getRecommendation:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const getHistory = async (req,res)=>{
    const {userId} = req.params;
  try{
    const history = await Recipe.find({userId});
    if(!history || history.length===0){
        return res.status(404).json({
            message:"No history found"
        })
    }
    res.status(200).json(history);
  }
  catch(err){
    console.log(err);
     res.status(500).json({
        message:"Server error"
     });
    
  }
}

module.exports = { getRecommendation ,getHistory};