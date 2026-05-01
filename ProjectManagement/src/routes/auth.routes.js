import validate from '../middlewares/validator.middleware.js'
import {userRegistrationValidator,userLoginValidator, userForgotPasswordValidator, userResetForgotPasswordValidator, userChangeCurrentPasswordValidator,createProjectValidator,addMemberToProjectValidato} from '../validators/index.js'
import authController from '../controllers/auth.controller.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'
import  Router  from 'express'


const router = Router()


//unsecured routes
router.route('/register').post(userRegistrationValidator(), validate, authController.registerUser)

router.route('/login').post(userLoginValidator(), validate, authController.login)

router.route('/verify-email/:verificationToken').get(authController.verifyEmail)

router.route('/refresh-token').post(authController.refreshAccessToken)


router.route('/forgot-password').post(userForgotPasswordValidator(), validate, authController.forgotPassReq)


router.route('/reset-password/:resetToken').post(userResetForgotPasswordValidator() ,validate,authController.resetForgotPassword)



//secured routes
router.route('/logout').post(verifyJWT, authController.logoutUser)
router.route('/current-user').post(verifyJWT, authController.getCurrentUser)
router.route('/change-password').post(verifyJWT, userChangeCurrentPasswordValidator(), validate, authController.changeCurrentPassword)


router.route('/resend-email-verification').post(verifyJWT, authController.resendEmailVerification)



export default router