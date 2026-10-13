import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import 'bootstrap/scss/bootstrap.scss';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 

import './App.css'

createRoot(document.getElementById('root')!).render(
  <App />
)
