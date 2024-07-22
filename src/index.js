// require('dotenv').config({path: './env'})
// line 1 is bringing inconsistency to our code. definetely it is correct and we can run it and it will run fine, but it is not 
// good practise as we are using import and not require. so line 14,15 is differnet way to make it convert into import statement. 

import dotenv from "dotenv"

import mongoose from "mongoose"

import { DB_NAME } from "./constants.js";

import connectDB from "./db/index.js";

import {app} from './app.js';


dotenv.config({
   path: './env'
})


connectDB()
.then(()=>{
   app.listen(process.env.PORT || 8000, ()=>{
      console.log(`app is listening on ${process.env.PORT}`);
   })
})
.catch((err)=>{
   console.log("Monog DB connection failed !!!", err);
})












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