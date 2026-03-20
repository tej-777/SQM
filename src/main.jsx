import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { swManager } from './utils/serviceWorker.js'

// Register Service Worker for background notifications
if ('serviceWorker' in navigator) {
  swManager.register().then(success => {
    if (success) {
      console.log('📱 Service Worker registered successfully');
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
