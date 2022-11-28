import type { ActionArgs, TypedResponse } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { logout } from '~/session.server'

export async function action ({ request }: ActionArgs): Promise<TypedResponse<never>> {
  return await logout(request)
}

export async function loader (): Promise<TypedResponse<never>> {
  return redirect('/')
}
