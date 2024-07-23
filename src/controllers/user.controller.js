import asyncHandler  from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { Subscription } from "../models/subscription.model.js";
import { Timestamp } from "mongodb";
import mongoose from "mongoose";
import { response } from "express";

//generateAccessTokenAndRefreshToken
//to saved password or userinfo .
//saved in db too
// const generateAccessTokenAndRefreshToken = async(userId)=> 
// {
//     try{
//         const user = await User.findById(userId)
//         const accessToken = user.generateAccessToken()
//         const refreshToken = user.generateRefreshToken()
        
//         //to save user in db
//         user.refreshToken = refreshToken
//         await user.save({validateBeforeSave: false})
        
//         return{accessToken,refreshToken};


//     }catch(error){
//         throw new ApiError(500, "Something went wrong while gene. refresh and access token")
//     }
// }
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullname, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401,"token not refreshed || unauthorixed ")        
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401,"invalid refresh token")        
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"refresh token is not matching with user token")  
        }
    
        const options ={
            httpOnly : true,
            secure : true
        }
        const {accessToken,newrefreshToken}= await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newrefreshToken},
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token ")
        
    }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword , newPassword,confiPassword } = req.body
    if (newPassword=== confiPassword) {
        throw new ApiError(401,"incorrect new password ")
        
    }
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid old password ")     
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed Successfully"))
})

const getCurrentUser =asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user, "Current User fetched successfully"))
})

const updateAccountDetail = asyncHandler(async(req,res)=>{
    const {fullname,email,} = req.body
    if (!fullname || !email) {
        throw new ApiError(400,"All fields required")
    }
    //to update recent details 
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname:fullname,
                email:email,
            }
        },
        {new:true}//return updated info 
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user, "Account detail updated successfully"))
    
})
const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is missing")        
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400,"Error while uploading avatar on cloudinary ")
    }

    //to update recent avatar 
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new : true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200,user, "avatar image updated ")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400,"cover image file is missing")        
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400,"Error while uploading coverimage on cloudinary ")
    }

    //to update recent avatar 
    const user  = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover image updated ")
    )

})

const getUserChannelProfile = asyncHandler(async(req,res)=>{

    const {username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400,"username is missing")        
    }
    //aggression pipeline by direct . (match function)
    const channel = await User.aggregate([
        {
            //document filter. match the users
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            //check count of Subscriber/user through the channels
            $lookup:{
                from:"subcriptions",
                localField : "_id",
                foreignField:"channel",
                as:"subscribers"
            }

        },
        {
            //how many you subcribe/channel owner to other channel
            $lookup:{
                from:"subcriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribTowho"
            }
        },
        {
            //add field is sub yes or not
            $addFields:{
                //getting count from sub.
                SubscriberCount:{
                    $size:"$subscribers"
                },
                //getting count from 
                channelsSubscribedToCount:{
                    $size:"$subscribTowho"
                },
                //is channel sub or not 
                isSubscribed:{
                    $cond:{ 
                        //$in to see in arrays and object aswell
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }

            }
        },
        {
            //give the selected documents.
            $project:{
                fullname :1,
                username:1,
                SubscriberCount :1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,
                // timestamps:1

            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404,"channel dose not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched succesfully")
    )


})


//get user watch history

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            //match document with object id
            $match :{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {   
            //get watch history
            $lookup:{
                from:"Videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                
                //sub pipeline for get particular data from the user
                
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as :"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        avatar:1

                                    }
                                }
                            ]                    
                        }
                    },
                    {
                        owner:{
                            $first:"$owner"
                        }                        
                    }
                    
                ]
            }
        }

    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watchHistory fetched successfully"
        
        )
    )


})






export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetail,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWatchHistory
} 