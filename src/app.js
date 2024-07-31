import express from "express"
import cors from "cors"
import cookieparser from "cookie-parser"


const app = express()

app.use(cors({
   origin: process.env.CORS_ORIGIN,
   credentials: true,
}))

// +++++++++++++ three main configurations ++++++++++++++++++++++
app.use(express.json({limit: "160kb"}))  // we can study about this more in documentation, what i am doing here is just making a 
// limit in middleware then when i get a response from json, only 16kb data i will recieve. we dont want that a json file of 2gb
// that we dont want to allow. so we use limit.
app.use(express.urlencoded({extended: true, limit: "160kb"})) // this we do because sometimes url are written in differnet paterns 
// for example some use + , some use % and etc. so this will take care of all of them.
app.use(express.static("public"))

app.use(cookieparser())


//routes import
import userRouter from './routes/user.routes.js'


// routes declaration
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register    this is how our url like will look like.


export { app }
