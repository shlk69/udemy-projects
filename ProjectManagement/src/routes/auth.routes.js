import validate from '../middlewares/validator.middleware.js'
import {userRegistrationValidator,userLoginValidator} from '../validators/index.js'
import authController from '../controllers/auth.controller.js'
import  Router  from 'express'


const router = Router()

router.route('/register').post(userRegistrationValidator(), validate ,authController.registerUser)
router.route('/login').post(userLoginValidator(),validate, authController.login)

export default router