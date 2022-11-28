import { User } from '@prisma/client'
import type { LinksFunction, LoaderArgs, MetaFunction, TypedResponse } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'

import { getUser } from './session.server'
import tailwindStylesheetUrl from './styles/tailwind.css'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tailwindStylesheetUrl }]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Remix Notes',
  viewport: 'width=device-width,initial-scale=1'
})

export async function loader ({ request }: LoaderArgs): Promise<TypedResponse<{
  user: User | null
}>> {
  return json({
    user: await getUser(request)
  })
}

export default function App (): JSX.Element {
  return (
    <html lang='en' className='h-full'>
      <head>
        <Meta />
        <Links />
      </head>
      <body className='h-full'>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
