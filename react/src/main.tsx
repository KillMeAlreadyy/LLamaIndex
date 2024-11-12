import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChatButton from "./Chatbutton"


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatButton />
  </StrictMode>,
)
