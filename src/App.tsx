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
import InvoiceList from './pages/Invoices'
import ReceiptsTable from './pages/Receipts'
import Users from './pages/Users'
import SellerPage from './pages/Seller'
import CustomerPage from './pages/Customer'


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
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Home Page">
                    <HomePage />
                  </ResponsiveDrawer>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/scan" 
              element={
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Scan">
                    <ScannerPage />
                  </ResponsiveDrawer>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/receipt-edit" 
              element={
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Edit Receipt">
                    <ReceiptEdit />
                  </ResponsiveDrawer>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/receipt-progress" 
              element={
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Receipt Progress">
                    <ReceiptProgress />
                  </ResponsiveDrawer>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/receipt-details" 
              element={
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Receipt Details">
                    <ReceiptDetails />
                  </ResponsiveDrawer>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/receipt-completed" 
              element={
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Receipt Completed">
                    <ReceiptCompleted />
                  </ResponsiveDrawer>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoices" 
              element={
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Invoices">
                    <InvoiceList />
                  </ResponsiveDrawer>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/receipts" 
              element={
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Receipts">
                    <ReceiptsTable />
                  </ResponsiveDrawer>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Users">
                    <Users />
                  </ResponsiveDrawer>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sellers" 
              element={
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Sellers">
                    <SellerPage />
                  </ResponsiveDrawer>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customers" 
              element={
                <ProtectedRoute>
                  <ResponsiveDrawer heading="Customers">
                    <CustomerPage />
                  </ResponsiveDrawer>
                </ProtectedRoute>
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
