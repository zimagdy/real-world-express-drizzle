import jwt from 'jsonwebtoken'
import env from '../../env.ts'

interface JwtPayload {
  username: string
  email: string
}

export const generateToken = (payload: JwtPayload) => {
  const secretKey = env.JWT_SECRET
  const options = { expiresIn: 12 }

  return jwt.sign(payload, secretKey, options)
}

export const verifyToken = (token: string) => {}
