import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI.trim();
    // Remove trailing slash if it exists
    const formattedURI = MONGODB_URI.endsWith("/")
      ? MONGODB_URI.slice(0, -1)
      : MONGODB_URI;
    const connectionInstance = await mongoose.connect(
      `${formattedURI}/${DB_Name.trim()}`
    );
    console.log(
      `\n MongoDB connected !! DB host ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection error: ", error);
    process.exit(1);
  }
};

export default connectDB;
