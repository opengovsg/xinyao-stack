import { PassThrough } from 'stream'
import type { EntryContext } from '@remix-run/node'
import { Response } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import isbot from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'

const ABORT_DELAY = 5000

export default async function handleRequest (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
): Promise<unknown> {
  const callbackName = isbot(request.headers.get('user-agent'))
    ? 'onAllReady'
    : 'onShellReady'

  return await new Promise((resolve, reject) => {
    let didError = false

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        [callbackName]: () => {
          const body = new PassThrough()

          responseHeaders.set('Content-Type', 'text/html')

          resolve(
            new Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          )

          pipe(body)
        },
        onShellError: (err: unknown) => {
          reject(err)
        },
        onError: (error: unknown) => {
          didError = true

          console.error(error)
        }
      }
    )

    setTimeout(abort, ABORT_DELAY)
  })
}
