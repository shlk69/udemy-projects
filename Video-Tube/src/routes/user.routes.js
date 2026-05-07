import { accessRefreshToken, loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import { Router } from "express";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()


router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount:1
        },
        {
            name: 'coverImage',
            maxCount:1
        },
    ]),
    registerUser
)

router.route('/login').post(loginUser)
router.route('/renew-token').post(accessRefreshToken)

//secured routes
router.route('/logout').post(verifyJwt,logoutUser)



export default router 