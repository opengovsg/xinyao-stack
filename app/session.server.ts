import { createCookieSessionStorage, redirect, Session, TypedResponse } from '@remix-run/node'
import invariant from 'tiny-invariant'

import type { User } from '~/models/user.server'
import { getUserById } from '~/models/user.server'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production'
  }
})

const USER_SESSION_KEY = 'userId'

export async function getSession (request: Request): Promise<Session> {
  const cookie = request.headers.get('Cookie')
  return await sessionStorage.getSession(cookie)
}

export async function getUserId (
  request: Request
): Promise<User['id'] | undefined> {
  const session = await getSession(request)
  const userId = session.get(USER_SESSION_KEY)
  return userId
}

export async function getUser (request: Request): Promise<User | null> {
  const userId = await getUserId(request)
  if (userId === undefined) return null

  const user = await getUserById(userId)
  if (user != null) return user

  throw await logout(request)
}

export async function requireUserId (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<string> {
  const userId = await getUserId(request)
  if (userId === undefined || userId === '') {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw redirect(`/login?${searchParams.toString()}`)
  }
  return userId
}

export async function requireUser (request: Request): Promise<User> {
  const userId = await requireUserId(request)

  const user = await getUserById(userId)
  if (user != null) return user
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw await logout(request)
}

export async function createUserSession ({
  request,
  userId,
  remember,
  redirectTo
}: {
  request: Request
  userId: string
  remember: boolean
  redirectTo: string
}): Promise<TypedResponse<never>> {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined
      })
    }
  })
}

export async function logout (request: Request): Promise<TypedResponse<never>> {
  const session = await getSession(request)
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session)
    }
  })
}
