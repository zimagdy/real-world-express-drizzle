import type { Request, Response } from 'express'
import db from '../db/connection.ts'
import { users } from '../db/schema.ts'
import { eq, or } from 'drizzle-orm'
import { hashPassword, comparePassword } from '../utils/password.ts'
import { generateToken } from '../utils/jwt.ts'

export const register = async (req: Request, res: Response) => {
  try {
    const userData = req.body.user

    // I want to check here if the user object contains username, email and password. How can i do this ?
    // Using zod or what
    // i knew the frontend check from username, email and password is null or not but i want to check here as well
    // yeah i will use middleware (zod) to check from user object

    const email_ = userData.email.toLowerCase()
    const username_ = userData.username.toLowerCase()

    const verify = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username_), eq(users.email, email_)))
      .limit(1) // To stop search

    if (verify.length > 0) {
      return res.status(409).json({
        error: 'username or email is exist, try another one',
      })
    }

    const hashedPassword = await hashPassword(userData.password)

    const [newUser] = await db
      .insert(users)
      .values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        bio: '',
        image: '',
      })
      .returning({
        email: users.email,
        username: users.username,
        bio: users.bio,
        image: users.image,
      })

    // Create a token
    const token = await generateToken({
      username: newUser.username,
      email: newUser.email,
    })

    return res.status(201).json({
      message: 'User created',
      user: {
        ...newUser,
        token,
      },
    })
  } catch (e) {
    console.error('Registration error \n', e)

    return res.status(422).json({
      errors: {
        body: 'Failed to create user',
      },
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const userData = req.body.user

    const email_ = userData.email
    const password_ = userData.password

    // check if email exist or not
    const [user] = await db.select().from(users).where(eq(users.email, email_))

    if (!user) {
      return res.status(403).json({
        error: 'Invalid credentials',
      })
    }

    const match = await comparePassword(password_, user.password)

    if (!match) {
      return res.status(403).json({
        error: 'Invalid credentials',
      })
    }

    const { createdAt, password, updatedAt, id, ...result } = user
    // Generate token
    const token = await generateToken({
      username: user.username,
      email: email_,
    })

    return res.status(200).json({
      message: 'Login successful',
      user: {
        ...result,
        token,
      },
    })
  } catch (e) {
    console.error('Login Failed \n', e)

    return res.status(422).json({
      errors: {
        body: 'Failed to login',
      },
    })
  }
}
