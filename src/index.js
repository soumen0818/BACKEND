import connectDB from "./db/index.js";
// require ('dotenv').config({path : './env'})
// import { configDotenv } from "dotenv"
import dotenv from "dotenv";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen (process.env.PORT || 8000 , () => {
      console.log(`server is runing at port : ${process.env.PORT}`);
      
    })
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!!");
  });











  
/*
import express from "express";

const app = express()(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/ ${DB_Name}`);

    app.on("error", (error) => {
       console.log("Error: ", error);
       throw error
       
    });

    app.listen(process.env.PORT, () => {
        console.log(`App is listen on PORT ${process.env.PORT}`);
        
    })

  } catch (error) {
    console.error("EROOR : ", error);
    throw error;
  }
})();
*/
