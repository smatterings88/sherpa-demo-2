import { Outlet } from 'react-router-dom'
import { SherpaChatWidget } from './components/chat/SherpaChatWidget'

export default function App() {
  return (
    <>
      <Outlet />
      <SherpaChatWidget />
    </>
  )
}
