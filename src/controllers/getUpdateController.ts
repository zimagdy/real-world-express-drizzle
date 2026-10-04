import type { Response } from 'express'
import db from '../db/connection.ts'
import { users } from '../db/schema.ts'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { eq } from 'drizzle-orm'
import { hashPassword } from '../utils/password.ts'
import { generateToken } from '../utils/jwt.ts'

// Get user
export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = req.user.username

    const [user] = await db
      .select({
        email: users.email,
        username: users.username,
        bio: users.bio,
        image: users.image,
      })
      .from(users)
      .where(eq(users.username, username))

    const token = await generateToken({
      username: username,
      email: user.email,
    })

    res.status(200).json({
      user: {
        ...user,
        token,
      },
    })
  } catch (e) {
    console.error('Get error ', e)

    res.status(403).json({
      error: 'Forbidden',
    })
  }
}

// Update user
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // This username and email from the token
    let username = req.user.username
    let email = req.user.email

    const userData = req.body

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    // first i need to check if the new password is empty or not

    let hashedPassword = user.password
    const password = userData.password

    if (password) hashedPassword = await hashPassword(password)

    // second check from new email and new username

    if (username !== userData.username.toLowerCase()) {
      const [existingUsername] = await db
        .select()
        .from(users)
        .where(eq(users.username, userData.username.toLowerCase()))
        .limit(1)

      if (existingUsername) {
        return res.status(409).json({
          error: 'Username or email already exists',
        })
      }
      username = userData.username
    }

    if (email !== userData.email.toLowerCase()) {
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email.toLowerCase()))
        .limit(1)

      if (existingEmail) {
        return res.status(409).json({
          error: 'Username or email already exists',
        })
      }
      email = userData.email
    }

    // third i will update the bio and and image without checks

    const bio = userData.bio
    const image = userData.image

    const [newuser] = await db
      .update(users)
      .set({
        username,
        email,
        password: hashedPassword,
        bio,
        image,
      })
      .where(eq(users.username, req.user.username))
      .returning({
        username: users.username,
        email: users.email,
        bio: users.bio,
        image: users.image,
      })

    const token = await generateToken({
      username: newuser.username,
      email: newuser.email,
    })

    return res.status(200).json({
      message: 'Updated successfully',
      user: {
        ...newuser,
        token,
      },
    })
  } catch (e) {
    console.error('Updated Failed ', e)
    res.status(400).json({
      errors: {
        body: 'Updated Failed',
      },
    })
  }
}
