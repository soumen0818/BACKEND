import mongoose from "mongoose";
import { DB_Name } from "../constants.js";


const connectDB = async ()  => {
    try {
       const connectionIntance = await mongoose.connect (`${process.env.MONGODB_URI} / ${DB_Name}`)
       console.log(`\n MongoDB connected !! DB host ${connectionIntance.connection.host}`);
       
    } catch (error) {
        console.log("MONGODB connection error: ", error);
        process.exit(1);
        
    }
} 


export default connectDB;