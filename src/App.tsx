import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'
import HomePage from './pages/home'
import ResponsiveDrawer from './components/Drawer'
import ScannerPage from './pages/Scan'
import ReceiptProgress from './pages/ReceiptProgress'
import ReceiptEdit from './pages/ReceiptEdit'
import ReceiptDetails from './pages/ReceiptDetails'
import ReceiptCompleted from './pages/ReceiptCompleted'


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                  <ResponsiveDrawer heading="Home Page">
                    <HomePage />
                  </ResponsiveDrawer>
              } 
            />
            <Route 
              path="/scan" 
              element={
                  <ResponsiveDrawer heading="Home Page">
                    <ScannerPage />
                  </ResponsiveDrawer>
              } 
            />
            <Route 
              path="/receipt-edit" 
              element={
                  <ResponsiveDrawer heading="Home Page">
                    <ReceiptEdit />
                  </ResponsiveDrawer>
              } 
            />
            <Route 
              path="/receipt-progress" 
              element={
                  <ResponsiveDrawer heading="Home Page">
                    <ReceiptProgress />
                  </ResponsiveDrawer>
              } 
            />
            <Route 
              path="/receipt-details" 
              element={
                  <ResponsiveDrawer heading="Home Page">
                    <ReceiptDetails />
                  </ResponsiveDrawer>
              } 
            />
            <Route 
              path="/receipt-completed" 
              element={
                  <ResponsiveDrawer heading="Home Page">
                    <ReceiptCompleted />
                  </ResponsiveDrawer>
              } 
            />
    
            {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
