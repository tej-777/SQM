import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import MedicalProblem from './pages/medical-problem'
import PatientDashboardSimple from './pages/patient-dashboard'
import StaffLogin from './pages/staff-login'
import StaffDashboard from './pages/staff-dashboard'
import HospitalRegistration from './pages/hospital-registration'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/medical-problem" element={<MedicalProblem />} />
        <Route path="/patient-dashboard" element={<PatientDashboardSimple />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/hospital-registration" element={<HospitalRegistration />} />
      </Routes>
    </Router>
  )
}

export default App
