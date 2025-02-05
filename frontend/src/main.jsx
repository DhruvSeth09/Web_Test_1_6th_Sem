import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import SignupPage from './pages/SignupPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

const rootElement = document.getElementById('root')
createRoot(rootElement).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/" element={<App />} />
      </Routes>
    </Router>
  </StrictMode>,
);