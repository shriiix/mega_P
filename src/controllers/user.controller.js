import { asyncHandler } from "../utils/asynchandler.js";

const registerUser = asyncHandler(async(req,res )=>{
    return res.status(200).json({
        message:"chai aur code"
    })
})


export{registerUser,}