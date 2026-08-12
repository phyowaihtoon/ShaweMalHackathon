import { createBrowserRouter } from 'react-router'

import { adminRoutes } from './admin-routes'
import { publicRoutes } from './public-routes'

export const router = createBrowserRouter([publicRoutes, ...adminRoutes])
