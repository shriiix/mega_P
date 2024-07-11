import asyncHandler  from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


//user register
const registerUser = asyncHandler(async(req,res)=>{
    //get user detail from front end
    //validation - not empty
    //check user already exist:username and email
    //files (avtar and cover image)
    //upload them to cloudinary, avatar
    //user object - create entry in db.
    //remove pass and refresh token field from response
    //check for userr creation 
    //return response

    //user detail
    const {fullname,email,username,password }=req.body;
    //console.log("email : ",email);

    //return if require field is empty
    if (
        [fullname, email, username, password].some((fields) => fields?.trim() === "")
    )  {
        throw new ApiError(400,"All field are required")  
    }
    //user already exist 
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
    }
    //console.log(req.files);
    //images

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(avatarLocalPath , "and  l l l l cover ---->", req.files?.coverImage[0]?.path,"file \n",req.files, "avatarLocalPath see me in USERCONTROLLER \n")
 
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;;
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    //upload images 
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    
    //user object - create entry in db.
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",  //can be empty
        email,
        password,
        username: username.toLowerCase()
    })


    //remove password and refreshtoken

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken")
    
    if(!createdUser){
        throw new ApiError(500,"Somethings went wrong ")
    }


//return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )


});

export {registerUser} 