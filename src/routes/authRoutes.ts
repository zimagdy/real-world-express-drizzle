import Router from 'express'
import z from 'zod'
import { register, login } from '../controllers/authController.ts'
import { validateBody } from '../middleware/validation.ts'
import { zstdCompress } from 'node:zlib'

const router = Router()

const registerSchema = z.object({
  username: z.string().min(3, 'is too small'),
  email: z.string().email(),
  password: z.string().min(5, 'is too short'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})
router.post('/', validateBody(registerSchema), register)

router.post('/login', validateBody(loginSchema), login)

export default router
