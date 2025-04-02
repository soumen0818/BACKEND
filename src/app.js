import express from 'express'
import cookieParser from 'cookie-parser'    
import cors from 'cors'

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN
}))
app.use (express.urlencoded({extended : true , limit: "20kb"}))
app.use(express.static("public"))

// import routs
import userRouter from "./routes/user.routes.js"

// routes declaration

app.use("/api/v1/users", userRouter)


export {app}