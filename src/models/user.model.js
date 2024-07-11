import mongoose, {Schema} from "mongoose";
import  Jwt  from "jsonwebtoken"; //it is Bearer token for the client side authentication endpoint and   will  one who has token can access data thatis it is like key for user
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
            required : [true,"Avatar is required"],
        },
        coverImage :{
            type : String   //cloudinary url
        },
        watchhistory :[
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],

        password :{
            type : String,
            required : [true, 'password is required '],
            trim : true,
        },
        refreshToken :{
            type : String

        },

    },
    {
        timestamps : true

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
    return Jwt.sign({
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