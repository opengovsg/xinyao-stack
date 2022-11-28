import type { ActionArgs, TypedResponse } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import * as React from 'react'

import { createNote } from '~/models/note.server'
import { requireUserId } from '~/session.server'

export async function action ({ request }: ActionArgs): Promise<TypedResponse<{
  errors: {
    title: string
    body: null
  }
}> | TypedResponse<{
  errors: {
    body: string
    title: null
  }
}>> {
  const userId = await requireUserId(request)

  const formData = await request.formData()
  const title = formData.get('title')
  const body = formData.get('body')

  if (typeof title !== 'string' || title.length === 0) {
    return json(
      { errors: { title: 'Title is required', body: null } },
      { status: 400 }
    )
  }

  if (typeof body !== 'string' || body.length === 0) {
    return json(
      { errors: { body: 'Body is required', title: null } },
      { status: 400 }
    )
  }

  const note = await createNote({ title, body, userId })

  return redirect(`/notes/${note.id}`)
}

export default function NewNotePage (): JSX.Element {
  const actionData = useActionData<typeof action>()
  const titleRef = React.useRef<HTMLInputElement>(null)
  const bodyRef = React.useRef<HTMLTextAreaElement>(null)
  const errors = actionData?.errors

  React.useEffect(() => {
    if (![undefined, null, ''].includes(errors?.title)) {
      titleRef.current?.focus()
    } else if (![undefined, null, ''].includes(errors?.body)) {
      bodyRef.current?.focus()
    }
  }, [actionData])

  return (
    <Form
      method='post'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%'
      }}
    >
      <div>
        <label className='flex w-full flex-col gap-1'>
          <span>Title: </span>
          <input
            ref={titleRef}
            name='title'
            className='flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose'
            aria-invalid={![undefined, null, ''].includes(errors?.title) ? true : undefined}
            aria-errormessage={
              ![undefined, null, ''].includes(errors?.title) ? 'title-error' : undefined
            }
          />
        </label>
        {errors?.title !== undefined && (
          <div className='pt-1 text-red-700' id='title-error'>
            {errors.title}
          </div>
        )}
      </div>

      <div>
        <label className='flex w-full flex-col gap-1'>
          <span>Body: </span>
          <textarea
            ref={bodyRef}
            name='body'
            rows={8}
            className='w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6'
            aria-invalid={![undefined, null, ''].includes(errors?.body) ? true : undefined}
            aria-errormessage={
              ![undefined, null, ''].includes(errors?.body) ? 'body-error' : undefined
            }
          />
        </label>
        {errors?.body !== undefined && (
          <div className='pt-1 text-red-700' id='body-error'>
            {errors.body}
          </div>
        )}
      </div>

      <div className='text-right'>
        <button
          type='submit'
          className='rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400'
        >
          Save
        </button>
      </div>
    </Form>
  )
}
