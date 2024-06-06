import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))


app.use(express.json({limit : "16kb"})) // json file .
app.use(express.urlencoded({extended:true, limit: "16kb"})) // convert the url (space = %20 )
app.use(express.static("public")) //image pdf file saved on server in public . 
app.use(cookieParser())




export { app }