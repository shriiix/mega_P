// require('dotenv').config({path : './env'})
import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/index.js";
// import {app} from './app.js'


const app = express()

dotenv.config({
    path: './.env'
})

connectDB()

.then(()=> {
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Serever is runnig at port: ${process.env.PORT}`);
    })
})
.catch((err) =>{
    console.log("MONGO db connection failed !!!", err);
})





















































/*
import express from "express"
const app = express()
//if e
(async ()=> {

    try {

       await mongoose.connect('${process.env.MONGODB_UR}/ ${DB_NAME}')
       app.on("error ",(error)=> {
        console.log("ERROR ",error);
        throw error
       })

       app.listen(process.env.PORT,() =>{
        console.log('App is listening on port  ${process.env.PORT}');
       } )

    }catch(error){
        console.error("ERROR :",error)        
        throw error
    }

})()
*/
