import type { Password, User } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

export async function getUserById (id: User['id']): Promise<User | null> {
  return await prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail (email: User['email']): Promise<User | null> {
  return await prisma.user.findUnique({ where: { email } })
}

export async function createUser (email: User['email'], password: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10)

  return await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword
        }
      }
    }
  })
}

export async function deleteUserByEmail (email: User['email']): Promise<User> {
  return await prisma.user.delete({ where: { email } })
}

export async function verifyLogin (
  email: User['email'],
  password: Password['hash']
): Promise<{
    id: string
    email: string
    createdAt: Date
    updatedAt: Date
  } | null> {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true
    }
  })

  if ((userWithPassword == null) || (userWithPassword.password == null)) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword

  return userWithoutPassword
}
