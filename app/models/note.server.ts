import type { User, Note, Prisma, PrismaPromise } from '@prisma/client'

import { prisma } from '~/db.server'

export type { Note } from '@prisma/client'

export function getNote ({
  id,
  userId
}: Pick<Note, 'id'> & {
  userId: User['id']
}): Prisma.Prisma__NoteClient<{
    id: string
    body: string
    title: string
  } | null, null> {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, userId }
  })
}

export function getNoteListItems ({ userId }: { userId: User['id'] }): PrismaPromise<Array<{
  id: string
  title: string
}>> {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: 'desc' }
  })
}

export function createNote ({
  body,
  title,
  userId
}: Pick<Note, 'body' | 'title'> & {
  userId: User['id']
}): Prisma.Prisma__NoteClient<Note, never> {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId
        }
      }
    }
  })
}

export function deleteNote ({
  id,
  userId
}: Pick<Note, 'id'> & { userId: User['id'] }): PrismaPromise<Prisma.BatchPayload> {
  return prisma.note.deleteMany({
    where: { id, userId }
  })
}
