const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoutes");
const recipeRouter = require("./routes/recommendationsRoute");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

//middelwares
app.use(express.json());
const allowedOrigins = ['http://localhost:3000', 'https://khanakhajana04.netlify.app/'];

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

//DB connection
connectDB();

//Routes
app.use("/api/auth", userRouter);
app.use("/api/recipe", recipeRouter);



app.listen(PORT, () => console.log(`Server running at PORT: ${PORT}`));
