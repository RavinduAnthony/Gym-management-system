import './App.css'
import Login from './pages/Login'
import Registration from './pages/Registration'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import AddUser from './pages/AddUser'
import UserGrid from './pages/UserGrid'
import CoachDashboard from './pages/CoachDashboard'
import PackageManagement from './pages/PackageManagement'
import ExpenseManagement from './pages/ExpenseManagement'
import PaymentManagement from './pages/PaymentManagement'
import RevenueReport from './pages/RevenueReport'
import CoachManagement from './pages/CoachManagement'
import MyClients from './pages/MyClients'

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/adduser" element={<AddUser />} />
          <Route path="/usergrid" element={<UserGrid />} />
          <Route path="/coach-dashboard" element={<CoachDashboard />} />
          <Route path="/packages" element={<PackageManagement />} />
          <Route path="/expenses" element={<ExpenseManagement />} />
          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/revenue" element={<RevenueReport />} />
          <Route path="/coaches" element={<CoachManagement />} />
          <Route path="/my-clients" element={<MyClients />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
