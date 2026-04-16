
import resgisterUser from '../controllers/auth.controller.js'
import { Router } from 'express'


const router = Router()

router.route('/register').post(resgisterUser)

export default router