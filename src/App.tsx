import { Route, Routes, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { DashboardPage } from './pages/DashboardPage'
import { SpecialQuestionsPage } from './pages/SpecialQuestionsPage'
import { RankingPage } from './pages/RankingPage'
import { AdminPage } from './pages/AdminPage'
import { PhoneLoginPage } from './pages/PhoneLoginPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ParticipantProvider } from './contexts/ParticipantContext'
import { ToastProvider } from './contexts/ToastContext'

function App() {
  return (
    <ToastProvider>
      <ParticipantProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<PhoneLoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Redirigimos la ruta antigua a la nueva ubicación unificada */}
            <Route path="/pronosticos" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/especiales"
              element={
                <ProtectedRoute>
                  <SpecialQuestionsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/ranking" element={<RankingPage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </ParticipantProvider>
    </ToastProvider>
  )
}


export default App
