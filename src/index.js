import mongoose from "mongoose"

import { DB_NAME } from "./constants";


 // this is our approach in which we put everyhting in main index file.
/* 

// first approach to connect to database 

 function connectDb(){}


 connectDb()

// 2nd approach = iife ,,, this is better approach to connect to database 


import express from "express"
const app = express()

 (async ()=> {
   try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on("error", (error)=>{
         console.log("Error", error);
         throw error
      })

      app.listen(process.env.PORT, ()=>{
         console.log(`App is listening on port ${process.env.PORT}`);
      })
   } catch (error) {
      console.log("Error: ", error);
      throw err
   }
 })()

 */