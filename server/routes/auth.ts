import { Router } from 'express'
import { verifyUser } from '../controllers/authController'

const router = Router()

router.post('/verify', verifyUser)

export default router