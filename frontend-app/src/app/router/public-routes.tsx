import type { RouteObject } from 'react-router'

import { SignInPage } from '@/features/auth/pages/SignInPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'
import { AgentHouseFormPage } from '@/features/agent/pages/AgentHouseFormPage'
import { AgentHousesPage } from '@/features/agent/pages/AgentHousesPage'
import { AgentBookingsPage } from '@/features/agent/pages/AgentBookingsPage'
import { AgentRegisterPage } from '@/features/agent/pages/AgentRegisterPage'
import { DriverJobsPage } from '@/features/driver/pages/DriverJobsPage'
import { DriverRegisterPage } from '@/features/driver/pages/DriverRegisterPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { FindingHousePage } from '@/features/houses/pages/FindingHousePage'
import { HouseDetailsPage } from '@/features/houses/pages/HouseDetailsPage'
import { BookingConfirmationPage } from '@/features/houses/pages/BookingConfirmationPage'
import { HireMovingPage } from '@/features/moving/pages/HireMovingPage'
import { MovingRequestDetailPage } from '@/features/moving/pages/MovingRequestDetailPage'
import { MovingStatusListPage } from '@/features/moving/pages/MovingStatusListPage'
import { MovingStatusPage } from '@/features/moving/pages/MovingStatusPage'
import { HistoryPage } from '@/features/profile/pages/HistoryPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { WishlistPage } from '@/features/profile/pages/WishlistPage'
import { PublicLayout } from '@/features/public/layout/PublicLayout'
import { AboutUsPage } from '@/features/public/pages/AboutUsPage'
import { FindingRoommatesPage } from '@/features/roommates/pages/FindingRoommatesPage'

export const publicRoutes: RouteObject = {
  path: '/',
  element: <PublicLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'about-us', element: <AboutUsPage /> },
    { path: 'agent-register', element: <AgentRegisterPage /> },
    { path: 'agent/houses', element: <AgentHousesPage /> },
    { path: 'agent/houses/new', element: <AgentHouseFormPage /> },
    { path: 'agent/houses/:id/edit', element: <AgentHouseFormPage /> },
    { path: 'agent/bookings', element: <AgentBookingsPage /> },
    { path: 'driver-register', element: <DriverRegisterPage /> },
    { path: 'sign-up', element: <SignUpPage /> },
    { path: 'sign-in', element: <SignInPage /> },
    { path: 'finding-house', element: <FindingHousePage /> },
    { path: 'houses/:id', element: <HouseDetailsPage /> },
    { path: 'houses/:id/bookings/:bookingId/confirmation', element: <BookingConfirmationPage /> },
    { path: 'hire-moving', element: <HireMovingPage /> },
    { path: 'hire-moving/:id', element: <MovingRequestDetailPage /> },
    { path: 'moving-status', element: <MovingStatusListPage /> },
    { path: 'moving-status/:id', element: <MovingStatusPage /> },
    { path: 'finding-roommates', element: <FindingRoommatesPage /> },
    { path: 'profile', element: <ProfilePage /> },
    { path: 'profile/wishlist', element: <WishlistPage /> },
    { path: 'profile/history', element: <HistoryPage /> },
    { path: 'driver/jobs', element: <DriverJobsPage /> },
    { path: 'driver/jobs/:id', element: <DriverJobsPage /> },
  ],
}
