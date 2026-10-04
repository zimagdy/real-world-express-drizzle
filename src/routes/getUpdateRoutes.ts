import Router from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import { getUser, updateUser } from '../controllers/getUpdateController.ts'
import { z } from 'zod'

const router = Router()

router.use(authenticateToken)

router.get('/', getUser)

router.put('/', updateUser)
export default router
