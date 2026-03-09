import React from 'react'
import Home from './pages/home.jsx'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar.jsx'
import About from './pages/about.jsx'
import Contact from './pages/contact.jsx'
import Profile from './pages/Profile.jsx'
import History from './pages/history.jsx'
import Status from './pages/status.jsx'
import Activity from './pages/activity.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import AboutPage from './pages/about.jsx'
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/admin/Dashboard';
import DashboardProfile from './pages/admin/Profile';
import Appointments from './pages/admin/Appointments';
import RevenueReport from './pages/admin/revenueandreport.jsx'
import Staff from './pages/admin/staff.jsx'
import Services from './pages/admin/Services.jsx'
import Receptionist from './pages/admin/receptionist'
import Settings from './pages/admin/settings.jsx'
import Reviews from './pages/admin/rating.jsx'
import Plans_and_pricing from './pages/plans-and-pricing.jsx'
import BookAppointment from './pages/BookAppointment.jsx'

// New pages
import Earning from './pages/admin/Earning.jsx'
import Walkin from './pages/admin/Walkin.jsx'
import Clients from './pages/admin/Clients.jsx'
import Inventory from './pages/admin/Inventory.jsx'
import Expenses from './pages/admin/Expenses.jsx'
import Offers from './pages/admin/Offers.jsx'
import Attendance from './components/Attendance.jsx'

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute.jsx'

import { SalonProvider } from './context/SalonContext';

function App() {

  return (
    <SalonProvider>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/status' element={<Status />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/profile/history' element={<History />} />
        <Route path='/profile/activity' element={<Activity />} />
        <Route path='/plans-and-pricing' element={<Plans_and_pricing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/book-appointment' element={<BookAppointment />} />

        {/* Dashboard routes with layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<ProtectedRoute tabId="dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute tabId="settings"><Settings /></ProtectedRoute>} />
          <Route path="reviews" element={<ProtectedRoute tabId="reviews"><Reviews /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute tabId="profile"><DashboardProfile /></ProtectedRoute>} />
          <Route path="appointments" element={<ProtectedRoute tabId="appointment"><Appointments /></ProtectedRoute>} />
          <Route path="services" element={<ProtectedRoute tabId="services"><Services /></ProtectedRoute>} />
          <Route path="staff" element={<ProtectedRoute tabId="staff"><Staff /></ProtectedRoute>} />
          <Route path="revenue-and-report" element={<ProtectedRoute tabId="revenue-and-report"><RevenueReport /></ProtectedRoute>} />
          <Route path="receptionist" element={<ProtectedRoute tabId="receptionist"><Receptionist /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute tabId="receptionist"><Attendance /></ProtectedRoute>} />

          {/* New pages */}
          <Route path="earning" element={<ProtectedRoute tabId="earning"><Earning /></ProtectedRoute>} />
          <Route path="walkin" element={<ProtectedRoute tabId="walkin"><Walkin /></ProtectedRoute>} />
          <Route path="clients" element={<ProtectedRoute tabId="client"><Clients /></ProtectedRoute>} />
          <Route path="inventory" element={<ProtectedRoute tabId="inventory"><Inventory /></ProtectedRoute>} />
          <Route path="expenses" element={<ProtectedRoute tabId="expenses"><Expenses /></ProtectedRoute>} />
          <Route path="offers" element={<ProtectedRoute tabId="offers"><Offers /></ProtectedRoute>} />
        </Route>
      </Routes>
    </SalonProvider>
  )
}

export default App
