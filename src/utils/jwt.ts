import jwt from 'jsonwebtoken'
import env from '../../env.ts'
import type { SignOptions } from 'jsonwebtoken'

export interface JwtPayload {
  username: string
  email: string
}

export const generateToken = (payload: JwtPayload) => {
  const secretKey = env.JWT_SECRET
  const options = { expiresIn: '2h' } satisfies SignOptions

  return jwt.sign(payload, secretKey, options)
}

export const verifyToken = (token: string): JwtPayload => {
  const secretKey = env.JWT_SECRET
  return jwt.verify(token, secretKey) as JwtPayload
}
