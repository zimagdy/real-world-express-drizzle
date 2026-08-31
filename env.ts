import { env as loadEnv } from 'custom-env'
import z from 'zod'

loadEnv()

// Declare validation with zod
const envSchema = z.object({
  DATABASE_URL: z.string().startsWith('postgresql://'),

  PORT: z.coerce.number().default(30401),

  JWT_SECRET: z.string().min(30, 'Jwt secret should be at least 10 characters'),

  JWT_EXPIRES_IN: z.string().default('2h'),

  BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
})

export type Env = z.infer<typeof envSchema>
let env: Env

try {
  env = envSchema.parse(process.env)
} catch (err) {
  if (err instanceof z.ZodError) {
    console.log('Invalid env')
    console.error(z.treeifyError(err))

    process.exit(1)
  }

  throw err
}

export { env }

export default env
