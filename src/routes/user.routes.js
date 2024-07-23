import { Router } from "express";
import { changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    registerUser,
    updateAccountDetail,
    updateUserAvatar,
    updateUserCoverImage 
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(upload.fields([
    {
        name : "avatar",
        maxCount : 1
    },
    {
        name : "coverImage",
        maxCount : 1
    }
]),registerUser)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)

//patch only one detail is updating.
//post update everything
router.route("/update-account").patch(verifyJWT,updateAccountDetail)
router.route("/avatar-update").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"),updateUserCoverImage)
//BCZ we used params. 
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)



export default router

