import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";

dotenv.config({
  path: "./env",
});

const app = express(); // Initialize the app using express

// Middleware to parse JSON requests
app.use(express.json());

app.use("/api/v1/users", userRoutes);

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running at port: ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!!", err);
  });
