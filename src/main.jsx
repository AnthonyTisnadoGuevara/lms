import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
console.log("SUPABASE:", import.meta.env.VITE_SUPABASE_URL);
console.log("RESEND:", import.meta.env.VITE_RESEND_API_KEY);
