import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { initAnalytics, trackPageView } from '@/lib/analytics'

import SqueezePage from '@/pages/funnel/SqueezePage'
import ThankYouPage from '@/pages/funnel/ThankYouPage'

import SiteLayout from '@/layouts/SiteLayout'
import HomePage from '@/pages/site/HomePage'
import AboutPage from '@/pages/site/AboutPage'
import ServicesPage from '@/pages/site/ServicesPage'
import ContactPage from '@/pages/site/ContactPage'

import AdminLayout from '@/layouts/AdminLayout'
import LoginPage from '@/pages/admin/LoginPage'
import SetupWizard from '@/pages/admin/SetupWizard'
import DashboardPage from '@/pages/admin/DashboardPage'
import AssistantPage from '@/pages/admin/AssistantPage'
import ContactsPage from '@/pages/admin/ContactsPage'
import InboxPage from '@/pages/admin/InboxPage'
import DealsPage from '@/pages/admin/DealsPage'
import ProjectsPage from '@/pages/admin/ProjectsPage'
import BookingPage from '@/pages/admin/BookingPage'
import WorkflowsPage from '@/pages/admin/WorkflowsPage'
import ReportsPage from '@/pages/admin/ReportsPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { signedIn } = useAuth()
  const location = useLocation()
  if (!signedIn) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

function AnalyticsMount() {
  const location = useLocation()
  useEffect(() => {
    initAnalytics()
  }, [])
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <AnalyticsMount />
      <Routes>
        {/* Part A: the funnel. Two routes only, no nav, no footer links. */}
        <Route path="/" element={<SqueezePage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />

        {/* Part B: the website. Primary CTA points back to the funnel. */}
        <Route element={<SiteLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Part C: the CRM, behind login. */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="setup" element={<SetupWizard />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
