import type { ReactNode } from 'react'
import { RouterProvider as ReactRouterProvider } from 'react-router'

import { router } from '@/app/router'

type RouterProviderProps = {
  children?: ReactNode
}

export function RouterProvider({ children }: RouterProviderProps) {
  if (children) {
    return <>{children}</>
  }
  return <ReactRouterProvider router={router} />
}
