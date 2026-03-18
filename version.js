import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import PeoplePage from './pages/PeoplePage'
import ClientsPage from './pages/ClientsPage'
import MachinesPage from './pages/MachinesPage'
import PaymentsPage from './pages/PaymentsPage'
import VenuesPage from './pages/VenuesPage'
import PerformersPage from './pages/PerformersPage'
import TransportPage from './pages/TransportPage'
import CoOwnersPage from './pages/CoOwnersPage'
import ProfitSplitPage from './pages/ProfitSplitPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="events"       element={<EventsPage />} />
        <Route path="events/:id"   element={<EventDetailPage />} />
        <Route path="people"       element={<PeoplePage />} />
        <Route path="clients"      element={<ClientsPage />} />
        <Route path="machines"     element={<MachinesPage />} />
        <Route path="payments"     element={<PaymentsPage />} />
        <Route path="venues"       element={<VenuesPage />} />
        <Route path="performers"   element={<PerformersPage />} />
        <Route path="transport"    element={<TransportPage />} />
        <Route path="co-owners"    element={<CoOwnersPage />} />
        <Route path="profit-split" element={<ProfitSplitPage />} />
      </Route>
    </Routes>
  )
}
