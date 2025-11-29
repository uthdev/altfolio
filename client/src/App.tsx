import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { InvestmentFormPage } from './pages/InvestmentFormPage';
import { InvestmentDetailPage } from './pages/InvestmentDetailPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <ProtectedRoute>
                <InvestmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/new"
            element={
              <ProtectedRoute requireAdmin>
                <InvestmentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <InvestmentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments/:id"
            element={
              <ProtectedRoute>
                <InvestmentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
