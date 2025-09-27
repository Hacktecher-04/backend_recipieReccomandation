require('dotenv').config()
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoutes");
const recipeRouter = require("./routes/recommendationsRoute");

const app = express();
const PORT = process.env.PORT || 8000;

//middelwares
app.use(express.json());
const allowedOrigins = process.env.FRONTEND_URL  || "http://localhost:3000"
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(cookieParser());

connectDB();

app.get('/', (req,res) => {
  res.json('page is working')
})

//Routes
app.use("/api/auth", userRouter);
app.use("/api/recipe", recipeRouter);



app.listen(PORT, () => console.log(`Server running at PORT: ${PORT}`));
