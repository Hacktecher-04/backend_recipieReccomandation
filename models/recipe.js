const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: String,
  ingredients: String,
  instructions: String,
  cookingTime: String,
  healthScore: Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
},{
    timestamps:true
});

module.exports = mongoose.model('Recipe', recipeSchema);

