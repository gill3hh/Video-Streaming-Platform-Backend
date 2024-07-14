// we connect our data,, this is the 2nd way of connecting if we want to keep our data connection in separate file and then import 
// in main running file. 

import mongoose from "mongoose";

import { DB_NAME } from "../constants";

const connectDB = async ()=> {
   try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI} / ${DB_NAME }`)
      console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance}`);
      console.log(connectionInstance);
      
   } catch (error) {
      console.error("MONGODB connection error", error);
      process.exit(1)
   }
}