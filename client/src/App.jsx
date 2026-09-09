import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { QueryProvider } from './context/QueryProvider';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import FilesPage from './pages/FilesPage';
import FileViewerPage from './pages/FileViewerPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <QueryProvider>
            <ConfirmProvider>
              <BrowserRouter>
                <AuthProvider>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route
                      path="/files"
                      element={
                        <ProtectedRoute>
                          <FilesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/file/:fileId"
                      element={
                        <ProtectedRoute>
                          <FileViewerPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/" element={<Navigate to="/files" replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </AuthProvider>
              </BrowserRouter>
            </ConfirmProvider>
          </QueryProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
