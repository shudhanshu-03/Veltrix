import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Note: StrictMode removed — GSAP animations not compatible with double-effect invocation
createRoot(document.getElementById('root')).render(
  <App />
)
