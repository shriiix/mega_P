import mongoose, {Schema} from "mongoose";
import { Jwt } from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSChema = new Schema (
    {
        username :{
            type : String,
            unique : true,
            required : true,
            lowerCase : true,
            trim : true,
            index : true
        },
        email :{
            type : String,
            unique : true,
            required : true,
            lowerCase : true,
            trim : true,
        },
        fullname :{
            type : String,
            required : true,
            trim : true,
            index : true
        },
        avatar:{
            type : String,
            required : true
        },
        coverImage :{
            type : String   //cloudinary url
        },
        watchhistory :[
            {
                type : mongoose.Schema.Type.ObjectId,
                ref : "Video"
            }
        ],

        password :{
            type : String,
            required : [true, 'password is required ']
        },
        refreshToken :{
            type : String

        },
       


    },
    {
        timeStamps : true

    },
)

//encryption pass . pre before saving 
//asyn for call back funtion .
//hooks

userSChema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSChema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}


userSChema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id,
        email: this.email,
        username : this.username,
        fullname : this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expireIn: process.env.ACCESS_TOKEN_EXPIRY

    }

    
)

}
userSChema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expireIn: process.env.REFRESH_TOKEN_EXPIRY

    }

    
)
    
}







export const User = mongoose.model("User",userSChema)