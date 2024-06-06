import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {

        videoFile :{
            type : String, // cloudinary URL 
            required : true,
        },
        thumbnail :{
            type : String,
            required : true
        },
        tittle :{
            type : String,
            required : true
        },
        description :{
            type : String,
            required : true
        },
        duration :{
            type : Number, //cloudinary automatic
            required : true
        },
        viwes :{
            type : Number,
            default : 0,
        },
        isPublished :{
            type :Boolean,
            default : true
        },
        owner :{
            type:Schema.Types.ObjectId,
            ref : "User"
        }

    },
    
    {timeStamps : true}

)

videoSchema.plugin(mongooseAggregatePaginate)



export const Video = mongoose.model("Video",videoSchema)