import express from "express"
import cors from "cors"
import cookieparser from "cookie-parser"
import path from 'path';
import { fileURLToPath } from 'url';



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


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'Home_page')));



//routes import
import userRouter from './routes/user.routes.js';
import commentRouter from './routes/comment.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import healthCheckRouter from './routes/healthcheck.routes.js';
import likeRouter from './routes/like.routes.js';
import playlistRouter from './routes/playlist.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import videoRouter from './routes/video.routes.js';


app.use(express.json({ limit: '160kb' }));
app.use(express.urlencoded({ extended: true, limit: '160kb' }));

// Define a GET route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Home_page', 'index.html'));
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/video", videoRouter);

// http://localhost:8000/api/v1/users/register    this is how our url like will look like.


export { app }
