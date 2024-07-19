import mongoose ,{Schema}from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        //the one who subscribing
        ref : "User"
    },
    channel :{
        type:Schema.Types.ObjectId,
        //the one who subscriber is subscribing owner
        ref : "User"
    }
},
    {timestamps:true}
)

export const Subscription = mongoose.model("Subcription",subscriptionSchema)